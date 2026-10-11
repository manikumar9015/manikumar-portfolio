/* ═══════════════════════════════════════════════════════════
   Mani Kumar — Portfolio
   Motion layer: Lenis + GSAP ScrollTrigger + canvas particles
   ═══════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches || window.innerWidth <= 900;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ─────────────────── PRELOADER ─────────────────── */
  const preloader = $('#preloader');
  const bar = $('#preloaderBar');
  const pct = $('#preloaderPct');
  let progress = 0;
  const fakeLoad = setInterval(() => {
    progress = Math.min(progress + Math.random() * 14, 92);
    bar.style.width = progress + '%';
    pct.textContent = Math.round(progress) + '%';
  }, 130);

  function finishLoad() {
    clearInterval(fakeLoad);
    progress = 100;
    bar.style.width = '100%';
    pct.textContent = '100%';
    setTimeout(() => {
      preloader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      startIntro();
    }, 420);
  }

  window.addEventListener('load', () => setTimeout(finishLoad, 600));
  // hard fallback in case load never fires
  setTimeout(() => { if (!preloader.classList.contains('is-done')) finishLoad(); }, 4500);

  /* ─────────────────── LENIS SMOOTH SCROLL ─────────────────── */
  let lenis = null;
  if (window.Lenis && !reduced) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.6 });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // anchor links → smooth scroll
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -60 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ─────────────────── SCROLL PROGRESS + NAV ─────────────────── */
  const scrollBar = $('#scrollBar');
  const nav = $('#nav');
  function onScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollBar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    nav.classList.toggle('is-stuck', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ─────────────────── MOBILE MENU ─────────────────── */
  const burger = $('#burger');
  const menu = $('#mobileMenu');
  function closeMenu() {
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }
  burger.addEventListener('click', () => {
    const open = !menu.classList.contains('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    if (lenis) open ? lenis.stop() : lenis.start();
  });

  /* ─────────────────── CUSTOM CURSOR ─────────────────── */
  if (!isTouch && !reduced) {
    const cursor = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest('a,button,[data-cursor]');
      if (!t) { cursor.classList.remove('is-hover', 'is-view', 'is-hide'); return; }
      const mode = t.dataset.cursor;
      cursor.classList.toggle('is-hide', mode === 'hide');
      cursor.classList.toggle('is-view', mode === 'view');
      cursor.classList.toggle('is-hover', !mode || mode === 'hover');
    });
  }

  /* ─────────────────── TERMINAL TYPER ─────────────────── */
  const typer = $('#typer');
  const lines = [
    { t: '$ whoami', c: 'c-com' },
    { t: 'Mani Kumar — Software Engineer', c: '' },
    { t: '$ cat focus.json', c: 'c-com' },
    { t: '{ "ai": "RAG + agents",', c: 'c-key' },
    { t: '  "stack": ["React","FastAPI","Java"],', c: 'c-str' },
    { t: '  "status": "open to work" }', c: 'c-key' },
  ];
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  function typeTerminal() {
    if (!typer) return;
    typer.innerHTML = '';
    let li = 0, ci = 0;
    const step = () => {
      if (li >= lines.length) return;
      let out = '';
      for (let k = 0; k < li; k++) out += `<span class="${lines[k].c}">${esc(lines[k].t)}</span>\n`;
      out += `<span class="${lines[li].c}">${esc(lines[li].t.slice(0, ci + 1))}</span>`;
      typer.innerHTML = out;
      ci++;
      if (ci >= lines[li].t.length) { li++; ci = 0; setTimeout(step, 240); }
      else setTimeout(step, 20 + Math.random() * 24);
    };
    step();
  }

  /* ─────────────────── COUNTERS ─────────────────── */
  function runCounter(el) {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1500; const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ─────────────────── GSAP INTRO + SCROLL ─────────────────── */
  function startIntro() {
    if (!window.gsap) { document.body.classList.add('no-js'); $$('[data-reveal]').forEach(e => e.classList.add('in')); typeTerminal(); return; }

    // wrap hero lines for mask reveal
    $$('[data-reveal-line]').forEach(el => {
      const inner = document.createElement('span');
      inner.className = 'inner';
      inner.innerHTML = el.innerHTML;
      el.innerHTML = '';
      el.appendChild(inner);
    });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero__badge', { opacity: 1, y: 0, duration: .7 }, 0)
      .to('.hero__title .inner', { y: '0%', duration: 1.05, stagger: .12 }, .1)
      .to('.hero__sub', { opacity: 1, y: 0, duration: .8 }, .55)
      .to('.hero__cta', { opacity: 1, y: 0, duration: .8 }, .7)
      .to('.hero__socials', { opacity: 1, y: 0, duration: .8 }, .82)
      .to('.hero__terminal', { opacity: 1, y: 0, duration: 1 }, .5)
      .add(typeTerminal, .9);

    if (reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    // generic reveals
    $$('[data-reveal]').forEach(el => {
      if (el.closest('.hero')) return;
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        delay: (el.dataset.delay || 0)
      });
    });

    // timeline spine draw
    const spine = $('.timeline__spine');
    if (spine) gsap.to(spine, {
      '--spine': 1, duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: '.timeline', start: 'top 75%', once: true }
    });

    // project art bars
    $$('.art__bar span').forEach(b => gsap.from(b, {
      scaleX: 0, duration: 1.2, ease: 'power3.out',
      scrollTrigger: { trigger: b, start: 'top 90%', once: true }
    }));

    // counters
    $$('[data-count]').forEach(el => {
      ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => runCounter(el) });
    });

    // section titles parallax
    $$('.section__title').forEach(t => gsap.fromTo(t, { y: 26 }, {
      y: -26, ease: 'none',
      scrollTrigger: { trigger: t, start: 'top bottom', end: 'bottom top', scrub: true }
    }));

    // marquee subtle skew on scroll
    gsap.fromTo('.marquee__track', { x: 0 }, {
      x: -80, ease: 'none',
      scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true }
    });

    // nav active link
    $$('section[id]').forEach(sec => {
      ScrollTrigger.create({
        trigger: sec, start: 'top 45%', end: 'bottom 45%',
        onToggle: (self) => {
          const link = $(`.nav__links a[href="#${sec.id}"]`);
          if (link) link.classList.toggle('is-active', self.isActive);
        }
      });
    });

    // project spotlight follows pointer
    $$('.project').forEach(p => {
      p.addEventListener('mousemove', (e) => {
        const r = p.getBoundingClientRect();
        p.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        p.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    // magnetic buttons
    if (!isTouch) $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - (r.left + r.width / 2)) * .28, y: (e.clientY - (r.top + r.height / 2)) * .4, duration: .5, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
    });

    // 3D tilt cards
    if (!isTouch) $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        gsap.to(card, { rotationY: px * 8, rotationX: -py * 8, transformPerspective: 900, transformOrigin: 'center', duration: .5, ease: 'power2.out' });
      });
      card.addEventListener('mouseleave', () => gsap.to(card, { rotationY: 0, rotationX: 0, duration: .7, ease: 'power3.out' }));
    });
  }

  /* ─────────────────── PARTICLE CANVAS ─────────────────── */
  (function particles() {
    const canvas = $('#particles');
    if (!canvas || reduced) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr, dots = [];
    const COUNT = () => Math.min(90, Math.floor(innerWidth / 16));

    function resize() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.width = innerWidth * dpr;
      h = canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      build();
    }
    function build() {
      dots = Array.from({ length: COUNT() }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .28 * dpr, vy: (Math.random() - .5) * .28 * dpr,
        r: (Math.random() * 1.6 + .4) * dpr,
        hue: [ '124,92,255', '34,211,238', '255,77,157' ][Math.floor(Math.random() * 3)]
      }));
    }
    const mouse = { x: -9999, y: -9999 };
    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; });
    window.addEventListener('resize', resize);

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        // pointer repulsion
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150 * dpr) { d.x += dx / dist * 1.2; d.y += dy / dist * 1.2; }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${d.hue},.65)`;
        ctx.fill();

        for (let j = i + 1; j < dots.length; j++) {
          const o = dots[j];
          const ddx = d.x - o.x, ddy = d.y - o.y;
          const dd = Math.hypot(ddx, ddy);
          if (dd < 130 * dpr) {
            ctx.beginPath();
            ctx.moveTo(d.x, d.y); ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = `rgba(${d.hue},${.14 * (1 - dd / (130 * dpr))})`;
            ctx.lineWidth = dpr * .6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(frame);
    }
    resize(); frame();
  })();

  /* ─────────────────── MISC ─────────────────── */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // marquee duplicate safety (if track too short, double it)
  const track = $('.marquee__track');
  if (track && track.scrollWidth < innerWidth * 2) track.innerHTML += track.innerHTML;

})();
