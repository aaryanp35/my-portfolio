/* The drive: one scroll system. A paused master timeline holds every world layer; scroll progress (smoothed) drives it.
   The mile counter, the route dot (MotionPath) and the HUD read the same progress.
   Reduced motion, or no GSAP: a complete static drive that swaps scene states per stretch, never moves a layer. */
(function () {
  'use strict';

  var html = document.documentElement;
  var world = document.getElementById('world');
  var mileEl = document.getElementById('mile');
  var placeEl = document.getElementById('place');
  var dotEl = document.getElementById('route-dot');
  var pathEl = document.getElementById('route-path');
  var lineEl = document.getElementById('centerline');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.hud__nav a'));
  var stretchEls = Array.prototype.slice.call(document.querySelectorAll('[data-stretch][data-mile-from]'));

  var TOTAL_MILES = 30;
  var PLACES = {
    'merge': 'San Francisco',
    'crystal-springs': 'Daly City',
    'daly-city': 'Crystal Springs',
    'serra': 'Junipero Serra',
    'stanford': 'Stanford hills',
    'sand-hill': 'Sand Hill Road'
  };

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function maxScroll() { return Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }
  function layer(name) { return document.querySelector('[data-layer="' + name + '"]'); }

  /* ---- scroll to mile: sections are the anchors, piecewise linear in scroll space ---- */
  var anchors = []; // {y, mile, id}
  function measure() {
    var vh = window.innerHeight;
    var max = maxScroll();
    anchors = [{ y: 0, mile: 0, id: 'merge' }];
    stretchEls.forEach(function (el, i) {
      if (i === 0) return;
      var top = el.getBoundingClientRect().top + window.scrollY;
      var y = clamp(top - vh * 0.5, 0, max);
      var prev = anchors[anchors.length - 1];
      anchors.push({ y: Math.max(y, prev.y + 1), mile: +el.getAttribute('data-mile-from'), id: el.getAttribute('data-stretch') });
    });
    anchors.push({ y: max, mile: TOTAL_MILES, id: anchors[anchors.length - 1].id });
  }
  function mileAt(y) {
    if (!anchors.length) measure();
    for (var i = 0; i < anchors.length - 1; i++) {
      var a = anchors[i], b = anchors[i + 1];
      if (y <= b.y) return { mile: lerp(a.mile, b.mile, clamp((y - a.y) / Math.max(1, b.y - a.y), 0, 1)), id: a.id };
    }
    return { mile: TOTAL_MILES, id: anchors[anchors.length - 1].id };
  }

  var lastText = '', lastId = '';
  function paintHud(y) {
    var m = mileAt(y);
    var txt = m.mile.toFixed(1);
    if (mileEl && txt !== lastText) { mileEl.textContent = txt; lastText = txt; }
    if (m.id !== lastId) {
      lastId = m.id;
      if (placeEl) placeEl.textContent = PLACES[m.id] || '';
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + m.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
    return m;
  }

  /* ---- static drive: reduced motion, or the libraries never arrived ---- */
  function staticDrive() {
    html.classList.add('reveal-all', 'drive-static', 'drive-ready');
    var ticking = false;
    var pathLen = pathEl && pathEl.getTotalLength ? pathEl.getTotalLength() : 0;

    function paint() {
      ticking = false;
      var m = paintHud(window.scrollY);
      if (world && world.getAttribute('data-stretch') !== m.id) world.setAttribute('data-stretch', m.id);
      if (dotEl && pathLen) {
        var pt = pathEl.getPointAtLength(pathLen * clamp(m.mile / TOTAL_MILES, 0, 1));
        dotEl.setAttribute('cx', pt.x.toFixed(2));
        dotEl.setAttribute('cy', pt.y.toFixed(2));
      }
    }
    function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(paint); } }
    function onResize() { measure(); onScroll(); }

    measure();
    paint();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);
    return function () {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
    };
  }

  /* ---- the full drive ---- */
  function fullDrive(gsap, ScrollTrigger) {
    html.classList.add('drive-ready');
    html.classList.remove('drive-static');
    /* Phones: the toolbar growing and shrinking must not re-measure the whole drive. */
    ScrollTrigger.config({ ignoreMobileResize: true });

    var lenis = null;
    var fine = window.matchMedia('(pointer: fine)').matches;
    var touch = window.matchMedia('(pointer: coarse)').matches;
    if (window.Lenis && fine) {
      lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, anchors: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(lenis.raf ? function (t) { lenis.raf(t * 1000); } : function () {});
      gsap.ticker.lagSmoothing(0);
    }

    /* reveals: ink settle, once */
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 92%',
      once: true,
      onEnter: function (els) {
        gsap.to(els, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out', stagger: 0.09, overwrite: true });
      }
    });

    /* fog drifts sideways on its own slow loop, independent of scroll */
    var drifts = [];
    (touch ? [] : [['a', 36], ['b', 42], ['c', 45]]).forEach(function (f, i) {
      var el = document.querySelector('[data-fog="' + f[0] + '"] .layer__drift');
      if (!el) return;
      drifts.push(gsap.fromTo(el, { xPercent: i % 2 ? 5 : -5 }, { xPercent: i % 2 ? -5 : 5, duration: f[1], ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    });

    var tl = null;
    var dotTween = null;
    var target = 0, cur = 0, ticked = false;

    function frac(el, offsetVh) {
      var top = el.getBoundingClientRect().top + window.scrollY;
      return clamp((top - window.innerHeight * (offsetVh == null ? 0.5 : offsetVh)) / maxScroll(), 0, 1);
    }

    function build() {
      measure();
      var vw = window.innerWidth, vh = window.innerHeight;
      if (tl) tl.kill();
      tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

      /* Document order is the drive: Selected work (#crystal-springs) is the first stretch and carries the
         fog; Experience (#daly-city) is the second and carries the reservoir. Anchors follow position, not name. */
      var pDaly = frac(document.getElementById('crystal-springs'));
      var pCS = frac(document.getElementById('daly-city'));
      var pSerra = frac(document.getElementById('serra'));
      var pStan = frac(document.getElementById('stanford'));

      /* hills: parallax by depth, each travels its own overflow */
      ['mtn', 'gold-far', 'oak', 'gold-near'].forEach(function (n) {
        var el = layer(n);
        if (!el) return;
        gsap.set(el, { x: 0 });
        tl.fromTo(el, { x: 0 }, { x: -Math.max(0, el.offsetWidth - vw), duration: 1 }, 0);
      });

      /* the city falls behind early */
      var sky = layer('skyline');
      if (sky) { gsap.set(sky, { x: 0, opacity: 1 }); tl.fromTo(sky, { x: 0, opacity: 1 }, { x: -vw * 0.55, opacity: 0, duration: Math.max(0.08, pDaly + 0.06) }, 0); }

      /* horizon light warms as you head south */
      var warm = layer('warm'), skyWarm = layer('sky-warm'), sun = layer('sun');
      if (warm) { gsap.set(warm, { opacity: 0 }); tl.fromTo(warm, { opacity: 0 }, { opacity: 1, duration: 1 }, 0); }
      if (skyWarm) { gsap.set(skyWarm, { opacity: 0 }); tl.fromTo(skyWarm, { opacity: 0 }, { opacity: 1, duration: 0.95 }, 0); }
      if (sun) {
        tl.fromTo(sun, { y: vh * 0.06 }, { y: -vh * 0.1, duration: 1 }, 0);
        var sw = sun.querySelector('#sun-warm'), sc = sun.querySelector('#sun-cool');
        if (sw) tl.fromTo(sw, { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0);
        if (sc) tl.fromTo(sc, { opacity: 1 }, { opacity: 0.35, duration: 0.9 }, 0);
      }

      /* Karl the Fog: thick near the city, thin by Crystal Springs, gone by the end */
      [['a', 1, 0.95, 0.1], ['b', 0.85, 0.9, 0.07], ['c', 0.7, 0.82, 0.04]].forEach(function (f) {
        var el = document.querySelector('[data-fog="' + f[0] + '"]');
        if (!el) return;
        var d = Math.max(0.1, pCS * f[1]);
        gsap.set(el, { opacity: f[2] });
        tl.fromTo(el, { opacity: f[2] }, { opacity: f[3], duration: d, ease: 'power2.out' }, 0);
        tl.to(el, { opacity: 0, duration: Math.max(0.01, 1 - d) }, d);
      });

      /* the reservoir slides past through Crystal Springs and the rest area */
      var res = layer('reservoir');
      if (res) {
        var rs = Math.max(0, pCS - 0.05), re = Math.min(1, pStan + 0.02);
        gsap.set(res, { x: vw * 1.05 });
        tl.fromTo(res, { x: vw * 1.05 }, { x: -res.offsetWidth - vw * 0.05, duration: Math.max(0.05, re - rs) }, rs);
      }

      /* the Stanford dish rises into view on the right and stays */
      var dish = layer('dish');
      if (dish) {
        var ds = Math.max(0, pStan - 0.06);
        gsap.set(dish, { x: vw * 1.1 });
        tl.fromTo(dish, { x: vw * 1.1 }, { x: vw * 0.7, duration: Math.max(0.05, 0.1), ease: 'power2.out' }, ds);
        tl.to(dish, { x: vw * 0.62, duration: Math.max(0.01, 1 - ds - 0.1) }, ds + 0.1);
      }

      /* road centerline: dashes stream past with scroll */
      if (lineEl) {
        gsap.set(lineEl, { strokeDashoffset: 0 });
        tl.fromTo(lineEl, { strokeDashoffset: 0 }, { strokeDashoffset: 9000, duration: 1 }, 0);
      }

      tl.progress(cur);
      ticked = false;
    }

    /* route dot rides the miniature of the drive with MotionPath */
    if (dotEl && pathEl && window.MotionPathPlugin) {
      dotTween = gsap.to(dotEl, {
        motionPath: { path: pathEl, align: pathEl, alignOrigin: [0.5, 0.5] },
        ease: 'none', duration: 1, paused: true
      });
    }

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: function (self) { target = self.progress; ticked = false; }
    });

    function tick() {
      var d = target - cur;
      if (d === 0 && ticked) return; /* at rest: nothing to repaint */
      ticked = true;
      cur = Math.abs(d) < 0.00004 ? target : cur + d * 0.2;
      if (tl) tl.progress(cur);
      var m = paintHud(cur * maxScroll());
      if (dotTween) dotTween.progress(clamp(m.mile / TOTAL_MILES, 0, 1));
      else if (dotEl && pathEl && pathEl.getTotalLength) {
        var pt = pathEl.getPointAtLength(pathEl.getTotalLength() * clamp(m.mile / TOTAL_MILES, 0, 1));
        dotEl.setAttribute('cx', pt.x); dotEl.setAttribute('cy', pt.y);
      }
    }
    gsap.ticker.add(tick);

    ScrollTrigger.addEventListener('refresh', build);
    build();
    target = cur = clamp(window.scrollY / maxScroll(), 0, 1);
    tl.progress(cur);
    ScrollTrigger.refresh();

    return function () {
      ScrollTrigger.removeEventListener('refresh', build);
      gsap.ticker.remove(tick);
      drifts.forEach(function (t) { t.kill(); });
      if (tl) tl.kill();
      if (dotTween) dotTween.kill();
      if (lenis) { lenis.destroy(); lenis = null; }
    };
  }

  /* ---- boot ---- */
  function boot() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) { staticDrive(); return; }
    gsap.registerPlugin(ScrollTrigger);
    if (window.MotionPathPlugin) gsap.registerPlugin(window.MotionPathPlugin);

    var mm = gsap.matchMedia();
    mm.add({ calm: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, function (ctx) {
      if (ctx.conditions.reduce) return staticDrive();
      return fullDrive(gsap, ScrollTrigger);
    });

    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
