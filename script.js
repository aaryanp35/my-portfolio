/* Aaryan Patel: the sheet.
   The trail, the scale bar and the section readout work without any library.
   Motion (GSAP, ScrollTrigger, MotionPathPlugin, Lenis) runs only when those loaded,
   the page still has the "js" class, and the visitor has not asked for reduced motion.
   One scroll-linked system drives it: the route marker, the deepened contour band,
   the scale bar, the compass and the fog. */
(function () {
  'use strict';

  var html = document.documentElement;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var NS = 'http://www.w3.org/2000/svg';
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var sheet = $('#sheet');
  var routeSvg = $('.route');
  var frame = $('.frame');
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  var route = null;
  var lenis = null;

  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function syncReduce() { html.classList.toggle('reduce-motion', reduceMQ.matches); }
  syncReduce();
  if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', syncReduce);

  /* ---------- The trail: a path drawn through every numbered waypoint ---------- */

  function buildRoute() {
    if (!sheet || !routeSvg) return null;
    var sr = sheet.getBoundingClientRect();
    var th = $('.trailhead');
    var rev = $('.revision');
    var discs = $$('.wp');
    if (!th || !rev || !discs.length || sr.width < 10) return null;

    function center(el, top) {
      var r = el.getBoundingClientRect();
      return { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + (top ? 0 : r.height / 2) };
    }
    var pts = [];
    var start = center(th, true);
    discs.forEach(function (d) { pts.push(center(d)); });
    var gx = pts[0].x;
    start.x = gx;
    pts.unshift(start);
    var rr = rev.getBoundingClientRect();
    pts.push({ x: gx, y: rr.top - sr.top + 40 });

    var gutter = parseFloat(getComputedStyle(sheet).getPropertyValue('--gutter')) || 128;
    var k = gutter / 128;
    var amps = [34, -22, 40, -28, 26, -34, 30, -20, 38, -26, 24, -32, 36, -24, 30, -28];
    var d = 'M' + gx.toFixed(1) + ' ' + start.y.toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1];
      var dy = b.y - a.y;
      if (dy < 4) continue;
      var amp = amps[i % amps.length] * k;
      var mx = a.x + amp, my = a.y + dy / 2;
      d += 'C' + a.x.toFixed(1) + ' ' + (a.y + dy * 0.28).toFixed(1) + ' ' + mx.toFixed(1) + ' ' + (my - dy * 0.18).toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1);
      d += 'C' + mx.toFixed(1) + ' ' + (my + dy * 0.18).toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + (b.y - dy * 0.28).toFixed(1) + ' ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
    }

    routeSvg.setAttribute('viewBox', '0 0 ' + sr.width.toFixed(1) + ' ' + sr.height.toFixed(1));
    while (routeSvg.firstChild) routeSvg.removeChild(routeSvg.firstChild);
    function el(name, attrs) {
      var n = document.createElementNS(NS, name);
      for (var key in attrs) n.setAttribute(key, attrs[key]);
      routeSvg.appendChild(n);
      return n;
    }
    el('path', { 'class': 'casing', d: d });
    var path = el('path', { 'class': 'trail', d: d, id: 'trail-path' });
    var end = pts[pts.length - 1];
    el('path', { 'class': 'trail-end', d: 'M' + (end.x - 9) + ' ' + (end.y + 7) + 'L' + end.x + ' ' + (end.y - 9) + 'L' + (end.x + 9) + ' ' + (end.y + 7) + 'Z', fill: 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': '1.5' });
    var marker = el('g', { 'class': 'marker' });
    var ring = document.createElementNS(NS, 'circle');
    ring.setAttribute('class', 'marker-ring'); ring.setAttribute('r', '11');
    var dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('class', 'marker-dot'); dot.setAttribute('r', '5');
    marker.appendChild(ring); marker.appendChild(dot);
    marker.setAttribute('transform', 'translate(' + gx.toFixed(1) + ' ' + start.y.toFixed(1) + ')');

    /* y along the path, sampled once, so the marker can sit on the reading line */
    var total = path.getTotalLength();
    var n = Math.max(40, Math.ceil(total / 5));
    var ys = new Float32Array(n + 1);
    for (var s = 0; s <= n; s++) ys[s] = path.getPointAtLength(total * s / n).y;

    html.classList.add('has-route');
    return {
      path: path, marker: marker, start: start, end: end, ys: ys, n: n,
      discs: discs.map(function (dEl, idx) { return { el: dEl, item: dEl.parentNode, y: pts[idx + 1].y }; }),
      fracAtY: function (y) {
        var lo = 0, hi = n;
        while (lo < hi) { var m = (lo + hi) >> 1; if (ys[m] < y) lo = m + 1; else hi = m; }
        return lo / n;
      }
    };
  }

  /* ---------- Scale bar: scroll progress and the current section ---------- */

  var secs = [];
  function measureSections() {
    var docTop = window.pageYOffset;
    secs = $$('.scale a').map(function (a) {
      var id = a.getAttribute('data-sec');
      var target = id === 'top' ? $('#top') : $('#' + id);
      if (!target) return null;
      var r = target.getBoundingClientRect();
      return { a: a, bar: $('b', a), top: r.top + docTop, bottom: r.bottom + docTop };
    }).filter(Boolean);
    for (var i = 0; i < secs.length; i++) {
      secs[i].top = i === 0 ? 0 : secs[i].top - 40;
      secs[i].bottom = i < secs.length - 1 ? secs[i + 1].top + 0 : document.documentElement.scrollHeight;
    }
    for (var j = 0; j < secs.length - 1; j++) secs[j].bottom = secs[j + 1].top;
  }

  var ticking = false;
  function updateReadout() {
    ticking = false;
    var vh = window.innerHeight;
    var max = Math.max(1, document.documentElement.scrollHeight - vh);
    var y = window.pageYOffset;
    var line = y + vh * (0.35 + 0.65 * clamp(y / max, 0, 1));
    var current = secs.length ? secs[0] : null;
    secs.forEach(function (s) {
      var p = clamp((line - s.top) / Math.max(1, s.bottom - s.top), 0, 1);
      s.bar.style.setProperty('--p', p.toFixed(3));
      s.bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      if (line >= s.top) current = s;
    });
    secs.forEach(function (s) {
      var on = s === current;
      s.a.classList.toggle('is-current', on);
      if (on) s.a.setAttribute('aria-current', 'true'); else s.a.removeAttribute('aria-current');
    });
    if (route) {
      var reading = y + vh * 0.55;
      var active = null;
      route.discs.forEach(function (dd) { if (dd.y <= reading + 70) active = dd; });
      route.discs.forEach(function (dd) { dd.item.classList.toggle('is-active', dd === active); });
    }
  }
  function requestReadout() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateReadout);
  }

  /* ---------- Motion ---------- */

  var motion = null; /* { rebuild, kill } while the full system is live */

  function initMotion() {
    gsap.registerPlugin(ScrollTrigger);
    if (window.MotionPathPlugin) gsap.registerPlugin(MotionPathPlugin);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', function () {
      html.classList.add('has-motion');
      html.classList.remove('reduce-motion');

      /* Lenis on fine pointers only */
      if (window.Lenis && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        lenis = new Lenis({ duration: 1.05, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); } });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
        $$('a[href^="#"]').forEach(function (a) {
          a.addEventListener('click', function (e) {
            var id = a.getAttribute('href');
            var t = id.length > 1 ? $(id) : null;
            if (!t) return;
            e.preventDefault();
            lenis.scrollTo(t, { offset: -(parseFloat(getComputedStyle(html).scrollPaddingTop) || 0) });
          });
        });
      }

      /* Contours draw once on load: staggered dashoffset, under 1.6s in all */
      var lines = $$('.cf-a .c-lines path');
      gsap.set(lines, { strokeDashoffset: 1 });
      gsap.set('.c-labels', { opacity: 0 });
      gsap.to(lines, {
        strokeDashoffset: 0, duration: 0.9, ease: 'power2.out', stagger: { amount: 0.65 },
        onComplete: function () { html.classList.add('contours-done'); }
      });
      gsap.to('.c-labels', { opacity: 1, duration: 0.5, delay: 1.1, ease: 'power1.out' });

      /* Calm ink-settle entrances: 0.5s, 4px rise, expo.out */
      ScrollTrigger.batch('[data-settle]', {
        start: 'top 94%',
        once: true,
        onEnter: function (els) {
          gsap.to(els, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.07, overwrite: true, onComplete: function () { els.forEach(function (e) { e.classList.add('is-in'); }); } });
        }
      });

      /* Karl the Fog: slow sideways drift, never scroll-driven; thinning is in the master timeline */
      var fogs = $$('.fog i');
      var drift = [[7, 76], [-6, 88], [8, 64]];
      fogs.forEach(function (f, i) {
        gsap.to(f, { xPercent: drift[i % 3][0], duration: drift[i % 3][1], ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });

      var master = null;
      function build() {
        if (master) { if (master.scrollTrigger) master.scrollTrigger.kill(); master.kill(); master = null; }
        if (!route) return;
        var vh = window.innerHeight;
        var smax = Math.max(1, ScrollTrigger.maxScroll(window));
        var line = vh * 0.55;
        var ytop = route.start.y, ybot = route.end.y;
        var sa = clamp(ytop - line, 0, smax), sb = clamp(ybot - line, sa + 1, smax);
        var a = sa / smax, b = sb / smax;
        var yA = sa + line, yB = sb + line;
        var bandH = $('.deep').offsetHeight || 900;

        gsap.set(route.marker, { x: route.start.x, y: route.start.y });
        master = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { start: 0, end: function () { return ScrollTrigger.maxScroll(window); }, scrub: 0.6, invalidateOnRefresh: true, onUpdate: requestReadout }
        });

        /* the marker travels the trail, kept on the reading line */
        if (window.MotionPathPlugin) {
          master.to(route.marker, {
            motionPath: { path: route.path, align: route.path, alignOrigin: [0.5, 0.5], autoRotate: false },
            ease: function (p) { return route.fracAtY(yA + p * (yB - yA)); },
            duration: b - a
          }, a);
        } else {
          master.to(route.marker, { y: route.end.y, duration: b - a }, a);
        }

        /* the contour band nearest the marker deepens */
        gsap.set('.deep', { y: yA - bandH / 2 });
        gsap.set('.deep-svg', { y: -(yA - bandH / 2) });
        master.fromTo('.deep', { y: yA - bandH / 2 }, { y: yB - bandH / 2, duration: b - a }, a);
        master.fromTo('.deep-svg', { y: -(yA - bandH / 2) }, { y: -(yB - bandH / 2), duration: b - a }, a);

        /* the fog thins as the visitor leaves the first viewport */
        master.fromTo('.fog', { opacity: 1 }, { opacity: 0.12, duration: Math.min(1, (vh * 0.9) / smax) }, 0);

        /* the declination compass turns slowly */
        master.fromTo('.compass-rose', { rotation: 0, svgOrigin: '28 28' }, { rotation: 52, svgOrigin: '28 28', duration: 1 }, 0);
      }

      motion = { rebuild: build };
      build();

      return function () {
        html.classList.remove('has-motion');
        if (master) { if (master.scrollTrigger) master.scrollTrigger.kill(); master.kill(); master = null; }
        if (lenis) { lenis.destroy(); lenis = null; }
        motion = null;
      };
    });

    mm.add('(prefers-reduced-motion: reduce)', function () {
      /* Final states, no travelling: contours drawn, fog light and still, marker at the trailhead. */
      html.classList.add('reduce-motion');
      html.classList.remove('has-motion');
      window.addEventListener('scroll', requestReadout, { passive: true });
      return function () { window.removeEventListener('scroll', requestReadout); };
    });
  }

  /* ---------- Start ---------- */

  function layout() {
    route = buildRoute();
    measureSections();
    updateReadout();
    if (motion && motion.rebuild) {
      motion.rebuild();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
  }

  var timer = null;
  function relayout() {
    clearTimeout(timer);
    timer = setTimeout(layout, 140);
  }

  function start() {
    if (!hasGsap || !html.classList.contains('js')) {
      html.classList.remove('js');
      window.addEventListener('scroll', requestReadout, { passive: true });
      layout();
    } else {
      route = buildRoute();
      measureSections();
      initMotion();
      updateReadout();
      window.addEventListener('scroll', requestReadout, { passive: true });
    }
    window.addEventListener('resize', relayout);
    if (window.ResizeObserver && sheet) {
      var lastH = 0;
      new ResizeObserver(function () {
        var h = sheet.offsetHeight;
        if (Math.abs(h - lastH) > 2) { lastH = h; relayout(); }
      }).observe(sheet);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
    window.addEventListener('load', relayout);
    window.__apReady = true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
