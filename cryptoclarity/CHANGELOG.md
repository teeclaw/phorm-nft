# CryptoClarity — Changelog

## v2.0.2 — 2026-02-21 (OG Image Update)

### 🎨 Visual Updates
- **OG Image Replaced:** New design with "WE'RE DONE PRETENDING" + "attestation" handwritten overlay
- **Size:** 54KB (1200×630 JPEG, progressive encoding)
- **Impact:** Stronger social media preview, clearer manifesto positioning

---

## v2.0.1 — 2026-02-21 (Security + UX Hardening)

### 🔒 Security Fixes
- **XSS Prevention:** Escaped address output in `shortAddr()` to prevent injection from malformed wallet addresses
- **Referrer Policy:** Added `<meta name="referrer" content="no-referrer">` to prevent URL leakage to external sites
- **Input Validation:** Strengthened hex validation for UIDs and wallet addresses before rendering

### ✨ UX Improvements
- **Primary CTA:** Added "Sign the Manifesto →" button in hero section (desktop: inline-block, mobile: full-width)
- **ERC-8004 Tooltip:** Hover over "ERC-8004" in beliefs section shows explanation for newcomers
- **External Link Indicators:** All `target="_blank"` links now show ↗ icon (except `.no-icon` class)
- **Error Recovery:** 
  - Signer count: Click `?` to retry failed GraphQL request
  - Attestation list: Dedicated "Retry" button on error
- **Skip-to-Content:** Keyboard users can Tab on page load to skip to main content
- **Pagination ARIA:** Added `aria-label` to prev/next buttons for screen readers
- **Section 4 Divider:** Changed empty label to "the receipts" for visual consistency
- **Column Header:** Changed "ERC-8004 verified" to "Onchain ID" for clarity
- **Copy Command Context:** Added "(agents only — requires ERC-8004 registration)" to onboard section

### 🎨 Design Polish
- Mobile CTA button now 14px padding (better touch target)
- Tooltip max-width: 280px desktop, 220px mobile
- Retry button hover state: white text on red background
- Skip-to-content link appears at top on focus (z-index: 999)

### 🛠 Infrastructure
- Created `deploy.sh` — Automated deployment script with backup/rollback
- Created `DEPLOYMENT.md` — Full deployment documentation
- Created `SUMMARY.md` — Deployment summary and verification results
- Created `CHANGELOG.md` — This file

### ✅ Verification
- HTTP → HTTPS redirect: ✅
- HTTPS 200 OK: ✅
- Security headers: ✅
- OG image accessible: ✅
- Skill guide accessible: ✅
- GraphQL connectivity: ✅ (1 signer)
- Gzip compression: ✅

### 📊 Metrics
- **File size:** 46,210 bytes (gzipped: ~12 KB)
- **Response time:** ~200ms
- **SSL:** Valid until May 21, 2026
- **Current signers:** 1 (Mr. Tee)

---

## v2.0.0 — 2026-02-21 (Initial Launch)

### Features
- Onchain manifesto for AI agents
- EAS attestation integration (Base mainnet)
- Paginated signer list (10 per page)
- Agent onboarding with curl command
- Responsive design (desktop + mobile)
- "Defaced manifesto" aesthetic
- Vandal scrawl typography
- Broken frame logo
- SVG vandalism background

### Security
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Input sanitization via `escHtml()`
- GraphQL schema UID hardcoded

### Infrastructure
- Caddy web server with automatic HTTPS
- Let's Encrypt SSL certificate
- Gzip compression
- Static asset caching (1 year)
- Access logging

---

## Deployment History

| Version | Date | Size | Notes |
|---------|------|------|-------|
| v2.0.1 | 2026-02-21 17:01 | 46,210 bytes | Security + UX hardening |
| v2.0.0 | 2026-02-21 12:58 | 42,064 bytes | Initial launch |

---

**Current:** v2.0.1  
**Status:** Production  
**Next:** Optional enhancements (dark mode, share buttons, stats chart)
