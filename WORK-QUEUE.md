# WORK-QUEUE.md - Company Priority Tracking

**Last Updated:** 2026-03-02 14:32 UTC
**Updated By:** TeeClaw (CEO)

---

## How This Works

**Purpose:** Central priority tracking for all company work
**Owner:** TeeClaw (CEO) maintains this file
**Usage:**
- Morning planning: Read priorities, assign work
- Evening wrap-up: Mark completions, update priorities
- Owner input: Add new work anytime (CEO will see in next planning cycle)

**Format:** Tasks classified by decision tier + priority level

---

## Tier 1: Auto-Execute (No Approval Needed)

### Active/Scheduled
- [x] A2A queue processing (every 2h) - **AUTO**
- [x] Daily memory consolidation - **AUTO** (evening wrap-up)
- [x] Security monitoring (passive scans) - **AUTO**
- [ ] Credential rotation check (weekly) - **SCHEDULED** (every Monday)

### Manual Trigger Available
- [ ] Emergency credential rotation (on-demand)

---

## Tier 2: CEO Approval Needed

### Pending CEO Decision
*(Empty - add proposals here)*

### Approved - In Progress
- [x] Autonomous operations system implementation (TeeClaw, ETA: 2026-03-02 EOD)
  - Status: Creating operational files, setting up cron jobs
  - Blocker: None
  - Next: Test morning planning cycle

### Approved - Blocked
*(None)*

### Approved - Completed Today
- [x] Agent Operations Manual - All 18 chapters (TeeWriter, completed 2026-03-02)
- [x] PDF generation pipeline (TeeClaw, completed 2026-03-02)
- [x] TeeSecure recruitment (TeeClaw, completed 2026-03-02)
- [x] CEO role strengthening (TeeClaw, completed 2026-03-02)

---

## Tier 3: Owner Approval Needed

### Pending Owner Decision
*(None)*

### Owner Approved - Not Started
*(None)*

### Owner Approved - In Progress
- [ ] **Agent Operations Manual - Launch Execution** (TeeClaw coordinating)
  - **Strategy:** Phased launch - PDF first (magazine layout), HTML platform (Week 3-4)
  - **Pricing:** PDF $39, HTML Lifetime $199 (no tier 3, no community)
  - **Payment:** Hybrid (Gumroad for fiat + x402 for USDC)
  - **Guarantee:** None
  - **Launch timing:** TBA (when magazine layout PDF ready, ~7 days)
  - **Plan location:** `agent-ops-manual/LAUNCH-PLAN.md`
  
  **PARALLEL TRACKS (All in progress):**
  
  **Track 1: PDF Magazine Layout** (CRITICAL PATH)
  - Owner: TeeDesign
  - Status: REVISION IN PROGRESS (2026-03-02 16:38 UTC)
  - Progress:
    - ✅ Initial test PDF delivered (16:00 UTC)
    - ✅ Owner reviewed (layout approved, needs refinement)
    - 🔄 Revising based on feedback (assigned 16:38 UTC)
  - Owner Feedback:
    1. Better pagination (no subtitles near bottom)
    2. More modern minimalist design (less heavy)
    3. Keep 2-column layout ✅
  - Next: Revised test PDF (1-2 hours) → approval → full 18-chapter PDF
  - Timeline: Was 2-3 days, now accelerated (owner waiting)
  
  **Track 2: Landing Page** (Next.js)
  - Owner: TeeCode
  - Status: ✅ COMPLETE (2026-03-02 15:40 UTC - delivered in 11 minutes!)
  - Tech: Next.js, TypeScript, Tailwind, shadcn/ui, GSAP
  - Deliverable: Full landing page built (workspace/landing-manual/)
  - Blocker: Waiting for copy from TeeWriter to integrate
  - Timeline: Was 3-5 days, delivered Day 1
  
  **Track 3: Payment Integration**
  - Owner: TeeCode
  - Status: 80% COMPLETE (2026-03-02 15:40 UTC - core infrastructure done)
  - Systems: Gumroad + x402
  - Delivered: API routes, webhooks, signed URLs, PDF delivery
  - Remaining: Email integration, purchase tracking, end-to-end testing
  - Blockers: Gumroad credentials, email service config
  - Timeline: Was 2-3 days, core done Day 1
  
  **Track 4: Landing Page Copy**
  - Owner: TeeWriter
  - Status: ✅ COMPLETE (2026-03-02 15:46 UTC - delivered in 15 minutes!)
  - Deliverable: agent-ops-manual/landing-page-copy.md
  - Quality: 79/100 CORE-EEAT score (Good)
  - Word count: 1,550 words
  - All 9 sections delivered (Hero, Problem, Solution, What's Inside, Social Proof, Comparison, Pricing, FAQ, Final CTA)
  - Timeline: Was 1-2 days, delivered Day 1
  - Next: TeeCode integrating into Next.js landing page

### Owner Approved - Blocked
- [ ] CryptoClarity marketing automation
  - Status: 3 cron jobs failing (morning/midday/evening)
  - Blocker: Unknown error (needs TeeSocial investigation)
  - Owner impact: Marketing workflow broken
  - Next: Investigate + fix or disable

---

## Tier 4: Emergency (Auto-Execute + Notify)

### Recent Emergencies
*(None in past 7 days)*

### Emergency Protocol Ready
- [x] Credential compromise detection → auto-rotate → notify owner
- [x] Attack detection → rate limit → notify CEO + owner

---

## Priority Levels (Within Each Tier)

### High Priority (Do Today - Awaiting Owner Approval)
1. **Agent Operations Manual Launch** - Pending owner approval on 5 questions
2. Fix CryptoClarity automation failures (3 jobs broken) - Assigned to TeeSocial

### High Priority (Auto-Execute When Approved)
**Phase 1 - PDF Launch (Day 1):**
1. PDF finalization (TeeDesign: cover, TOC, dividers)
2. Landing page copy (TeeWriter: sales copy + audit)
3. Landing page design (TeeDesign: Awwwards-level)
4. Payment integration (TeeCode: Stripe/Gumroad)
5. Download delivery (TeeCode: automated system)

**Phase 1 - PDF Launch (Day 2):**
6. Deploy landing page (TeeCode: teeclaw.xyz/manual)
7. Launch announcement (TeeSocial: X, Farcaster, communities)

### Medium Priority (This Week)
1. Monitor PDF sales (TeeClaw: daily reports)
2. Collect testimonials (TeeClaw: buyer feedback)
3. Investigate A2A queue processing (is it running?)

### Low Priority (Week 2-4)
1. HTML platform build (TeeCode: auth, payment, reading UI)
2. HTML launch preparation (all agents)
3. Clean up old cron jobs if redundant

---

## Blocked Items Tracker

| Task | Owner | Blocker | Duration | Action Needed |
|------|-------|---------|----------|---------------|
| CryptoClarity automation | TeeSocial | Unknown error | 13h+ | Investigate logs |
| Manual design polish | TeeDesign | Awaiting owner approval | 6h | Owner decision |

---

## Completed This Week (2026-03-02 Mon)

- [✓] Agent Operations Manual - 18 chapters (TeeWriter)
- [✓] PDF generation pipeline - HTML→PDF working (TeeClaw)
- [✓] TeeSecure (CSO) recruitment - 8th C-suite member (TeeClaw)
- [✓] CEO role definition - Strategic advisor + bottleneck remover (TeeClaw)
- [✓] C-suite titles formalized - All 8 agents (TeeClaw)
- [✓] Organizational hierarchy documented - Owner → CEO → C-suite (TeeClaw)
- [✓] Autonomous operations design - 4-tier system approved (TeeClaw)

---

## Owner Input Zone

**How to add work:**
1. Add new item under appropriate tier
2. Mark priority level
3. Add context/deadline if relevant
4. CEO will see in next morning planning cycle (03:00 UTC+7)

**Example:**
```markdown
## Tier 3: Owner Approval Needed
### Pending Owner Decision
- [ ] Launch transparency dashboard (TeeDesign + TeeCode)
  - Priority: High
  - Context: Public wallet balance + metrics page
  - Deadline: None yet
  - Owner note: "Make it Awwwards-level"
```

---

## Notes for CEO

**Daily maintenance:**
- Morning: Check for new owner inputs, update "In Progress" statuses
- Evening: Mark completions, move incomplete items, update blockers

**Weekly review:**
- Check if Medium priority items moved to High
- Archive completed items older than 7 days
- Escalate stuck items (blocked > 48h)

**Monthly review:**
- Evaluate Low priority items (still relevant?)
- Review tier classifications (still correct?)
- Update emergency protocols if needed
