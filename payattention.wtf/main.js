'use strict';

// Wait for GSAP
window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, SplitText);

  // ── Nav hide/show on scroll ────────────────────────────────
  const nav = document.querySelector('.nav');
  let lastY = 0;
  ScrollTrigger.create({
    start: 'top -80',
    onUpdate(self) {
      const y = window.scrollY;
      if (y > lastY && y > 80) {
        nav.classList.add('nav--hidden');
      } else {
        nav.classList.remove('nav--hidden');
      }
      lastY = y;
    },
  });

  // ── Hero entrance ─────────────────────────────────────────
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // Ticker
  tl.from('.hero__ticker', { opacity: 0, y: -20, duration: 0.6 }, 0.2);

  // Eyebrow
  tl.from('.hero__eyebrow', { opacity: 0, y: 16, duration: 0.5 }, 0.4);

  // Headline lines — split and animate each word
  const heroLines = document.querySelectorAll('.hero__headline .line');
  heroLines.forEach((line, i) => {
    let split;
    try {
      split = SplitText.create(line, { type: 'words,chars' });
      tl.from(split.chars, {
        opacity: 0,
        y: 60,
        duration: 0.7,
        stagger: 0.015,
      }, 0.5 + i * 0.12);
    } catch {
      tl.from(line, { opacity: 0, y: 40, duration: 0.7 }, 0.5 + i * 0.12);
    }
  });

  // Sub + CTA
  tl.from('.hero__sub', { opacity: 0, y: 24, duration: 0.6 }, 0.95);
  tl.from('.hero__cta .btn', {
    opacity: 0,
    y: 16,
    duration: 0.5,
    stagger: 0.1,
  }, 1.1);
  tl.from('.hero__scroll-hint', { opacity: 0, duration: 0.5 }, 1.4);

  // ── Stats counter ──────────────────────────────────────────
  const statNums = document.querySelectorAll('.stat__num[data-target]');
  statNums.forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter() {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate() {
            el.textContent = Math.round(this.targets()[0].val);
          },
        });
      },
    });
  });

  // ── Scroll reveals ─────────────────────────────────────────
  const revealEls = [
    '.stat',
    '.why-card',
    '.trow',
  ];

  revealEls.forEach(selector => {
    gsap.utils.toArray(selector).forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
        opacity: 0,
        y: 32,
        duration: 0.65,
        ease: 'power3.out',
        delay: i * 0.06,
      });
    });
  });

  // ── Final CTA headline ─────────────────────────────────────
  const ctaLines = document.querySelectorAll('.final-cta__headline .line');
  ctaLines.forEach((line, i) => {
    gsap.from(line, {
      scrollTrigger: {
        trigger: '.final-cta',
        start: 'top 75%',
        once: true,
      },
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: 'power3.out',
      delay: i * 0.15,
    });
  });

  gsap.from('.final-cta__sub', {
    scrollTrigger: { trigger: '.final-cta', start: 'top 75%', once: true },
    opacity: 0, y: 20, duration: 0.6, ease: 'power3.out', delay: 0.4,
  });

  gsap.from('.final-cta .btn', {
    scrollTrigger: { trigger: '.final-cta', start: 'top 75%', once: true },
    opacity: 0, y: 20, duration: 0.6, ease: 'power3.out', delay: 0.6,
  });

  // ── Live price ticker sim ──────────────────────────────────
  // Animates fake price to create energy. Replace with real data later.
  const priceEl = document.getElementById('livePrice');
  const changeEl = document.getElementById('liveChange');

  if (priceEl) {
    let basePrice = 0.0000042;
    setInterval(() => {
      const delta = (Math.random() - 0.45) * 0.000001;
      basePrice = Math.max(0.0000001, basePrice + delta);
      priceEl.textContent = '$' + basePrice.toFixed(7);
    }, 2400);
  }

  // ── Smooth anchor scrolling ────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      gsap.to(window, {
        scrollTo: { y: target, offsetY: 80 },
        duration: 1,
        ease: 'power3.inOut',
      });
    });
  });

  // Cleanup on resize
  window.addEventListener('resize', () => ScrollTrigger.refresh());
});
