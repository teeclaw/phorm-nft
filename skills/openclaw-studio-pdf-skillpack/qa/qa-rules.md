# PDF QA Rules (Heuristics)

These are pragmatic checks that catch 90% of “looks broken” PDFs.

## Fail
- Section header appears within last ~15% of a page with no body content below (orphan header)
- Two-column block splits across pages (unless explicitly allowed)
- Large blank band > ~64px between divider and header (unintentional whitespace)
- Clipped text / overflow / missing glyphs

## Warn
- Widows: last line of paragraph alone at top of page
- Orphans: first line of paragraph alone at bottom
- Column imbalance: left column ends > ~8 lines before right (visually empty)

## Pass
- Consistent 8pt spacing rhythm
- Titles are full-width resets
- Atomic blocks stay intact

