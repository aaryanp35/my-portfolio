/* Aaryan Patel portfolio.
   Core features (theme, nav, copy, clock, scroll-spy) run without any library.
   Motion runs only when GSAP loaded and the page still has the "js" class. */
(function () {
  'use strict';

  var html = document.documentElement;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var lenis = null;

  /* ---------- Theme ---------- */
  var THEME_KEY = 'ap-theme';
  var THEME_BG = { dark: '#0B0D10', light: '#F6F4EF' };

  function storedTheme() {
    try {
      var t = localStorage.getItem(THEME_KEY);
      return t === 'light' || t === 'dark' ? t : null;
    } catch (e) { return null; }
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    $$('meta[name="theme-color"]').forEach(function (m) { m.setAttribute('content', THEME_BG[theme]); });
    var btn = $('#theme-toggle');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function initTheme() {
    applyTheme(html.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    var btn = $('#theme-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage unavailable */ }
        if (document.startViewTransition && !reduceMQ.matches) {
          document.startViewTransition(function () { applyTheme(next); });
        } else {
          applyTheme(next);
        }
      });
    }
    var sysMQ = window.matchMedia('(prefers-color-scheme: light)');
    var onSys = function (e) { if (!storedTheme()) applyTheme(e.matches ? 'light' : 'dark'); };
    if (sysMQ.addEventListener) sysMQ.addEventListener('change', onSys);
  }

  /* ---------- Header, menu, scroll-spy ---------- */
  function initNav() {
    var header = $('#top-bar');
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var toggle = $('#nav-toggle');
    var nav = $('#site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !e.target.closest('.nav')) setOpen(false);
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) { if (e.matches) setOpen(false); });
  }

  function initSpy() {
    if (!('IntersectionObserver' in window)) return;
    var links = $$('[data-spy]');
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('data-spy')] = a; });
    function mark(id) {
      links.forEach(function (a) {
        if (byId[id] === a) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) mark(en.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    ['top'].concat(Object.keys(byId)).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  /* ---------- Copy email ---------- */
  function initCopy() {
    var btn = $('#copy-email');
    var status = $('#copy-status');
    if (!btn || !status) return;
    var timer;
    function done(ok) {
      status.textContent = ok ? 'Copied' : 'Press Ctrl+C to copy';
      clearTimeout(timer);
      timer = setTimeout(function () { status.textContent = ''; }, 2200);
    }
    function fallback(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-email');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback(text)); });
      } else {
        done(fallback(text));
      }
    });
  }

  /* ---------- Footer clock ---------- */
  function initClock() {
    var el = $('#local-time');
    if (!el) return;
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles', timeZoneName: 'short' });
    } catch (e) { return; }
    function tick() { el.textContent = 'Local time ' + fmt.format(new Date()); }
    tick();
    setInterval(tick, 20000);
  }

  /* ---------- Motion ---------- */
  function countFormat(el, v) {
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    return pre + Math.round(v).toLocaleString('en-US') + suf;
  }

  function initMotion() {
    var ready = function () { window.__apReady = true; };

    if (!window.gsap || !window.ScrollTrigger || !html.classList.contains('js')) {
      html.classList.remove('js');
      ready();
      return;
    }

    var plugins = [window.ScrollTrigger];
    if (window.SplitText) plugins.push(window.SplitText);
    if (window.MotionPathPlugin) plugins.push(window.MotionPathPlugin);
    gsap.registerPlugin.apply(gsap, plugins);

    var mm = gsap.matchMedia();

    mm.add({
      motion: '(prefers-reduced-motion: no-preference)',
      reduce: '(prefers-reduced-motion: reduce)',
      fine: '(hover: hover) and (pointer: fine)',
      stack: '(min-width: 800px)'
    }, function (ctx) {
      var c = ctx.conditions;

      /* Reduced motion: everything renders in its final state. */
      if (c.reduce) {
        html.classList.remove('js');
        return;
      }
      html.classList.add('js');

      /* 3. Lenis smooth scroll (non-touch only) */
      var tick;
      if (c.fine && window.Lenis) {
        lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        tick = function (t) { lenis.raf(t * 1000); };
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }

      /* 1. Masked line reveal on headings */
      $$('[data-split]').forEach(function (el) {
        if (!window.SplitText) { el.classList.add('is-split'); return; }
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'line',
          autoSplit: true,
          onSplit: function (self) {
            el.classList.add('is-split');
            if (el._apDone) return undefined;
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: 0.9,
              ease: 'expo.out',
              stagger: 0.08,
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
              onComplete: function () { el._apDone = true; }
            });
          }
        });
      });

      /* 2. Card fade-up (transform and opacity only) */
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 90%',
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06, overwrite: true });
        }
      });

      /* 4. Timeline rail draw and dot pops */
      var tl = $('[data-timeline]');
      if (tl) {
        gsap.to($('.rail-fill', tl), {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: tl, start: 'top 65%', end: 'bottom 65%', scrub: 0.5 }
        });
        $$('.entry', tl).forEach(function (entry) {
          var dot = $('.dot', entry);
          ScrollTrigger.create({
            trigger: entry,
            start: 'top 60%',
            once: true,
            onEnter: function () { gsap.to(dot, { scale: 1, duration: 0.3, ease: 'back.out(2)' }); }
          });
        });
      }

      /* 5. Cursor spotlight on bento tiles */
      if (c.fine) {
        $$('.tile').forEach(function (tile) {
          var raf = 0, px = 0, py = 0;
          tile.addEventListener('pointermove', function (e) {
            var r = tile.getBoundingClientRect();
            px = e.clientX - r.left;
            py = e.clientY - r.top;
            if (raf) return;
            raf = requestAnimationFrame(function () {
              raf = 0;
              tile.style.setProperty('--mx', px + 'px');
              tile.style.setProperty('--my', py + 'px');
            });
          });
        });
      }

      /* 6. Count-up metrics */
      $$('.count').forEach(function (el) {
        var target = parseFloat(el.getAttribute('data-to'));
        if (isNaN(target)) return;
        var proxy = { v: 0 };
        if (el._apCounted) return;
        el.textContent = countFormat(el, 0);
        ScrollTrigger.create({
          trigger: el,
          start: 'top 92%',
          once: true,
          onEnter: function () {
            gsap.to(proxy, {
              v: target,
              duration: 1.4,
              ease: 'power2.out',
              onUpdate: function () { el.textContent = countFormat(el, proxy.v); },
              onComplete: function () { el.textContent = countFormat(el, target); el._apCounted = true; }
            });
          }
        });
      });

      /* 7. Payment flow: lines draw, nodes appear, a dot follows the path */
      var svg = $('#flow-svg');
      if (svg) {
        var main = $('#flow-main');
        var branches = $$('.flow-branch', svg);
        var dot = $('#flow-dot');
        var nodes = $$('[data-node]', svg);
        var T = 1.2;
        var at = function (y) { return ((y - 54) / (340 - 54)) * T; };
        var flow = gsap.timeline({
          paused: true,
          defaults: { ease: 'power1.inOut' },
          scrollTrigger: { trigger: svg, start: 'top 72%', once: true, onEnter: function () { flow.play(); } }
        });
        flow.fromTo(nodes[0], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, 0);
        flow.to(main, { strokeDashoffset: 0, duration: T }, 0.1);
        if (window.MotionPathPlugin) {
          flow.set(dot, { opacity: 1 }, 0.1);
          flow.to(dot, { motionPath: { path: main, align: main, alignOrigin: [0.5, 0.5] }, duration: T }, 0.1);
        } else {
          flow.set(dot, { opacity: 1 }, 0.1);
          flow.fromTo(dot, { attr: { cy: 54 } }, { attr: { cy: 340 }, duration: T }, 0.1);
        }
        // nodes[1] orchestrator, [2] router, [3..5] acquirers, [6..7] labels
        flow.fromTo(nodes[1], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, 0.1 + at(120));
        flow.fromTo(nodes[6], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power3.out' }, 0.1 + at(80));
        flow.fromTo(nodes[2], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, 0.1 + at(230));
        flow.fromTo(nodes[7], { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power3.out' }, 0.1 + at(190));
        flow.to(branches, { strokeDashoffset: 0, duration: 0.7, stagger: 0.1 }, 0.1 + at(274));
        flow.fromTo([nodes[4]], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, 0.1 + T - 0.1);
        flow.fromTo([nodes[3], nodes[5]], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.1, ease: 'power3.out' }, 0.1 + at(274) + 0.5);
      }

      /* 8. Magnetic CTAs */
      var magnets = [];
      if (c.fine) {
        magnets = $$('[data-magnetic]').map(function (el) {
          return {
            el: el,
            qx: gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' }),
            qy: gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })
          };
        });
        var onMove = function (e) {
          magnets.forEach(function (m) {
            var r = m.el.getBoundingClientRect();
            var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            var dx = e.clientX - cx, dy = e.clientY - cy;
            var outX = Math.max(Math.abs(dx) - r.width / 2, 0);
            var outY = Math.max(Math.abs(dy) - r.height / 2, 0);
            if (Math.hypot(outX, outY) <= 80) { m.qx(dx * 0.25); m.qy(dy * 0.25); }
            else { m.qx(0); m.qy(0); }
          });
        };
        var onLeave = function () { magnets.forEach(function (m) { m.qx(0); m.qy(0); }); };
        window.addEventListener('pointermove', onMove, { passive: true });
        document.documentElement.addEventListener('pointerleave', onLeave);
      }

      /* 9. Sticky stacked project cards */
      if (c.stack) {
        var cards = $$('.stack-card');
        cards.forEach(function (card, i) {
          if (i === cards.length - 1) return;
          var nextTop = 80 + (i + 1) * 16;
          gsap.to(card, {
            scale: 0.95,
            opacity: 0.6,
            ease: 'none',
            scrollTrigger: { trigger: cards[i + 1], start: 'top 85%', end: 'top ' + nextTop + 'px', scrub: true }
          });
        });
      }

      /* Athletics strip: looping oar-stroke dot */
      var oar = $('#oar-path');
      if (oar && window.MotionPathPlugin) {
        var stroke = gsap.to('#oar-dot', {
          motionPath: { path: oar, align: oar, alignOrigin: [0.5, 0.5] },
          duration: 3,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          paused: true
        });
        ScrollTrigger.create({
          trigger: '.oar',
          start: 'top bottom',
          end: 'bottom top',
          onToggle: function (self) { stroke.paused(!self.isActive); }
        });
      }

      /* Anchor links through Lenis */
      var onAnchor = function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a || !lenis) return;
        var id = a.getAttribute('href').slice(1);
        var target = id ? document.getElementById(id) : document.body;
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(id === 'top' || !id ? 0 : target, { offset: id === 'top' ? 0 : -63 });
        history.replaceState(null, '', id ? '#' + id : location.pathname);
      };
      document.addEventListener('click', onAnchor);

      /* Refresh once fonts settle so triggers use final layout */
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });

      return function () {
        document.removeEventListener('click', onAnchor);
        if (tick) gsap.ticker.remove(tick);
        if (lenis) { lenis.destroy(); lenis = null; }
      };
    });

    ready();
  }

  /* ---------- Rotating greeting (contact heading) ---------- */
  function initRotator() {
    var word = $('#rot-word');
    var section = $('#contact');
    if (!word || !section || !window.gsap || reduceMQ.matches || !html.classList.contains('js')) return;
    var words = [
      ['hello', 'en'], ['hola', 'es'], ['\u3053\u3093\u306B\u3061\u306F', 'ja'], ['bonjour', 'fr'], ['ciao', 'it'],
      ['\u4F60\u597D', 'zh'], ['ol\u00E1', 'pt'], ['namaste', 'hi-Latn'], ['\u043F\u0440\u0438\u0432\u0435\u0442', 'ru'], ['hallo', 'de']
    ];
    var i = 0, timer = 0, visible = false, started = false;

    function step() {
      timer = 0;
      if (!visible || reduceMQ.matches) return;
      gsap.to(word, {
        yPercent: -110, duration: 0.4, ease: 'power2.in',
        onComplete: function () {
          i = (i + 1) % words.length;
          word.textContent = words[i][0];
          word.setAttribute('lang', words[i][1]);
          gsap.fromTo(word, { yPercent: 110 }, { yPercent: 0, duration: 0.4, ease: 'power3.out' });
        }
      });
      timer = setTimeout(step, 1750);
    }
    function schedule(delay) { if (!timer) timer = setTimeout(step, delay); }

    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) { schedule(started ? 1750 : 2000); started = true; }
      else { clearTimeout(timer); timer = 0; }
    }, { threshold: 0.2 }).observe(section);
  }

  initTheme();
  initNav();
  initSpy();
  initCopy();
  initClock();
  initMotion();
  initRotator();
})();
