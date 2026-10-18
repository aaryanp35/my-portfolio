/* One climb. Scroll position maps to elevation; elevation drives the scene layers, fog, sun, palette,
   contours, hiker, profile and counter. No libraries: one requestAnimationFrame loop that only runs
   while something moves, and CSS for everything that can run on its own. */
(function () {
  'use strict';

  var doc = document.documentElement;
  var E_MAX = 2571;
  var ANCHOR = 0.42; // fraction of the map window where the visitor "stands"
  var LAG = 0.18; // seconds for the climb to ease toward the scroll position

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function seg(e, a, b) { return smooth((e - a) / (b - a)); }

  var isTouch = matchMedia('(pointer: coarse), (hover: none)').matches;
  if (isTouch) doc.classList.add('touch');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');

  /* ------------------------------------------------------------ elements */
  var stage = $('.stage'), contourSvg = $('#contours');
  var layers = $$('.stage [data-lyr]').map(function (el) {
    return { el: el, name: el.getAttribute('data-lyr'), t: +el.getAttribute('data-t') || 0, t0: +el.getAttribute('data-t0') || 0, o: +el.getAttribute('data-o') || 1, fog: el.classList.contains('fog'), tf: '', op: '' };
  });
  var hatch = $('#hatch'), beacon = $('#beacon'), hawk = $('#hawk');
  var contours = $$('.contour');
  var elevNum = $('#elev-num'), elevZone = $('#elev-zone');
  var trail = $('.trail'), routeSvg = $('#route-svg'), routePath = $('#route-path'), routeDone = $('#route-done'), marker = $('#route-marker');
  var profileLine = $('#profile-line'), profileArea = $('#profile-area'), pfClip = $('#pf-clip-rect');
  var profileSvg = $('#profile'), profileDot = $('#profile-dot'), profileWrap = $('.profile-wrap');
  var declSvg = $('#decl-svg'), scalePin = $('#scale-pin'), hikerFlip = $('.hiker-flip');
  var zoneLinks = $$('.zone-links a');
  var routeD0 = routePath.getAttribute('d');

  /* ------------------------------------------------------------ palette per zone */
  var KEYS = ['wash', 'far', 'mid', 'near', 'fg', 'sun'];
  var ZONES = [
    { e: 350, c: ['#DCE8D8', '#B9CEC8', '#9DBB95', '#7FA386', '#6C9772', '#E3B891'] },
    { e: 1000, c: ['#E4EAD2', '#BFCFC6', '#A9BE8A', '#8AA46A', '#7FA874', '#EACB9E'] },
    { e: 1800, c: ['#EDE5C9', '#C3CCC6', '#D3C28E', '#BC9F68', '#B0A068', '#F4E2BE'] },
    { e: 2500, c: ['#D3E2EA', '#A9C1CC', '#BECBC0', '#A7B49A', '#A39F88', '#FBF4E4'] }
  ];
  ZONES.forEach(function (z) { z.rgb = z.c.map(function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.substr(i, 2), 16); }); }); });
  function paint(e, f) {
    var i = 0;
    while (i < 3 && e > ZONES[i + 1].e) i++;
    var a = ZONES[i], b = ZONES[Math.min(3, i + 1)], t = a === b || e <= a.e ? 0 : smooth((e - a.e) / (b.e - a.e));
    pal.vals = { '--hatch-o': lerp(0.55, 0.14, smooth(f)).toFixed(3), '--glow': (0.06 + 0.34 * seg(e, 1700, 2571)).toFixed(3) };
    KEYS.forEach(function (k, j) { pal.vals['--' + k] = 'rgb(' + a.rgb[j].map(function (v, n) { return Math.round(lerp(v, b.rgb[j][n], t)); }) + ')'; });
    stage.style.setProperty('--wash', pal.vals['--wash']);
    if (hatch && !isTouch) hatch.setAttribute('patternTransform', 'rotate(' + lerp(35, 78, smooth(f)).toFixed(1) + ')');
    pal.queue = layers.slice();
  }
  // a palette step repaints every layer it touches, so it is handed out a few layers per frame instead of all at once
  var pal = { vals: null, queue: [] };
  function flushPalette(n) {
    while (pal.queue.length && n--) { var st = pal.queue.shift().el.style; for (var k in pal.vals) st.setProperty(k, pal.vals[k]); }
  }
  function zoneOf(e) {
    if (e < 60) return { key: 'trailhead', label: 'Trailhead' };
    if (e < 700) return { key: 'canyon', label: 'Redwood canyon' };
    if (e < 1400) return { key: 'woodland', label: 'Oak and bay woodland' };
    if (e < 2300) return { key: 'chaparral', label: 'Chaparral and serpentine' };
    return { key: 'summit', label: 'Summit' };
  }
  // how each scene layer fades with elevation (layers not listed stay opaque)
  var FADE = {
    'fg-redwood': function (e) { return 1 - seg(e, 450, 950); },
    'fg-oak': function (e) { return seg(e, 300, 700) * (1 - seg(e, 1500, 1950)); },
    'fg-chap': function (e) { return seg(e, 1100, 1500) * (1 - seg(e, 2200, 2550)); },
    'fg-summit': function (e) { return seg(e, 1900, 2571) > 0 ? 1 : 0; },
    'fog-sea': function (e) { return seg(e, 1550, 2250); },
    labels: function (e) { return 0.9 * (1 - seg(e, 450, 900)); }
  };
  FADE.quail = FADE['fg-chap'];

  /* ------------------------------------------------------------ layout (measured on load and resize only) */
  var S = { stops: [], samples: [], maxScroll: 1, anchorY: 0, endHold: 0, winH: 1, winTop: 0, routeLen: 1, trailTop: 0, trailH: 1, k: 1, kc: 1, beacon: null, pw: 1, ph: 1 };

  function fitScene() {
    var r = stage.getBoundingClientRect();
    var vb = r.width / r.height < 0.9 ? [900, 0, 700, 1000] : [0, 0, 1600, 1000];
    layers.forEach(function (l) { l.el.setAttribute('viewBox', vb.join(' ')); l.tf = ''; });
    // preserveAspectRatio slice: one scale for the scene, one for the contour sheet (1600 x 1200)
    S.k = Math.max(r.width / vb[2], r.height / vb[3]);
    S.kc = Math.max(r.width / 1600, r.height / 1200);
    S.winTop = r.top; S.winH = r.height;
    var tam = layers.filter(function (l) { return l.name === 'tam'; })[0];
    if (tam) {
      // the East Peak lookout cabin in scene units, mapped through xMidYMax slice
      S.beacon = { x: (+tam.el.getAttribute('data-bx') - vb[0]) * S.k + (r.width - vb[2] * S.k) / 2, y: (+tam.el.getAttribute('data-by') - vb[1]) * S.k + r.height - vb[3] * S.k, t: tam.t };
    }
  }

  function fitTrail() {
    // phones and tablets: the hero is taller than the window, so start the trail inside the first screen
    var hero = $('#trailhead');
    if (innerWidth < 960) doc.style.setProperty('--hero-tail', Math.round(clamp(hero.offsetHeight - S.winH * 0.5, 120, Math.max(120, hero.offsetHeight - 60))) + 'px');
    else doc.style.removeProperty('--hero-tail');
    // the trail ends where the hiker ends: just under the summit marker, or, on phones, where the hiker's end spot is still on screen
    var route = $('.route'), reg = $('#register'), pin = $('.pin', reg);
    trail.style.bottom = '0px';
    var rr = route.getBoundingClientRect(), gr = reg.getBoundingClientRect();
    var endY = gr.top + (parseFloat(getComputedStyle(pin).top) || 0) + pin.offsetHeight / 2 + 4 + marker.offsetHeight;
    endY = Math.max(endY, (doc.scrollHeight - innerHeight - scrollY) + S.winTop + marker.offsetHeight + 28);
    trail.style.bottom = Math.max(0, rr.bottom - endY).toFixed(1) + 'px';
  }

  function buildRoute() {
    var W = Math.max(1, trail.clientWidth), H = Math.max(1, trail.clientHeight);
    S.trailH = H;
    // scale the 100 x 1000 route to the trail's pixel box, then sample its cubic segments (12 steps each)
    var padX = Math.min(22, W * 0.27), nums = [], out = '', n = 0;
    (routeD0.match(/[MC]|-?\d*\.?\d+/g) || []).forEach(function (tk) {
      if (tk === 'M' || tk === 'C') { out += tk; n = 0; return; }
      var v = +(n++ % 2 === 0 ? padX + tk * (W - 2 * padX) / 100 : tk * H / 1000).toFixed(1);
      out += v + ' ';
      nums.push(v);
    });
    routeSvg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    routeSvg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    [routePath, routeDone].forEach(function (p) { p.removeAttribute('vector-effect'); p.setAttribute('d', out); });
    var pts = [{ x: nums[0], y: nums[1], l: 0 }], len = 0;
    for (var i = 2; i + 5 < nums.length; i += 6) {
      var p0 = pts[pts.length - 1];
      for (var k = 1; k <= 12; k++) {
        var t = k / 12, u = 1 - t, last = pts[pts.length - 1];
        var x = u * u * u * p0.x + 3 * u * u * t * nums[i] + 3 * u * t * t * nums[i + 2] + t * t * t * nums[i + 4];
        var y = u * u * u * p0.y + 3 * u * u * t * nums[i + 1] + 3 * u * t * t * nums[i + 3] + t * t * t * nums[i + 5];
        len += Math.hypot(x - last.x, y - last.y);
        pts.push({ x: x, y: y, l: len });
      }
    }
    S.routeLen = len * 1.0005;
    S.samples = pts.map(function (q) { return { f: q.l / len, x: q.x, y: q.y }; });
    S.trailTop = trail.getBoundingClientRect().top + scrollY;
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
    S.anchorY = S.winTop + S.winH * ANCHOR;
    S.maxScroll = Math.max(1, doc.scrollHeight - innerHeight);
    // at the very end the hiker is standing at the end of the trail, wherever that falls in the window
    S.endHold = S.trailTop + S.trailH - S.maxScroll;
    // read every position first, then write: one layout pass, not one per stop
    var stops = $$('[data-elev]').map(function (el) {
      var pin = $('.pin', el), r = (pin || el).getBoundingClientRect();
      var cy = r.top + scrollY + (pin ? r.height / 2 : 24);
      return { el: el, pin: pin, docY: cy, elev: +el.getAttribute('data-elev'), scroll: el.id === 'trailhead' ? 0 : clamp(cy - S.anchorY, 0, S.maxScroll) };
    });
    stops.forEach(function (s) { if (s.pin) s.pin.style.setProperty('--pin-x', sampleAtY(s.docY - S.trailTop).x.toFixed(1) + 'px'); });
    stops.sort(function (a, b) { return a.scroll - b.scroll || a.elev - b.elev; });
    // non-decreasing elevation, strictly increasing scroll
    stops.forEach(function (s, i) {
      var prev = stops[i - 1];
      if (prev && s.scroll <= prev.scroll) s.scroll = prev.scroll + 0.5;
      if (prev && s.elev < prev.elev) s.elev = prev.elev;
    });
    var last = stops[stops.length - 1];
    if (last.elev < E_MAX) stops.push({ scroll: Math.max(S.maxScroll, last.scroll + 1), elev: E_MAX });
    S.stops = stops;
  }
  function elevAt(scroll) {
    var s = S.stops;
    if (scroll <= s[0].scroll) return s[0].elev;
    for (var i = 1; i < s.length; i++) if (scroll <= s[i].scroll) return lerp(s[i - 1].elev, s[i].elev, (scroll - s[i - 1].scroll) / (s[i].scroll - s[i - 1].scroll));
    return E_MAX;
  }
  function scrollAtElev(e) {
    var s = S.stops;
    for (var i = 1; i < s.length; i++) {
      if (e <= s[i].elev) return s[i].elev === s[i - 1].elev ? s[i - 1].scroll : lerp(s[i - 1].scroll, s[i].scroll, (e - s[i - 1].elev) / (s[i].elev - s[i - 1].elev));
    }
    return S.maxScroll;
  }

  function buildProfile() {
    var X = function (sc) { return clamp(sc / S.maxScroll, 0, 1) * 600; };
    var d = 'M0 44 L' + S.stops.map(function (s) { return X(s.scroll).toFixed(1) + ' ' + (44 - s.elev / E_MAX * 40).toFixed(1); }).join(' L');
    profileLine.setAttribute('d', d);
    profileArea.setAttribute('d', d + ' L600 48 L0 48 Z');
    var b = [0, X(scrollAtElev(700)), X(scrollAtElev(1400)), X(scrollAtElev(2300)), 600];
    for (var i = 0; i < 4; i++) {
      var r = $('#pf-z' + i);
      r.setAttribute('x', b[i].toFixed(1)); r.setAttribute('width', (b[i + 1] - b[i]).toFixed(1));
    }
    $$('.profile-tick').forEach(function (t) { t.remove(); });
    S.stops.forEach(function (s) {
      if (!s.pin || !/^(wp-|deuna|athenaeum|strand|proxii)/.test(s.el.id)) return;
      var t = document.createElement('span');
      t.className = 'profile-tick';
      t.style.left = X(s.scroll) / 6 + '%';
      profileWrap.insertBefore(t, profileDot);
    });
    S.pw = profileSvg.clientWidth; S.ph = profileSvg.clientHeight;
  }

  function layout() {
    fitScene();
    fitTrail();
    buildRoute();
    buildMap();
    buildProfile();
    routeDone.style.strokeDasharray = mode === 'full' ? S.routeLen : 'none';
  }

  /* ------------------------------------------------------------ render: one function, one source of truth */
  var last = { palE: -1e9, contour: -1, zone: '', num: '', hawk: '', beacon: false, flip: 1 };
  function render(E, p, poseE) {
    if (poseE == null) poseE = E;
    var f = poseE / E_MAX;
    // each layer is its own svg, so moving or fading it never repaints the others; only changed values are written
    layers.forEach(function (l) {
      var x = 0, y = l.t * f, op = l.fog ? (0.3 + 0.5 * seg(poseE, 0, 1700)) * l.o : FADE[l.name] ? FADE[l.name](poseE) : null;
      if (l.name === 'sun') { x = 290 * smooth(f); y = -310 * smooth(f); }
      else if (l.name === 'fg-summit') y = lerp(l.t0, 0, seg(poseE, 1900, 2571));
      else if (l.name === 'fog-sea') y = lerp(l.t0, 0, seg(poseE, 1750, 2571));
      var tf = 'translate3d(' + (x * S.k).toFixed(1) + 'px,' + (y * S.k).toFixed(1) + 'px,0)';
      if (tf !== l.tf) { l.tf = tf; l.el.style.transform = tf; }
      // a fully faded layer is hidden too, so phones do not keep a GPU texture for it
      if (op != null && (op = op.toFixed(3)) !== l.op) { l.op = op; l.el.style.opacity = op; l.el.style.visibility = op === '0.000' ? 'hidden' : ''; }
    });
    // the palette repaints the scene, so it moves in 40 ft steps; the change per step is too small to see
    if (Math.abs(poseE - last.palE) >= 40 || poseE === 0 || poseE === E_MAX) { last.palE = poseE; paint(poseE, f); }
    flushPalette(mode === 'full' ? 3 : 99);
    // red-tailed hawk circles over the ridge near the trailhead, parked once you are above it
    var hs = poseE < 650 ? 'on' : 'off';
    if (hawk && hs !== last.hawk) { last.hawk = hs; hawk.classList.toggle('is-on', hs === 'on'); hawk.classList.toggle('is-paused', hs !== 'on'); }
    // lookout beacon lights up on East Peak's lookout, riding the ridge as it settles
    if (beacon && S.beacon) {
      var bo = seg(poseE, 2350, 2571);
      beacon.style.transform = 'translate3d(' + S.beacon.x.toFixed(1) + 'px,' + (S.beacon.y + S.beacon.t * f * S.k).toFixed(1) + 'px,0)';
      beacon.style.opacity = bo.toFixed(2);
      if ((bo > 0.02) !== last.beacon) { last.beacon = bo > 0.02; beacon.classList.toggle('is-on', last.beacon); }
    }
    // a pair of quail cross the chaparral once, as the climb nears the athletics stop
    if (poseE > 1980) doc.classList.add('quail-go');
    drawContours(E);
    var ci = Math.round(clamp(E / E_MAX, 0, 1) * (contours.length - 1));
    if (ci !== last.contour) {
      if (last.contour >= 0) contours[last.contour].classList.remove('is-active');
      contours[ci].classList.add('is-active');
      last.contour = ci;
    }
    contourSvg.style.transform = 'translate3d(0,' + (-clamp(p, 0, 1) * 150 * S.kc).toFixed(1) + 'px,0)';
    var num = Math.round(E).toLocaleString('en-US');
    if (num !== last.num) { last.num = num; elevNum.textContent = num; }
    var z = zoneOf(E);
    if (z.key !== last.zone) {
      last.zone = z.key;
      elevZone.textContent = z.label;
      zoneLinks.forEach(function (a) { a.classList.toggle('is-current', a.getAttribute('href') === '#' + z.key); });
    }
    var pc = clamp(p, 0, 1);
    declSvg.style.transform = 'rotate(' + (p * 32 - 6).toFixed(1) + 'deg)';
    scalePin.style.transform = 'translateX(' + (2 + pc * 160).toFixed(1) + 'px)';
    pfClip.setAttribute('width', (pc * 600).toFixed(1));
    profileDot.style.transform = 'translate(' + (pc * S.pw).toFixed(1) + 'px,' + (-E / E_MAX * 40 / 48 * S.ph).toFixed(1) + 'px)'; // CSS places the dot at 0 ft
  }

  /* contours draw in section by section: the lowest levels on load, the rest as each zone is entered (a CSS transition) */
  var GROUPS = [[0, 12, 0], [12, 20, 650], [20, 27, 1350], [27, 99, 2150]], drawn = [];
  function drawContours(e) {
    GROUPS.forEach(function (g, i) {
      if (drawn[i] || e < g[2]) return;
      drawn[i] = true;
      contours.slice(g[0], g[1]).forEach(function (c, j) { c.style.transitionDelay = j * 30 + 'ms'; c.classList.add('is-drawn'); });
    });
  }

  /* hiker: stands where the trail crosses the hold line, faces the way the trail runs, legs swing while the page moves */
  function holdAt(sc) {
    // the 42% line for the whole climb, easing to the end of the trail over the last window of scroll
    return lerp(S.anchorY, S.endHold, smooth((sc - (S.maxScroll - S.winH)) / Math.max(1, S.winH)));
  }
  function placeHiker(smp) {
    marker.style.transform = 'translate3d(' + smp.x.toFixed(1) + 'px,' + smp.y.toFixed(1) + 'px,0)';
    var ahead = sampleAtY(smp.y + 2), d = Math.abs(ahead.x - smp.x) > 0.05 ? (ahead.x > smp.x ? 1 : -1) : last.flip;
    if (d !== last.flip) { last.flip = d; hikerFlip.style.transform = d > 0 ? '' : 'scaleX(-1)'; }
    return smp;
  }
  var legs = [];
  if (marker.animate) {
    var o = { duration: 460, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' };
    legs = [$('.leg-f').animate([{ transform: 'rotate(-24deg)' }, { transform: 'rotate(24deg)' }], o), $('.leg-b').animate([{ transform: 'rotate(24deg)' }, { transform: 'rotate(-24deg)' }], o)];
    legs.forEach(function (a) { a.pause(); });
  }

  /* ------------------------------------------------------------ full motion: the loop */
  var mode = '', p = 0, raf = 0, lastT = 0, lastY = 0, walkUntil = 0, rate = 0, arrived = false;
  function draw() {
    var sc = p * S.maxScroll, E = elevAt(sc);
    render(E, p);
    var smp = placeHiker(sampleAtY(clamp(sc + holdAt(sc) - S.trailTop, 0, S.trailH)));
    routeDone.style.strokeDashoffset = (S.routeLen * (1 - smp.f)).toFixed(1);
    // arrival beat, once: the flag goes up beside the hiker (CSS transition on html.arrived)
    if (arrived !== (p > (arrived ? 0.9 : 0.985))) { arrived = !arrived; doc.classList.toggle('arrived', arrived); }
  }
  function frame(now) {
    raf = 0;
    var dt = lastT ? Math.min(0.1, (now - lastT) / 1000) : 1 / 60, y = scrollY;
    lastT = now;
    // legs: playback rate follows scroll speed; they stop 140 ms after the page does
    var v = Math.abs(y - lastY) / dt;
    lastY = y;
    if (v > 25) {
      walkUntil = now + 140;
      var r = clamp(v / 650, 0.5, 2.6);
      if (Math.abs(r - rate) > 0.15 || !rate) { rate = r; legs.forEach(function (a) { a.playbackRate = r; a.play(); }); }
    } else if (rate && now > walkUntil) { rate = 0; legs.forEach(function (a) { a.pause(); }); }
    var target = clamp(y / S.maxScroll, 0, 1), diff = target - p;
    p = Math.abs(diff) * S.maxScroll < 0.5 ? target : p + diff * (1 - Math.exp(-dt / LAG));
    draw();
    if (p !== target || rate || pal.queue.length) raf = requestAnimationFrame(frame); else lastT = 0;
  }
  function kick() { if (mode === 'full' && !raf) raf = requestAnimationFrame(frame); }

  /* ------------------------------------------------------------ reduced motion: a complete static expedition */
  var POSE = { trailhead: 0, canyon: 350, woodland: 1050, chaparral: 1850, summit: 2571 }, staticAt = null;
  function staticUpdate() {
    var y = scrollY, best = null;
    S.stops.forEach(function (s) { if (s.el && (!best || Math.abs(s.scroll - y) < Math.abs(best.scroll - y))) best = s; });
    if (!best || best === staticAt) return;
    staticAt = best;
    render(best.elev, clamp(best.scroll / S.maxScroll, 0, 1), POSE[zoneOf(best.elev).key]);
    // the hiker stands at the nearest stop, held inside the visible map band
    var atTop = best.el.id === 'register';
    doc.classList.toggle('arrived', atTop);
    placeHiker(atTop ? S.samples[S.samples.length - 1] : sampleAtY(clamp(best.docY, y + S.winTop + marker.offsetHeight + 8, y + S.winTop + S.winH - 8) - S.trailTop));
  }

  function setMode() {
    mode = reduced.matches ? 'static' : 'full';
    doc.classList.toggle('anim', mode === 'full');
    doc.classList.toggle('rm', mode === 'static');
    if (mode === 'static') {
      doc.classList.add('reveal-all');
      contours.forEach(function (c) { c.classList.add('is-drawn'); });
      legs.forEach(function (a) { a.pause(); });
    }
    layout();
    p = clamp(scrollY / S.maxScroll, 0, 1);
    staticAt = null;
    routeDone.style.strokeDashoffset = mode === 'full' ? S.routeLen : 0;
    if (mode === 'full') draw(); else staticUpdate();
    flushPalette(99);
  }

  /* ------------------------------------------------------------ entrances, quail, skip to summit */
  if (window.IntersectionObserver) {
    // each card settles in (and its pin drops onto the trail) when it enters view; cards entering together stagger
    var io = new IntersectionObserver(function (es) {
      var n = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.setProperty('--d', n++ * 60 + 'ms');
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
    // the skip button steps aside once the summit register is on screen
    new IntersectionObserver(function (es) { doc.classList.toggle('reg-in', es[0].isIntersecting); onScroll(); }, { rootMargin: '-80px 0px 0px 0px' }).observe($('#register'));
  } else doc.classList.add('reveal-all');
  clearTimeout(window.__revealTimer);

  function onScroll() {
    doc.classList.toggle('skip-on', scrollY > innerHeight * 0.6);
    doc.classList.toggle('skip-off', scrollY > S.maxScroll - 40 || doc.classList.contains('reg-in'));
    if (mode === 'full') kick(); else if (mode === 'static') staticUpdate();
  }

  /* ------------------------------------------------------------ boot and rebuilds */
  // phones: the URL bar collapsing changes only the height a little; that must not rebuild the climb
  var vw = innerWidth, vh = innerHeight, rebuildT = 0, mainH = 0;
  function rebuild(force) {
    if (!force && Math.abs(innerWidth - vw) < 1 && Math.abs(innerHeight - vh) < 150) return;
    clearTimeout(rebuildT);
    rebuildT = setTimeout(function () {
      vw = innerWidth; vh = innerHeight;
      layout();
      last.palE = -1e9; last.contour = -1;
      if (mode === 'full') { draw(); kick(); } else { staticAt = null; staticUpdate(); }
    }, 150);
  }
  addEventListener('resize', function () { rebuild(); });
  addEventListener('scroll', onScroll, { passive: true });
  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      var h = $('main').offsetHeight;
      if (Math.abs(h - mainH) > 4) { mainH = h; rebuild(true); }
    }).observe($('main'));
  }
  if (reduced.addEventListener) reduced.addEventListener('change', setMode);

  // first paint first: measuring and drawing the climb waits for an idle moment so taps work at once
  (window.requestIdleCallback || setTimeout)(function () { setMode(); onScroll(); }, { timeout: 700 });
})();
