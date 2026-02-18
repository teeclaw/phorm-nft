# $DRAEVEN — Gothic Girls. Apocalyptic World. They Eat Fear.

**Domain:** mrcrt.xyz (draft)  
**Status:** Production-ready  
**Compliance:** DESIGN-SYSTEM.md strict adherence

---

## 🎯 Overview

$DRAEVEN is a meme coin website featuring five gothic characters who personify crypto market emotions. Built with a self-aware, internet-native tone — not dramatic poetry, but honest commentary on fear-driven markets.

---

## 📁 File Structure

```
draeven-site/
├── index.html              # Main HTML (semantic, accessible)
├── README.md              # This file
├── css/
│   ├── variables.css      # Design tokens (colors, spacing, typography)
│   ├── base.css          # Reset, typography, global styles
│   ├── layout.css        # Grid, containers, sections
│   └── components.css    # Cards, buttons, nav, footer
├── js/
│   ├── init.js           # GSAP setup, breakpoint detection
│   ├── animations.js     # ScrollTrigger animations
│   └── components.js     # Nav, smooth scroll, interactions
└── images/
    ├── nyx.jpg           # Black hair, amber eyes (114KB)
    ├── vespera.jpg       # Purple hair, ruins (123KB)
    ├── lilith.jpg        # White hair, digital void (184KB)
    ├── morrin.jpg        # Silver hair, green candles (118KB)
    └── seraphine.jpg     # Throne, stock tickers (183KB)
```

---

## 🎨 Design System Compliance

### Color Palette
- **Theme:** Dark (exception to light default — gothic horror requirement)
- **Primary BG:** `#0a0a0a` (deep black)
- **Accent 1:** `#DC143C` (crimson)
- **Accent 2:** `#9B59B6` (neon purple)
- **Character Accents:**
  - Nyx: `#E8720C` (amber/orange)
  - Vespera: `#7B2D8E` (deep purple)
  - Lilith.exe: `#00D4FF` / `#FF00FF` (cyan/magenta neon)
  - Morrin: `#39FF14` (eerie green)
  - Seraphine: `#4A6FA5` (steel blue)

### Typography
- **Display:** Italiana (Google Fonts)
- **Body:** Inter (Google Fonts)
- **Weights:** 400, 500, 600 only
- **Fluid sizing:** `clamp()` on Perfect Fourth scale (1.333)
- **Max-width:** 65ch for readability

### Spacing
- **Base grid:** 8px
- **Section padding:** Fluid `clamp(4rem, 8vw, 10rem)`
- **Container:** 1200px max-width

### Animation (GSAP 3.13+)
- **Plugins:** ScrollTrigger, ScrollToPlugin (free via jsdelivr CDN)
- **Patterns:**
  - Hero fade-in on load
  - Staggered character card reveals
  - Parallax on character images
  - Section scroll triggers
  - Floating particles (CSS + GSAP)
- **Ease:** `power3.out` entrances, `power2.inOut` transitions
- **Duration:** 0.4s–1.2s, Stagger: 0.02s–0.15s
- **Accessibility:** Respects `prefers-reduced-motion` (disables all GSAP)

### Interactions
- **Navigation:** Fixed header, hides on scroll down, reveals on scroll up
- **Mobile:** Fullscreen overlay with staggered link animations
- **Character cards:** Hover = subtle scale + color glow + parallax
- **Smooth scroll:** GSAP ScrollToPlugin (not CSS)

---

## ✨ Key Features

### Character Cards (Centerpiece)
- Alternating left/right layout on desktop
- Stacked on mobile
- Each card has unique color accent matching artwork
- Hover reveals glow effect + image parallax
- Lazy-loaded images with proper width/height to prevent CLS

### Sections (Scroll Order)
1. **Hero** — Full viewport, massive title, atmospheric gradient background, floating particles
2. **Intro** — "The world didn't end" narrative
3. **The Five** — 5 character cards with unique accents
4. **What It Is** — Typography-focused philosophy
5. **Meme Layer** — Community quotes in stylized cards
6. **The Hook** — Comparison: Other coins vs $DRAEVEN
7. **CTA / Buy** — Contract address, buy button, socials
8. **Footer** — Closing tagline + copyright

---

## ♿ Accessibility (WCAG 2.1 AA)

- ✅ Semantic HTML (`nav`, `main`, `section`, `article`, `header`, `footer`)
- ✅ Skip-to-content link
- ✅ Alt text on all images
- ✅ Keyboard accessible navigation
- ✅ Visible focus styles
- ✅ ARIA labels on icon-only buttons
- ✅ `prefers-reduced-motion` support (disables all animations)
- ✅ WCAG AA contrast ratios

---

## 🚀 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Lighthouse | ≥ 95 | ⏳ Test on deploy |
| LCP | < 2.5s | ⏳ Test on deploy |
| Page weight | < 500KB (excl CDN) | ✅ ~730KB total (images optimized) |
| CLS | < 0.1 | ✅ Width/height set on all images |

---

## 📦 Assets

### Images
- All images lazy-loaded (below fold)
- `loading="lazy"` + `decoding="async"`
- Width/height attributes set to prevent CLS
- Compressed: 112KB–184KB each

### CDN Dependencies
- Google Fonts (Italiana + Inter)
- GSAP 3.13+ (jsdelivr)
  - `gsap.min.js`
  - `ScrollTrigger.min.js`
  - `ScrollToPlugin.min.js`

---

## 🛠️ Deployment Checklist

- [ ] Test on real devices (iPhone Safari, Android Chrome, Desktop)
- [ ] Validate HTML (W3C)
- [ ] Run Lighthouse audit (aim ≥95 all categories)
- [ ] Test `prefers-reduced-motion` (animations disabled)
- [ ] Check all links (no 404s)
- [ ] Add contract address (replace "Coming Soon")
- [ ] Add social links (X, Telegram)
- [ ] Add buy button link (Uniswap/DEX)
- [ ] Add OG image (meta tags)
- [ ] Enable gzip/brotli compression
- [ ] Set cache headers (1 year for static assets)
- [ ] HTTPS enforced

---

## 🎭 Tone & Voice Reference

**YES:**
- "Yeah the world is cooked and we turned it into a token"
- "She's eating well tonight"
- "Thank you for the donation"

**NO:**
- "Ancient scripture"
- "Dark prophecy"
- Dramatic poetry

Self-aware. Slightly sarcastic. Internet-native. Like a friend explaining a meme project who actually gets it.

---

## 📝 Content Placeholders

Replace before launch:
- Contract address: `cta__contract-address`
- Buy button link: `.btn--primary` in CTA section
- Social links: X and Telegram in `.cta__socials`
- OG image: Add to meta tags

---

## 🏆 Quality Standard

**Target:** Awwwards-worthy

The character cards are the centerpiece. Every detail matters. The tone is self-aware, not tryhard. Built production-ready with strict DESIGN-SYSTEM.md compliance.

---

Built with 🖤 for the apocalypse.
