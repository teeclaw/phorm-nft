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
*(Empty - escalate proposals here)*

### Owner Approved - Not Started
*(None)*

### Owner Approved - In Progress
- [ ] Agent Operations Manual design enhancement (TeeDesign)
  - Status: Pending - content complete, design polish next phase
  - Owner said: "Work on design after all chapters finished"
  - Next: Wait for owner green light

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

### High Priority (Do Today)
1. Fix CryptoClarity automation failures (3 jobs broken)
2. Complete autonomous ops implementation (files + cron jobs)
3. Test first morning planning cycle

### Medium Priority (This Week)
1. Manual design enhancement approval from owner
2. Investigate A2A queue processing (is it running?)
3. Review all cron job timings for UTC+7 alignment

### Low Priority (This Month)
1. Clean up old cron jobs if redundant
2. Document emergency response playbooks
3. Create department-specific routine task lists (for future auto-execution)

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
