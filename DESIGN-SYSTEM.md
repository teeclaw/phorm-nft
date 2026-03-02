# DESIGN-SYSTEM.md

> Operational reference for building. Read this before writing any code.
> For identity and philosophy, see SOUL.md.

This design system ensures **clarity, performance, accessibility, and consistency** across all projects. Every decision must support usability, visual hierarchy, speed, and maintainability.

------------------------------------------------------------------------

# Design Principles

**Clarity over decoration**\
Every element must serve a purpose. Remove visual noise.

**Motion communicates structure**\
Animation should guide attention and explain spatial relationships.

**Performance is design**\
Fast load time and responsiveness are core parts of the experience.

**Depth without clutter**\
Use spacing, layering, and motion rather than visual complexity.

**White space creates hierarchy**\
Generous spacing improves comprehension and focus.

------------------------------------------------------------------------

# Design Tokens

All visual values must be defined using tokens. Never hardcode design values.

## Color Tokens

--color-bg-primary\
--color-bg-secondary\
--color-bg-elevated

--color-text-primary\
--color-text-secondary\
--color-text-tertiary

--color-accent-primary\
--color-accent-secondary

--color-border\
--color-shadow

Rules:

- Maximum **2 accent colors**
- Accent primary = interaction color
- Accent secondary = highlight color
- Maintain **WCAG AA contrast**

Element Ratio
------------ ---------
Body text ≥ 4.5:1
Large text ≥ 3:1

Dark mode supported via:

\[data-theme="dark"\]

------------------------------------------------------------------------

# Typography

Fonts must be **Google Fonts**.

Maximum:

- 2 families
- 3 weights per family

Recommended display fonts:

- Syne
- Space Grotesk
- Playfair Display
- Krona One
- Italiana

Recommended body fonts:

- Inter
- DM Sans
- Albert Sans
- Libre Franklin

## Typography Rules

Fluid sizing using clamp().

Preferred modular scale: 1.333 (Perfect Fourth)

Property Value
--------------------- -------
Body line-height 1.5
Display line-height 1.1
Max paragraph width 65ch

Optimization:

font-display: swap\
preload primary fonts

Base font size: 16px root

------------------------------------------------------------------------

# Spacing System

Use an **8px grid system**.

Examples:

8\
16\
24\
32\
48\
64\
96\
128

Section padding example:

padding-block: clamp(64px, 8vw, 128px);

------------------------------------------------------------------------

# Layout System

Use:

- CSS Grid for page layout
- Flexbox for components

CSS frameworks are not allowed.

## Containers

Type Width
---------- --------
Narrow 720px
Standard 1200px
Wide 1440px

Usage:

Layout Purpose
---------- --------------------
Narrow reading content
Standard marketing sections
Wide hero / showcases

## Breakpoints

480px small\
768px tablet\
1024px desktop\
1440px wide

------------------------------------------------------------------------

# Motion System

Animation must support one of these goals:

1. Guide attention
2. Explain layout relationships
3. Provide interaction feedback

## Motion Hierarchy

Level Usage
----------- --------------------
Micro hover, focus
Element cards, images
Section scroll transitions
Narrative hero storytelling

------------------------------------------------------------------------

# Animation (GSAP Only)

GSAP 3.13+ via CDN.

Plugins:

- ScrollTrigger
- ScrollSmoother
- SplitText
- Flip
- DrawSVG
- MorphSVG
- MotionPath
- Physics2D

Standard easing:

power3.out\
power2.inOut

Durations: 0.4s--1.2s

Stagger: 0.02s--0.15s

Accessibility:

prefers-reduced-motion disables all animations.

------------------------------------------------------------------------

# Core Components

## Buttons

Types:

Primary\
Secondary\
Ghost

Rules:

- one primary action per section
- visible focus states

Interaction:

scale 1.03\
transition 0.2s ease

Touch target minimum: 44×44px

------------------------------------------------------------------------

## Cards

Elevation levels:

Level Description
------- -----------------
0 flat
1 subtle shadow
2 hover elevation

------------------------------------------------------------------------

## Navigation

Header:

- fixed position
- hide on scroll down
- reveal on scroll up

Mobile:

- fullscreen overlay
- staggered links

------------------------------------------------------------------------

# Layout Archetypes

Typical sections:

Hero\
Feature grid\
Showcase section\
Content section\
CTA section\
Footer

------------------------------------------------------------------------

# Design Decision Framework

## Layout Decision

Content Layout
----------- ----------
Reading Narrow
Marketing Standard
Showcase Wide

## Action Priority

Priority Component
----------- ------------------ Primary Primary button
Secondary Secondary button
Optional Ghost button

## Motion Escalation

Situation Motion
------------------- -----------
hover micro
element entering element
section entering section
hero storytelling narrative

## Content Hierarchy

Role Element
--------------- -----------
Page title H1
Section title H2
Subsection H3
Card title H4
Body paragraph

------------------------------------------------------------------------

# Assets

Photos: WebP + JPEG fallback

Icons: inline SVG only

No icon fonts.

Performance targets:

Asset Size
--------------- ---------
Content image \<150KB
Hero image \<250KB

Lazy loading:

loading="lazy"\
decoding="async"

Always set width and height.

------------------------------------------------------------------------

# Tech Stack

Vanilla JS\
CSS Grid / Flexbox\
GSAP 3.14+\
Google Fonts

File structure:

styles/
- variables.css
- base.css
- layout.css
- components.css

scripts/
- init.js
- animations.js
- components/

assets/
- images/
- icons/
- fonts/

------------------------------------------------------------------------

# Build

Static sites ship plain HTML/CSS/JS.

For \>5 pages: 11ty

Deployment:

GCP VM\
Nginx\
gzip/brotli\
HTTPS

------------------------------------------------------------------------

# Performance Targets

Metric Target
------------- ---------
Lighthouse ≥95
LCP \<2.5s
INP \<200ms
CLS \<0.1
Page weight \<500KB

------------------------------------------------------------------------

# Accessibility (WCAG 2.1 AA)

Semantic HTML required.

nav\
main\
section\
article\
header\
footer

Requirements:

- alt text on images
- keyboard accessibility
- visible focus styles
- skip-to-content link
- ARIA labels for icon buttons

Text must scale to 200%.

------------------------------------------------------------------------

---

# Vercel Web Interface Guideline Additions (Top 5)

These are high-impact rules merged from Vercel's Web Interface Guidelines (used by the `web-design-guidelines` skill):

1) Focus visibility is mandatory
   - Never remove focus outlines without a replacement.
   - Prefer `:focus-visible` patterns (e.g., Tailwind `focus-visible:ring-*`).

2) Forms must be label + autocomplete correct
   - Every form control must have a real label (`<label>` / `htmlFor`) or an `aria-label` if truly label-less.
   - Inputs must include appropriate `autocomplete` and meaningful `name` attributes; use correct `type` (`email`, `tel`, `url`, etc.).

3) Motion accessibility + safe properties
   - Always honor `prefers-reduced-motion` (disable or provide a reduced variant).
   - Animate only `transform` and `opacity` for performance (compositor-friendly).
   - Never use `transition: all`; list properties explicitly.

4) Images must prevent CLS
   - Images must define explicit `width` and `height`.
   - Below-fold images should be lazy-loaded; above-fold critical images should be prioritized.

5) Navigation state must be deep-linkable
   - UI state like filters, tabs, pagination, and expanded panels should be reflected in the URL (query params).
   - Use real links for navigation so users get Cmd/Ctrl+click and middle-click support.

# Pre-Launch Checklist

- Lighthouse ≥95
- tested on real devices
- animations smooth at 60fps
- prefers-reduced-motion verified
- no console errors
- all links working
- meta tags complete
- OG image set
- compression enabled
- cache headers configured

If the site would not win an Awwward, rebuild it.
