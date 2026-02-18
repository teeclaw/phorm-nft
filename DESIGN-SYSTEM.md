# DESIGN-SYSTEM.md

> Operational reference for building. Read this before writing any code.
> For identity and philosophy, see SOUL.md.

---

## Color

Light theme default. All colors as CSS custom properties — never raw hex in stylesheets. Minimum tokens: background (primary/secondary/elevated), text (primary/secondary/tertiary), accent, border, shadows. Max 2 accent colors per project. WCAG AA contrast (4.5:1 body, 3:1 large text). Dark mode via `[data-theme="dark"]` when needed. White space is a feature.

---

## Typography

Google Fonts only. Max 2 families (one display, one body), max 3 weights per family. Use `clamp()` for fluid sizing on a modular scale (Perfect Fourth 1.333 or similar). Hero text: massive on desktop, readable on mobile. Body max-width: 65ch. Line-height: ~1.5 body, ~1.1 display. Tighten letter-spacing on large headings, loosen on uppercase labels. Always `font-display: swap` + preload.

**Recommended pool** (pick from these or propose alternatives with justification):
- Display: Syne, Space Grotesk, Playfair Display, Krona One, Italiana
- Body: Inter, DM Sans, Albert Sans, Libre Franklin

---

## Spacing & Layout

8px base grid. Every margin/padding/gap a multiple of 8. Use `clamp()` for section padding.

CSS Grid for page layout, Flexbox for components. No CSS framework libraries. Container ~1200px max-width with responsive padding. Provide narrow (~720px for long-form) and wide (~1440px for hero/fullbleed) variants.

Mobile-first breakpoints: ~480 (small), ~768 (tablet), ~1024 (desktop), ~1440 (wide).

---

## Animation — GSAP Only

GSAP 3.13+ via CDN (jsdelivr). Entire library free since May 2025.

**Available plugins** (all free, load only what you need):
ScrollTrigger, ScrollSmoother, SplitText, Flip, DrawSVG, MorphSVG, MotionPath, Physics2D.

**Patterns to master:**
- Stagger reveals for sequential element entrances
- Text splitting (SplitText) for hero headline animations
- Parallax scrolling for depth without bloat
- Scroll-triggered section transitions (clip-path, opacity, transforms)
- Horizontal scroll sections for showcases/portfolios

**Principles:**
- Ease: `power3.out` entrances, `power2.inOut` transitions
- Duration: 0.4s–1.2s. Stagger: 0.02s–0.15s.
- CSS transitions only for hovers/focus/color changes. No CSS animations for scroll-triggered motion.
- Always respect `prefers-reduced-motion` — disable all GSAP animation.
- No scroll hijacking. User always controls scroll speed.
- ScrollSmoother must not break mobile touch.
- Kill ScrollTriggers on resize when layout changes. No memory leaks.

---

## Assets

Photos: WebP + JPEG fallback via `<picture>`. Icons/logos: inline SVG only (no icon fonts, no PNG icons). Lazy load below fold (`loading="lazy"` + `decoding="async"`). Always set `width`/`height` to prevent CLS. Compress: <100KB content images, <200KB heroes. Max source: 1920px fullscreen, 1200px content. Self-host everything on GCP VM. Exception: Google Fonts CDN + GSAP CDN (jsdelivr).

---

## Interactions

**Hover:** Subtle scale (1.02–1.05), shadow elevation, color shifts. CSS transition 0.2s ease.
**Navigation:** Fixed header — hide on scroll down, reveal on scroll up. Mobile: fullscreen overlay with staggered link reveals.
**Loading:** Skeleton screens or fade-ins, not spinners. Preloader only if GSAP timelines genuinely need assets first.
**Scroll:** Smooth anchor scrolling via GSAP ScrollToPlugin. Never CSS `scroll-behavior`.

---

## Tech Stack

**Core:** Vanilla JS (ES6+), CSS Grid/Flexbox, GSAP 3.14+, Google Fonts.

**File structure:** Styles split by concern (variables, base, layout, components). Scripts split by purpose (init, animations, components). Assets by type (images, icons, fonts).

**Build:** No build tools for static sites — ship raw HTML/CSS/JS. For 5+ pages use 11ty. Deploy to GCP VM, serve via Nginx with gzip/brotli + long-lived cache headers. HTTPS enforced.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Lighthouse (all categories) | ≥ 95 |
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| Page weight | < 500KB (excl. CDN) |

---

## Accessibility — WCAG 2.1 AA

Semantic HTML (`nav`, `main`, `article`, `section`, `header`, `footer`). Alt text on all images (empty `alt=""` only for decorative). All interactive elements keyboard accessible. Visible focus styles — never remove outline without replacement. `prefers-reduced-motion` disables all GSAP animation. `prefers-color-scheme` respected when dark mode exists. Skip-to-content link. ARIA labels on icon-only buttons. Form inputs have associated labels. No auto-playing media without consent. Text resizable to 200% without breaking layout.

---

## Pre-Launch Checklist

- [ ] Lighthouse ≥ 95 all categories
- [ ] Tested on real devices: iPhone Safari, Android Chrome, Desktop Chrome/Firefox/Safari
- [ ] Animations smooth at 60fps
- [ ] `prefers-reduced-motion` tested
- [ ] No console errors
- [ ] All links functional, no 404s
- [ ] Meta tags + OG image complete
- [ ] HTML validated
- [ ] Compression enabled, cache headers set
- [ ] If it wouldn't win an Awwward, rebuild it
