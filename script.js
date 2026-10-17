/* One orchestrated climb. Scroll position maps to elevation; elevation drives the whole sheet:
   ridgelines, fog, sun, zone colors, contour band, route marker, profile, counter. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var E_MAX = 2571;
  var ANCHOR = 0.42; // fraction of the map window where the visitor "stands"

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function seg(e, a, b) { return smooth((e - a) / (b - a)); }

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    doc.classList.add('reveal-all');
    $$('.contour').forEach(function (c) { c.classList.add('is-drawn'); });
    return;
  }
  var isTouch = window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(hover: none)').matches;
  if (isTouch) doc.classList.add('touch');
  gsap.registerPlugin(ScrollTrigger);
  if (typeof MotionPathPlugin !== 'undefined') gsap.registerPlugin(MotionPathPlugin);

  /* ------------------------------------------------------------ elements */
  var stage = $('.stage');
  var scene = $('#scene');
  var sun = $('#sun');
  var hatch = $('#hatch');
  var layerEls = $$('#scene .lyr, #scene .fg').map(function (el) {
    return { el: el, name: el.getAttribute('data-lyr'), t: +el.getAttribute('data-t') || 0, t0: +el.getAttribute('data-t0') || 0, o: +el.getAttribute('data-o') || 1, fog: el.classList.contains('fog') };
  });
  function layer(name) { return layerEls.filter(function (l) { return l.name === name; })[0]; }
  var contours = $$('.contour');
  var contourGroups = $$('.contour-lines, .contour-labels');
  var elevNum = $('#elev-num'), elevZone = $('#elev-zone');
  var trail = $('.trail'), routeSvg = $('#route-svg'), routePath = $('#route-path'), routeDone = $('#route-done'), marker = $('#route-marker');
  var profileSvg = $('#profile'), profileLine = $('#profile-line'), profileArea = $('#profile-area'), pfClip = $('#pf-clip-rect');
  var profileDot = $('#profile-dot'), profileWrap = $('.profile-wrap'), pfDone = $('.pf-done');
  var rose = $('#decl-rose');
  var scalePin = $('#scale-pin');
  var hawk = $('#hawk'), beacon = $('#beacon'), quail = $('#quail'), sunGlowOn = true;
  var lastPalE = -1e9, hawkState = '', beaconOn = false;
  var zoneLinks = $$('.zone-links a');
  var routeD0 = routePath ? routePath.getAttribute('d') : '';

  /* ------------------------------------------------------------ palette per zone */
  function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  var ZONES = [
    { e: 350, wash: '#DCE8D8', far: '#B9CEC8', mid: '#9DBB95', near: '#7FA386', fg: '#6C9772', sun: '#E3B891' },
    { e: 1000, wash: '#E4EAD2', far: '#BFCFC6', mid: '#A9BE8A', near: '#8AA46A', fg: '#7FA874', sun: '#EACB9E' },
    { e: 1800, wash: '#EDE5C9', far: '#C3CCC6', mid: '#D3C28E', near: '#BC9F68', fg: '#B0A068', sun: '#F4E2BE' },
    { e: 2500, wash: '#D3E2EA', far: '#A9C1CC', mid: '#BECBC0', near: '#A7B49A', fg: '#A39F88', sun: '#FBF4E4' }
  ];
  ZONES.forEach(function (z) { ['wash', 'far', 'mid', 'near', 'fg', 'sun'].forEach(function (k) { z[k + 'C'] = hex(z[k]); }); });
  function mixZone(e) {
    var a, b, t;
    if (e <= ZONES[0].e) { a = b = ZONES[0]; t = 0; }
    else if (e >= ZONES[3].e) { a = b = ZONES[3]; t = 0; }
    else {
      for (var i = 0; i < 3; i++) if (e >= ZONES[i].e && e <= ZONES[i + 1].e) { a = ZONES[i]; b = ZONES[i + 1]; t = smooth((e - a.e) / (b.e - a.e)); break; }
    }
    var out = {};
    ['wash', 'far', 'mid', 'near', 'fg', 'sun'].forEach(function (k) {
      var ca = a[k + 'C'], cb = b[k + 'C'];
      out[k] = 'rgb(' + Math.round(lerp(ca[0], cb[0], t)) + ',' + Math.round(lerp(ca[1], cb[1], t)) + ',' + Math.round(lerp(ca[2], cb[2], t)) + ')';
    });
    return out;
  }
  function zoneOf(e) {
    if (e < 60) return { key: 'trailhead', label: 'Trailhead' };
    if (e < 700) return { key: 'canyon', label: 'Redwood canyon' };
    if (e < 1400) return { key: 'woodland', label: 'Oak and bay woodland' };
    if (e < 2300) return { key: 'chaparral', label: 'Chaparral and serpentine' };
    return { key: 'summit', label: 'East Peak' };
  }

  /* ------------------------------------------------------------ layout state */
  var S = { stops: [], maxScroll: 1, anchorY: 0, samples: [], routeLen: 1, trailTop: 0, trailH: 1, trailW: 1, beacon: null };
  var lastZone = '', lastContour = -1, lastE = -1, lastP = 0, lastPose = 0, drawZone = null;

  function winMetrics() {
    var r = stage.getBoundingClientRect();
    return { top: r.top, h: r.height };
  }

  function fitTrail() {
    // phones: the hero is taller than the window, so start the trail inside the first screen
    var hero = $('#trailhead');
    var w = winMetrics();
    if (window.innerWidth < 700 && hero) {
      var tail = clamp(hero.offsetHeight - w.h * 0.5, 120, Math.max(120, hero.offsetHeight - 60));
      doc.style.setProperty('--hero-tail', Math.round(tail) + 'px');
    } else {
      doc.style.removeProperty('--hero-tail');
    }
  }

  function buildRoute() {
    if (!trail || !routePath) return;
    fitTrail();
    var W = Math.max(1, trail.clientWidth), H = Math.max(1, trail.clientHeight);
    S.trailW = W; S.trailH = H;
    var padX = Math.min(22, W * 0.27);
    var toks = routeD0.match(/[MC]|-?\d*\.?\d+/g) || [];
    var out = '', n = 0;
    toks.forEach(function (t) {
      if (t === 'M' || t === 'C') { out += t; n = 0; return; }
      var v = parseFloat(t);
      out += (n % 2 === 0 ? (padX + v * (W - 2 * padX) / 100) : (v * H / 1000)).toFixed(1) + ' ';
      n++;
    });
    routeSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    routeSvg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    [routePath, routeDone].forEach(function (p) { p.removeAttribute('vector-effect'); p.setAttribute('d', out); });
    S.routeLen = routePath.getTotalLength();
    S.samples = [];
    var N = 700;
    for (var i = 0; i <= N; i++) {
      var pt = routePath.getPointAtLength(S.routeLen * i / N);
      S.samples.push({ f: i / N, x: pt.x, y: pt.y });
    }
    var tr = trail.getBoundingClientRect();
    S.trailTop = tr.top + window.pageYOffset;
    marker.style.left = S.samples[0].x.toFixed(1) + 'px';
    marker.style.top = S.samples[0].y.toFixed(1) + 'px';
  }
  function sampleAtY(y) {
    var s = S.samples;
    if (y <= s[0].y) return s[0];
    for (var i = 1; i < s.length; i++) {
      if (s[i].y >= y) {
        var a = s[i - 1], b = s[i], t = (y - a.y) / Math.max(0.0001, b.y - a.y);
        return { f: lerp(a.f, b.f, t), x: lerp(a.x, b.x, t), y: y };
      }
    }
    return s[s.length - 1];
  }

  function buildMap() {
    var w = winMetrics();
    var sy = window.pageYOffset;
    S.anchorY = w.top + w.h * ANCHOR;
    S.maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    var stops = [];
    $$('[data-elev]').forEach(function (el) {
      var pin = $('.pin', el);
      var r = (pin || el).getBoundingClientRect();
      var cy = r.top + sy + (pin ? r.height / 2 : 24);
      var scroll = clamp(cy - S.anchorY, 0, S.maxScroll);
      var elev = +el.getAttribute('data-elev');
      stops.push({ el: el, pin: pin, scroll: el.id === 'trailhead' ? 0 : scroll, elev: elev, docY: cy });
      if (pin && S.trailTop) {
        var smp = sampleAtY(cy - S.trailTop);
        pin.style.setProperty('--pin-x', smp.x.toFixed(1) + 'px');
      }
    });
    stops.sort(function (a, b) { return a.scroll - b.scroll || a.elev - b.elev; });
    // enforce non-decreasing elevation and strictly increasing scroll
    var clean = [];
    stops.forEach(function (s) {
      var prev = clean[clean.length - 1];
      if (prev && s.scroll <= prev.scroll) s.scroll = prev.scroll + 0.5;
      if (prev && s.elev < prev.elev) s.elev = prev.elev;
      clean.push(s);
    });
    var last = clean[clean.length - 1];
    if (last.elev < E_MAX) clean.push({ scroll: Math.max(S.maxScroll, last.scroll + 1), elev: E_MAX });
    S.stops = clean;
  }
  function elevAt(scroll) {
    var s = S.stops;
    if (scroll <= s[0].scroll) return s[0].elev;
    for (var i = 1; i < s.length; i++) {
      if (scroll <= s[i].scroll) {
        var a = s[i - 1], b = s[i];
        return lerp(a.elev, b.elev, (scroll - a.scroll) / (b.scroll - a.scroll));
      }
    }
    return E_MAX;
  }
  function scrollAtElev(e) {
    var s = S.stops;
    for (var i = 1; i < s.length; i++) {
      if (e <= s[i].elev) {
        var a = s[i - 1], b = s[i];
        return b.elev === a.elev ? a.scroll : lerp(a.scroll, b.scroll, (e - a.elev) / (b.elev - a.elev));
      }
    }
    return S.maxScroll;
  }
  function arcFrac(p) {
    if (!S.samples.length) return p;
    var y = p * S.maxScroll + S.anchorY - S.trailTop;
    return sampleAtY(clamp(y, 0, S.trailH)).f;
  }

  function buildProfile() {
    if (!profileLine) return;
    var pts = S.stops.map(function (s) { return [clamp(s.scroll / S.maxScroll, 0, 1) * 600, 44 - s.elev / E_MAX * 40]; });
    pts.unshift([0, 44]);
    var d = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
    profileLine.setAttribute('d', d);
    profileArea.setAttribute('d', d + ' L600 48 L0 48 Z');
    var bounds = [0, scrollAtElev(700) / S.maxScroll * 600, scrollAtElev(1400) / S.maxScroll * 600, scrollAtElev(2300) / S.maxScroll * 600, 600];
    for (var i = 0; i < 4; i++) {
      var r = $('#pf-z' + i);
      if (r) { r.setAttribute('x', bounds[i].toFixed(1)); r.setAttribute('width', (bounds[i + 1] - bounds[i]).toFixed(1)); }
    }
    $$('.profile-tick').forEach(function (t) { t.remove(); });
    S.stops.forEach(function (s) {
      if (!s.el || !s.pin || !/^(wp-|deuna|athenaeum|strand|proxii)/.test(s.el.id)) return;
      var t = document.createElement('span');
      t.className = 'profile-tick';
      t.style.left = (clamp(s.scroll / S.maxScroll, 0, 1) * 100) + '%';
      profileWrap.insertBefore(t, profileDot);
    });
  }

  /* ------------------------------------------------------------ render: one function, one source of truth */
  function render(E, p, opts) {
    opts = opts || {};
    var poseE = opts.poseE != null ? opts.poseE : E;
    var f = poseE / E_MAX;
    // layers
    layerEls.forEach(function (l) {
      var y;
      if (l.name === 'fg-summit') {
        var s = seg(poseE, 1900, 2571);
        y = lerp(l.t0, 0, s);
        l.el.style.opacity = s > 0 ? 1 : 0;
      } else {
        y = l.t * f;
        if (l.fog) {
          l.el.style.opacity = ((0.3 + 0.5 * seg(poseE, 0, 1700)) * l.o).toFixed(3);
        } else if (l.name === 'fg-redwood') {
          l.el.style.opacity = (1 - seg(poseE, 450, 950)).toFixed(3);
        } else if (l.name === 'fg-oak') {
          l.el.style.opacity = (seg(poseE, 300, 700) * (1 - seg(poseE, 1500, 1950))).toFixed(3);
        } else if (l.name === 'fg-chap') {
          l.el.style.opacity = (seg(poseE, 1100, 1500) * (1 - seg(poseE, 2200, 2550))).toFixed(3);
        }
      }
      l.el.setAttribute('transform', 'translate(0 ' + y.toFixed(1) + ')');
    });
    // sun arc and light angle
    if (sun) {
      var sf = smooth(f);
      sun.setAttribute('transform', 'translate(' + lerp(1000, 1290, sf).toFixed(1) + ' ' + lerp(560, 250, sf).toFixed(1) + ')');
      var pl = $('#scene .peak-labels'); if (pl) pl.style.opacity = (0.9 * (1 - seg(poseE, 450, 900))).toFixed(3);
    }
    // touch: the zone palette and hatch only repaint in coarse steps, so scrolling stays on the compositor
    if (!isTouch || Math.abs(poseE - lastPalE) > 30 || opts.force) {
      lastPalE = poseE;
      if (hatch && !isTouch) hatch.setAttribute('patternTransform', 'rotate(' + lerp(35, 78, smooth(f)).toFixed(1) + ')');
      var c = mixZone(poseE);
      var st = stage.style;
      st.setProperty('--wash', c.wash); st.setProperty('--far', c.far); st.setProperty('--mid', c.mid);
      st.setProperty('--near', c.near); st.setProperty('--fg', c.fg); st.setProperty('--sun', c.sun);
      st.setProperty('--hatch-o', lerp(0.55, 0.14, smooth(f)).toFixed(3));
      st.setProperty('--glow', (0.06 + 0.34 * seg(poseE, 1700, 2571)).toFixed(3));
    }
    // red-tailed hawk: circles over the ridge near the trailhead, parked once you are above it
    if (hawk) {
      var hs = poseE < 650 ? 'on' : 'off';
      if (hs !== hawkState) { hawkState = hs; hawk.classList.toggle('is-on', hs === 'on'); hawk.classList.toggle('is-paused', hs !== 'on'); }
    }
    // lookout beacon: lights up as the fire lookout rises into view, and rides the rising outcrop
    if (beacon && S.beacon) {
      var bs = seg(poseE, 1900, 2571);
      var by = S.beacon.y + lerp(480, 0, bs) * S.beacon.k;
      beacon.style.transform = 'translate(' + S.beacon.x.toFixed(1) + 'px,' + by.toFixed(1) + 'px)';
      var bo = seg(poseE, 2350, 2571);
      beacon.style.opacity = bo.toFixed(2);
      var on = bo > 0.02;
      if (on !== beaconOn) { beaconOn = on; beacon.classList.toggle('is-on', on); }
    }
    // contours draw in section by section as each zone is entered
    if (drawZone) drawZone(E);
    // contours
    var ci = Math.round(clamp(E / E_MAX, 0, 1) * (contours.length - 1));
    if (ci !== lastContour && contours.length) {
      if (lastContour >= 0) contours[lastContour].classList.remove('is-active');
      contours[ci].classList.add('is-active');
      lastContour = ci;
    }
    var cy = (-clamp(p, 0, 1) * 150).toFixed(1);
    contourGroups.forEach(function (g) { g.setAttribute('transform', 'translate(0 ' + cy + ')'); });
    // counter, zone, chrome
    elevNum.textContent = Math.round(E).toLocaleString('en-US');
    var z = zoneOf(E);
    if (z.key !== lastZone) {
      elevZone.textContent = z.label;
      zoneLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + z.key); });
      lastZone = z.key;
    }
    if (rose) rose.setAttribute('transform', 'rotate(' + (p * 32 - 6).toFixed(1) + ' 32 32)');
    if (scalePin) scalePin.style.left = (2 + p * 160) + 'px';
    if (pfClip) pfClip.setAttribute('width', (clamp(p, 0, 1) * 600).toFixed(1));
    if (profileDot && profileSvg) {
      var pw = profileSvg.clientWidth, ph = profileSvg.clientHeight;
      profileDot.style.left = (clamp(p, 0, 1) * pw).toFixed(1) + 'px';
      profileDot.style.top = (2 + (44 - E / E_MAX * 40) / 48 * ph).toFixed(1) + 'px';
    }
    lastE = E; lastP = p; lastPose = poseE;
  }

  /* ------------------------------------------------------------ full motion mode */
  var tl = null, lenis = null, proxy = { p: 0 }, ticking = null, fogTweens = [], batchTriggers = [], rebuildTimer = null, ro = null;

  function layout() {
    buildRoute();
    buildMap();
    buildProfile();
    S.routeLen = S.routeLen || 1;
  }

  function prime() {
    // render the first frame of every tween so the marker starts on the trail
    var keep = proxy.p;
    tl.progress(Math.min(1, keep + 0.0001)).progress(keep);
  }

  function startFull() {
    doc.classList.remove('rm');
    layout();
    routeDone.style.strokeDasharray = S.routeLen;
    routeDone.style.strokeDashoffset = S.routeLen;

    function onProg() {
      var p = proxy.p;
      var E = elevAt(p * S.maxScroll);
      render(E, p);
      routeDone.style.strokeDashoffset = (S.routeLen * (1 - arcFrac(p))).toFixed(1);
    }

    proxy.p = clamp(window.pageYOffset / S.maxScroll, 0, 1);
    tl = gsap.timeline({ defaults: { ease: 'none', duration: 1 } });
    tl.to(proxy, { p: 1, onUpdate: onProg }, 0);
    if (typeof MotionPathPlugin !== 'undefined' && marker) {
      tl.to(marker, {
        motionPath: { path: routePath, align: routePath, alignOrigin: [0.5, 0.5] },
        ease: function (p) { return arcFrac(p); }
      }, 0);
    }
    ScrollTrigger.create({ animation: tl, start: 0, end: 'max', scrub: 0.7, invalidateOnRefresh: true });
    prime();

    // fog drifts slowly sideways, 60 to 90 second loops (skipped on touch)
    if (!isTouch && !fogTweens.length) {
      $$('.fog .drift').forEach(function (d, i) {
        fogTweens.push(gsap.to(d, { x: (i % 2 ? -1 : 1) * (110 + i * 40), duration: 60 + i * 12, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
      });
    }

    // contours draw in section by section: the lowest levels on load, the rest as each zone is entered
    var GROUPS = [[0, 12, 0], [12, 20, 650], [20, 27, 1350], [27, contours.length, 2150]];
    var drawn = [false, false, false, false];
    function drawGroup(i) {
      drawn[i] = true;
      var els = contours.slice(GROUPS[i][0], GROUPS[i][1]);
      if (isTouch) { els.forEach(function (c) { c.classList.add('is-drawn'); }); return; }
      gsap.fromTo(els, { strokeDashoffset: 1 }, {
        strokeDashoffset: 0, duration: 1.1, ease: 'power2.out', stagger: { each: 0.03 },
        onComplete: function () { els.forEach(function (c) { c.classList.add('is-drawn'); }); }
      });
    }
    drawZone = function (e) { for (var i = 0; i < GROUPS.length; i++) if (!drawn[i] && e >= GROUPS[i][2]) drawGroup(i); };
    if (isTouch) { GROUPS.forEach(function (g, i) { drawGroup(i); }); }
    else if (!doc.classList.contains('contours-drawn')) { doc.classList.add('contours-drawn'); drawZone(0); }

    // ink-settle entrances
    var items = $$('.reveal');
    // each pin drops onto the trail when its point enters view
    gsap.set($$('.pin'), { opacity: 0, scale: 0.8, y: -6 });
    ScrollTrigger.batch(items, {
      start: 'top 90%', once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out', stagger: 0.06, overwrite: true, clearProps: 'transform' });
        var pins = batch.map(function (el) { return $('.pin', el); }).filter(Boolean);
        gsap.to(pins, { opacity: 1, scale: 1, y: 0, duration: 0.45, delay: 0.12, ease: 'back.out(2.4)', stagger: 0.06, overwrite: true, clearProps: 'transform' });
      }
    });
    // a pair of quail cross the chaparral once, when the athletics rest stop comes into view
    if (quail && $('#rest-athletics')) {
      ScrollTrigger.create({ trigger: '#rest-athletics', start: 'top 85%', once: true, onEnter: runQuail });
    }
    batchTriggers = ScrollTrigger.getAll().filter(function (t) { return t.vars && t.vars.once; });

    // smooth scroll on fine pointers only
    if (!lenis && !isTouch && typeof Lenis !== 'undefined' && window.matchMedia('(pointer: fine)').matches) {
      lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 0.95 });
      lenis.on('scroll', ScrollTrigger.update);
      ticking = function (t) { lenis.raf(t * 1000); };
      gsap.ticker.add(ticking);
      gsap.ticker.lagSmoothing(0);
    }
    if (window.__revealTimer) clearTimeout(window.__revealTimer);
  }

  function runQuail() {
    var qs = $$('.q', quail);
    gsap.set(quail, { opacity: 1 });
    qs.forEach(function (q, i) {
      var x0 = +gsap.getProperty(q, 'x'), y0 = +gsap.getProperty(q, 'y');
      var hop = gsap.to(q, { y: y0 - 5, duration: 0.26, ease: 'sine.out', yoyo: true, repeat: -1, delay: i * 0.13 });
      gsap.to(q, { x: x0 + 1900, duration: 13, ease: 'none', delay: i * 0.5, onComplete: function () { hop.kill(); gsap.set(quail, { opacity: 0 }); } });
    });
  }

  function stopFull() {
    drawZone = null;
    contours.forEach(function (c) { c.classList.add('is-drawn'); });
    gsap.set($$('.pin'), { clearProps: 'opacity,scale,y,transform' });
    if (quail) { gsap.killTweensOf($$('.q', quail)); gsap.set(quail, { opacity: 0 }); }
    if (tl) { if (tl.scrollTrigger) tl.scrollTrigger.kill(); tl.kill(); tl = null; }
    if (lenis) { gsap.ticker.remove(ticking); lenis.destroy(); lenis = null; }
    fogTweens.forEach(function (t) { t.kill(); }); fogTweens = [];
    gsap.set($$('.fog .drift'), { clearProps: 'all' });
  }

  function rebuildFull() {
    if (!tl) return;
    var keep = proxy.p;
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill(); tl = null;
    gsap.set(marker, { clearProps: 'transform' });
    layout();
    routeDone.style.strokeDasharray = S.routeLen;
    proxy.p = clamp(window.pageYOffset / S.maxScroll, 0, 1) || keep;
    tl = gsap.timeline({ defaults: { ease: 'none', duration: 1 } });
    tl.to(proxy, { p: 1, onUpdate: function () {
      var E = elevAt(proxy.p * S.maxScroll);
      render(E, proxy.p);
      routeDone.style.strokeDashoffset = (S.routeLen * (1 - arcFrac(proxy.p))).toFixed(1);
    } }, 0);
    if (typeof MotionPathPlugin !== 'undefined' && marker) {
      tl.to(marker, { motionPath: { path: routePath, align: routePath, alignOrigin: [0.5, 0.5] }, ease: function (p) { return arcFrac(p); } }, 0);
    }
    ScrollTrigger.create({ animation: tl, start: 0, end: 'max', scrub: 0.7, invalidateOnRefresh: true });
    prime();
  }

  /* ------------------------------------------------------------ reduced motion: a complete static expedition */
  var staticBound = false, staticRaf = 0, staticActive = null;
  var POSE = { trailhead: 0, canyon: 350, woodland: 1050, chaparral: 1850, summit: 2571 };

  function staticUpdate() {
    staticRaf = 0;
    var sy = window.pageYOffset;
    var best = S.stops[0], bd = Infinity;
    S.stops.forEach(function (s) {
      if (!s.el) return;
      var d = Math.abs(s.scroll - sy);
      if (d < bd) { bd = d; best = s; }
    });
    if (!best || best === staticActive) return;
    staticActive = best;
    var E = best.elev, p = clamp(best.scroll / S.maxScroll, 0, 1);
    render(E, p, { poseE: POSE[zoneOf(E).key] });
    var smp = sampleAtY(best.docY - S.trailTop);
    marker.style.left = smp.x.toFixed(1) + 'px';
    marker.style.top = smp.y.toFixed(1) + 'px';
  }
  function startStatic() {
    doc.classList.add('rm');
    doc.classList.add('reveal-all');
    contours.forEach(function (c) { c.classList.add('is-drawn'); });
    layout();
    routeDone.style.strokeDasharray = 'none';
    routeDone.style.strokeDashoffset = '0';
    staticActive = null;
    staticUpdate();
    if (!staticBound) {
      staticBound = true;
      window.addEventListener('scroll', function () { if (doc.classList.contains('rm') && !staticRaf) staticRaf = requestAnimationFrame(staticUpdate); }, { passive: true });
    }
    if (window.__revealTimer) clearTimeout(window.__revealTimer);
  }
  function stopStatic() {
    doc.classList.remove('reveal-all');
    marker.style.left = ''; marker.style.top = '';
  }

  function placeBeacon() {
    if (!beacon) return;
    var ctm = scene.getScreenCTM(), r = stage.getBoundingClientRect();
    if (!ctm || !r.width) return;
    // the lookout cabin on the summit outcrop sits at scene point 1120, 676 when fully risen
    S.beacon = { x: 1120 * ctm.a + ctm.e - r.left, y: 676 * ctm.d + ctm.f - r.top, k: ctm.d };
  }
  function fitScene() {
    var r = stage.getBoundingClientRect();
    scene.setAttribute('viewBox', r.width / r.height < 0.9 ? '780 0 700 1000' : '0 0 1600 1000');
    placeBeacon();
    if (lastE >= 0) render(lastE, lastP, { force: true, poseE: lastPose });
  }
  fitScene();
  window.addEventListener('resize', fitScene);

  /* ------------------------------------------------------------ boot */
  var mm = gsap.matchMedia();
  var mode = null;
  mm.add('(prefers-reduced-motion: no-preference)', function () { mode = 'full'; doc.classList.add('anim'); startFull(); return function () { doc.classList.remove('anim'); stopFull(); }; });
  mm.add('(prefers-reduced-motion: reduce)', function () { mode = 'static'; startStatic(); return function () { stopStatic(); }; });

  function rebuild() {
    clearTimeout(rebuildTimer);
    rebuildTimer = setTimeout(function () {
      placeBeacon();
      if (mode === 'full') { rebuildFull(); ScrollTrigger.refresh(); }
      else { layout(); staticActive = null; staticUpdate(); }
    }, 160);
  }
  window.addEventListener('resize', rebuild);
  window.addEventListener('load', rebuild);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
  if (window.ResizeObserver) {
    var lastH = 0;
    ro = new ResizeObserver(function () {
      var h = $('main').offsetHeight;
      if (Math.abs(h - lastH) > 4) { lastH = h; rebuild(); }
    });
    ro.observe($('main'));
  }
})();
