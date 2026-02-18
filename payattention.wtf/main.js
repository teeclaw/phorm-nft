'use strict';

window.addEventListener('load', () => {
  if (typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // ── Nav hide/show ──────────────────────────────────────────
  const nav = document.querySelector('.nav');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > 80) nav.classList.add('nav--hidden');
    else nav.classList.remove('nav--hidden');
    lastY = y;
  }, { passive: true });

  // ── Hero entrance ──────────────────────────────────────────
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero__tag', { opacity: 0, y: -16, duration: 0.5 }, 0.1)
    .from('.hero__line', {
      opacity: 0, yPercent: 110, duration: 0.75, stagger: 0.1,
    }, 0.25)
    .from('.hero__sub', { opacity: 0, y: 20, duration: 0.6 }, 0.85)
    .from('.hero__cta .btn', { opacity: 0, y: 16, duration: 0.5, stagger: 0.1 }, 0.95)
    .from('.hero__arrow-bg', { opacity: 0, scale: 0.8, duration: 1.2, ease: 'power2.out' }, 0.2);

  // ── Scroll reveals ─────────────────────────────────────────
  const fadeUp = (selector, stagger = 0.08) => {
    gsap.utils.toArray(selector).forEach((el, i) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        opacity: 0, y: 40, duration: 0.65, ease: 'power3.out',
        delay: i * stagger,
      });
    });
  };

  fadeUp('.stat', 0.1);
  fadeUp('.card', 0.1);
  fadeUp('.trow', 0.05);

  // CTA section
  gsap.from('.cta-final__arrow', {
    scrollTrigger: { trigger: '.cta-final', start: 'top 75%', once: true },
    opacity: 0, y: -40, scale: 0.5, duration: 0.8, ease: 'back.out(1.7)',
  });
  gsap.from('.cta-final__headline', {
    scrollTrigger: { trigger: '.cta-final', start: 'top 75%', once: true },
    opacity: 0, y: 60, duration: 0.9, ease: 'power3.out', delay: 0.2,
  });
  gsap.from(['.cta-final__sub', '.cta-final .btn', '.cta-final__links'], {
    scrollTrigger: { trigger: '.cta-final', start: 'top 75%', once: true },
    opacity: 0, y: 24, duration: 0.6, ease: 'power3.out', stagger: 0.12, delay: 0.45,
  });

  // ── Smooth anchor scroll ───────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });

  // ── Resize cleanup ─────────────────────────────────────────
  window.addEventListener('resize', () => ScrollTrigger.refresh(), { passive: true });
});
