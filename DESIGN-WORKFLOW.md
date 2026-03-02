# DESIGN-WORKFLOW.md

## The 3-Layer Design System

This is how TeeDesign creates production-grade UI. All three layers are mandatory.

---

## Layer 1: Creative Layout (`frontend-design` skill)

**Role:** Creative Director

**What it does:**
- Generates distinctive, non-generic layouts
- Suggests visual rhythm and composition
- Proposes typography hierarchy
- Recommends color usage strategies
- Creates interesting section structures

**Goal:** Avoid "AI template" look

**When to use:** Start of every design project

**Output:** Initial layout concepts with creative direction

---

## Layer 2: System Rules (`DESIGN-SYSTEM.md`)

**Role:** Constitution

**What it enforces:**
- Design principles (clarity, motion, performance, depth, white space)
- Color tokens (never hardcode hex values)
- Typography system (Google Fonts, modular scale, clamp())
- 8px spacing grid
- Layout containers (720px narrow, 1200px standard, 1440px wide)
- Motion system (GSAP only, power3.out easing, 0.4-1.2s duration)
- Component rules (buttons, cards, navigation)
- Performance targets (Lighthouse ≥95, LCP <2.5s)
- Accessibility (WCAG 2.1 AA)
- Tech stack (Vanilla JS, CSS Grid/Flexbox, no frameworks)

**Goal:** Consistency and scalability

**When to use:** Apply to every creative layout from Layer 1

**Output:** System-compliant design that matches our architecture

---

## Layer 3: UX Quality Audit (`web-design-guidelines` skill)

**Role:** QA / Accessibility Reviewer

**What it checks:**
- Focus visibility (`:focus-visible` patterns, never remove outlines)
- Form accessibility (labels, autocomplete, semantic types)
- Motion safety (`prefers-reduced-motion`, transform/opacity only, no `transition: all`)
- CLS prevention (explicit width/height on images, lazy loading)
- Deep-linkable navigation (URL query params for state, real links for nav)
- Semantic HTML (nav, main, section, article, header, footer)
- ARIA labels for icon buttons
- Keyboard accessibility
- Touch target sizes (44×44px minimum)

**Goal:** Production-ready UX

**When to use:** Final pass before shipping

**Output:** Accessibility report + fixes needed

---

## The Workflow (Mandatory Order)

```
Step 1: Creative Generation
↓
frontend-design skill
↓
Output: Distinctive layout concepts

Step 2: System Application
↓
DESIGN-SYSTEM.md rules
↓
Output: Consistent, architecture-compliant design

Step 3: Quality Audit
↓
web-design-guidelines skill
↓
Output: Accessible, production-ready UI
```

**Result:**
```
Creative design
+ Consistent system
+ Production-grade quality
```

---

## Responsibility Split

| Layer | Responsibility | Enforces |
|-----------------------|--------------------------|----------|
| `frontend-design` | Creative layout generation | Distinctiveness |
| `DESIGN-SYSTEM.md` | Architecture & rules | Consistency |
| `web-design-guidelines` | UX + accessibility audit | Quality |

---

## TeeDesign Execution Pattern

When assigned a frontend task:

### Phase 1: Creative (frontend-design)
```
1. Read task requirements
2. Run frontend-design skill
3. Generate 2-3 layout concepts
4. Choose strongest concept
```

### Phase 2: System (DESIGN-SYSTEM.md)
```
1. Read DESIGN-SYSTEM.md
2. Apply all rules to chosen concept:
   - Color tokens
   - Typography system
   - 8px spacing grid
   - Layout containers
   - Motion patterns
   - Component specs
3. Ensure full compliance
```

### Phase 3: Audit (web-design-guidelines)
```
1. Run web-design-guidelines skill
2. Review accessibility report
3. Fix all flagged issues:
   - Focus states
   - Form labels
   - Motion safety
   - CLS prevention
   - Navigation links
4. Verify all checks pass
```

### Phase 4: Validation
```
1. Run Lighthouse audit
2. Verify ≥95 all categories
3. Test on real devices (if possible)
4. Check prefers-reduced-motion
5. Confirm no console errors
```

**Only ship when all 4 phases complete.**

---

## Example: Landing Page for Agent Operations Manual

**Task:** Create landing page for manual sales

**Phase 1: Creative**
```
frontend-design skill suggests:
- Hero: Split layout (headline left, visual right)
- Social proof: Centered testimonial cards
- CTA: Sticky footer with gradient button
- Typography: Syne display + Inter body
```

**Phase 2: System**
```
DESIGN-SYSTEM.md rules applied:
- Color tokens: --color-accent-primary for CTA
- Typography: clamp(2rem, 5vw, 4rem) for hero
- Spacing: 8px grid (padding: 64px, gap: 24px)
- Layout: 1200px container, mobile-first breakpoints
- Motion: GSAP ScrollTrigger for hero reveal (power3.out, 0.8s)
- Buttons: Primary button with scale(1.03) hover
```

**Phase 3: Audit**
```
web-design-guidelines checks:
✓ Focus visible on CTA button
✓ Form has proper labels + autocomplete
✓ prefers-reduced-motion disables animations
✓ Images have width/height set
✓ Navigation uses real <a> tags
```

**Phase 4: Validation**
```
Lighthouse: 98 Performance, 100 Accessibility, 100 Best Practices, 100 SEO
Device tested: iPhone Safari, Chrome Desktop
Motion: Confirmed reduced variant works
Errors: None
```

**Ship.**

---

## Quick Reference

**Before starting any frontend work:**
1. Read this file (DESIGN-WORKFLOW.md)
2. Read DESIGN-SYSTEM.md
3. Have frontend-design skill ready
4. Have web-design-guidelines skill ready

**During work:**
1. Generate creative concept (frontend-design)
2. Apply system rules (DESIGN-SYSTEM.md)
3. Audit quality (web-design-guidelines)
4. Validate performance (Lighthouse)

**Before shipping:**
- All 4 phases complete? ✓
- Lighthouse ≥95? ✓
- Accessibility verified? ✓
- Would it win an Awwward? ✓

**If any answer is no:** Don't ship. Fix it.

---

## Skills Location

- `frontend-design`: `~/.openclaw/workspace/.agents/skills/frontend-design/`
- `web-design-guidelines`: `~/.openclaw/workspace/.agents/skills/web-design-guidelines/`

**Both are now available to TeeDesign.**

---

**This is production design operations. Follow it every time.**
