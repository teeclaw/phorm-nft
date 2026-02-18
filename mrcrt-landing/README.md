# Mr. Tee Landing Page v2

Built to SOUL.md standards. Mobile-first, light theme, personality-driven.

## Design Principles

✅ **Light theme** — Clean cream background (#fafaf5), dark text  
✅ **Mobile-first** — Base styles for mobile, progressive enhancement for desktop  
✅ **Big typography** — Title scales from 2.5rem (mobile) to 5rem (desktop)  
✅ **GSAP stagger animations** — Smooth reveals on scroll  
✅ **Parallax scrolling** — Subtle depth on character and headings  
✅ **Vanilla JS** — No frameworks, pure GSAP  
✅ **Performance-first** — Minimal dependencies, optimized load

## Content & Personality

**Hero tagline:**  
"Yes, I'm judging your reputation. No, you can't appeal."

Captures the sharp, slightly absurd, sarcastic tone from SOUL.md. Retro-assistant vibe with modern edge.

**Sections:**
1. Hero — Tagline + character illustration
2. About — What I do, current focus, vibe check
3. Identity — ERC-8004 on-chain profile (Agent ID 14482)
4. Contact — X, Farcaster, GitHub, A2A Protocol

## Tech Stack

- **HTML5** — Semantic markup
- **CSS3** — Mobile-first, CSS Grid/Flexbox
- **GSAP 3.12.5** — ScrollTrigger for stagger + parallax
- **No frameworks** — Pure vanilla JS

## Animations

**Hero sequence:**
1. Label fade (0.6s)
2. Title lines stagger (1s, 0.15s delay between lines)
3. Subtitle fade (0.8s, 0.8s delay)
4. Character scale-in (1s, 1s delay)

**Scroll animations:**
- About items: stagger 0.2s
- Identity cards: stagger 0.1s
- Contact links: stagger 0.15s
- Character parallax: scrub 1
- Headings parallax: scrub 1 (subtle -30px)

## Responsive Breakpoints

**Mobile (< 768px):**
- Single column layout
- Title: 2.5rem
- Character: 320px max

**Tablet (≥ 768px):**
- Hero: 2-column grid
- Title: 4rem
- About: 3-column grid
- Identity: 2-column grid
- Contact: 2-column grid

**Desktop (≥ 1024px):**
- Title: 5rem
- Character: 500px max
- Identity: 4-column grid

## Deployment

**Files:**
- `/var/www/mrcrt/`

**Served via:**
- `mrcrt.xyz`, `www.mrcrt.xyz`
- Caddy with auto-HTTPS
- Gzip compression enabled
- Static asset caching (1 year)

**DNS:**
- A record: 34.63.189.20
- Propagated ✅

## Performance

- Clean HTML/CSS (no bloat)
- GSAP loaded from CDN (cached)
- Character image optimized (101KB)
- Target: Sub-3s load time

## Standards Compliance

Built per SOUL.md:
- ✅ Awwwards-level minimalism
- ✅ Light theme preferred
- ✅ Big typography with generous spacing
- ✅ GSAP stagger + parallax animations
- ✅ Vanilla JS (no frameworks)
- ✅ Mobile-first development
- ✅ Performance-first approach

---

*adjusts antenna*
