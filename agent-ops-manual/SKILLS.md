# OpenClaw Skill Pack: Studio‑Grade PDF (Node + Tailwind + Playwright)

This pack gives you a **repeatable pipeline** to generate **studio-grade PDFs** (Stripe/Linear memo style) using:

- **Structured doc JSON**
- **Deterministic HTML + Tailwind**
- **Playwright (recommended) or Puppeteer**
- **Automated layout QA guardrails**

---

## Folder Structure

```
openclaw-studio-pdf-skillpack/
  SKILLS.md
  package.json
  README.md
  templates/
    report.html
  tokens/
    design-tokens.json
  examples/
    docplan.example.json
    doccopy.example.json
    layoutplan.example.json
  renderer/
    render-pdf.mjs
  qa/
    qa-rules.md
```

---

## Skill Set

### 1) content-outline  → `DocPlan.json`
**Goal:** Convert user prompt/notes into a **layout-friendly blueprint**, not prose.

**Input**
- topic, audience, goal
- must-include facts
- tone (memo / report / pitch)
- constraints (page count, A4/Letter, etc.)

**Output: `DocPlan.json`**
- `meta`: `{ title, subtitle, date, author }`
- `sections[]`: `{ id, title, intent, blocks[] }`
- `blocks[]` types (keep small):
  - `lede`, `oneCol`, `twoCol`, `split`, `bullets`, `callout`, `table`, `quote`

**Hard rules**
- Every section starts with a **full-width header** (never inside 2-col).
- Prefer **short blocks** over long paragraphs.

Acceptance test
- No block exceeds ~140–180 words unless it’s a table.

---

### 2) copy-tighten → `DocCopy.json`
**Goal:** Tighten copy for density, scannability, and rhythm.

Rules
- 1 idea per paragraph, ≤ 3–4 lines at 15–16px body.
- Convert long paragraphs → bullets/callout.
- Avoid filler intros (“In this section…”).

Acceptance test
- Every section has at least one scannable element (bullets/callout/table).

---

### 3) design-system-pdf → `DesignTokens.json`
**Goal:** Provide **tokens** (not vibes) that lock the look.

Includes
- `page`: size, margins
- `typography`: H1/H2/body/meta sizes
- `spacing`: 8pt scale
- `grid`: max width, col gap, left rail width
- `components`: divider, callout, table, badge styles

Acceptance test
- All spacing uses the scale in tokens (no random 37px).

---

### 4) layout-mapper → `LayoutPlan.json`
**Goal:** Map blocks to layout modes to prevent broken columns/whitespace.

Layout modes
- `twoColAtomic`: 2-column block with **avoid-break**
- `sectionBreak`: full-width reset + divider
- `splitRail`: 12-col grid (left rail + main content)
- `oneCol`: normal prose

Hard rules
- `twoColAtomic` blocks must be atomic (avoid breaking across pages).
- Section headers always `sectionBreak`.

Acceptance test
- No section header follows an incomplete 2-col grid.
- No left column empty while right continues.

---

### 5) html-composer → `report.html`
**Goal:** Generate deterministic HTML using `LayoutPlan.json + DesignTokens.json`.

Must include
- `@page` margins
- `print-color-adjust: exact`
- `.avoid-break { break-inside: avoid; }`

Acceptance test
- Rendering produces consistent output across runs.

---

### 6) pdf-renderer → `report.pdf`
**Goal:** Render HTML → PDF using Playwright (preferred) or Puppeteer.

Playwright settings
- `printBackground: true`
- `preferCSSPageSize: true`

Acceptance test
- No missing backgrounds, no clipped content.

---

### 7) pdf-qa → `QAReport.json`
**Goal:** Detect “looks broken” conditions before shipping.

Checks
- orphan headers (header at bottom with no body)
- huge whitespace bands
- column imbalance
- widows/orphans risk
- overflow/clipping indicators

Output
- severity: pass / warn / fail
- recommendations: where to reflow

Acceptance test
- Any fail triggers re-run of layout-mapper + html-composer.

---

## How to Use (Manual)

1) Edit `templates/report.html` (or generate it from your agent)
2) Run the renderer:
   - `npm i`
   - `npm run pdf`

Output: `report.pdf`

---

## Notes on “Studio Grade”

If you enforce only 4 rules, enforce these:
1. **Full-width section resets**
2. **Atomic 2-column blocks**
3. **8pt spacing scale**
4. **Max line length 60–75 chars for body**

