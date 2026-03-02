# 2026-03-02 - Autonomous Operations System Design

## Context
Owner (0xd) requested comprehensive autonomous operations system for 8-agent company.

## Requirements from Owner

### 1. Scope
- **Assisted autonomy** (not full autonomous)
- Company handles routine, owner handles strategy
- Currently minimal daily tasks

### 2. Rhythm
- Daily cycles preferred
- Subject to change based on workload

### 3. Decision Authority (Owner's Input + CEO Recommendation)
**Tier 1: Auto-execute (no approval)**
- A2A queue processing (every 2h)
- Scheduled social posts (from approved calendar)
- Daily memory consolidation
- Security monitoring (passive)
- Credential rotation checks

**Tier 2: CEO approval**
- New cron jobs
- Workflow changes
- New opportunities (partnerships)
- Resource reallocation
- New skill installations

**Tier 3: Owner approval**
- Budget allocation
- Public statements
- Product launches
- Token decisions
- Team changes (recruit/retire agents)

**Tier 4: Emergency (auto-execute + notify)**
- Security incidents (credential compromise)
- Attack detection

### 4. Failure Handling
- Auto-retry: 2 attempts
- If still fails: Escalate to CEO
- If CEO can't fix: Report to owner

### 5. Work Source
- Currently: Only from owner
- Future: Scheduled, reactive, proactive (when ready)

### 6. Cron Timing Requirement
- Between 3-6 AM UTC+7 (20:00-23:00 UTC)

### 7. Report Requirements
1. Pending tasks sorted by priority
2. What was done proactively
3. Memory preservation (don't lose context)

## System Architecture (Approved Design)

### Layer 1: Daily Operations Cycles

**Morning Planning (03:00 UTC+7 / 20:00 UTC):**
- CEO reads all department logs from yesterday
- Identifies blockers, stuck work, failures
- Checks work queue priorities
- Assigns tasks for the day
- Output: Comprehensive report

**Evening Wrap-up (05:00 UTC+7 / 22:00 UTC):**
- All agents write completion summaries
- CEO consolidates to MEMORY.md
- Updates work queue
- Prepares tomorrow's priorities

### Layer 2: Work Classification (4 Tiers)
See decision authority above.

### Layer 3: Failure Protocol
1. Attempt 1: Execute
2. If fails: Wait 5 min, retry with verbose logging
3. Attempt 2: Execute
4. If fails: Escalate to CEO
5. CEO investigates, fixes if operational
6. If can't fix: Report to owner with analysis

### Layer 4: Proactive Work (Future)
Currently dormant. Work comes only from owner.

## Files to Create

### New Files
1. **DAILY-OPERATIONS.md** - Daily cycle definitions, agent responsibilities
2. **WORK-QUEUE.md** - Priority tracking, tier classification
3. **FAILURE-PROTOCOL.md** - Auto-retry rules, escalation paths
4. **AUTONOMOUS-OPS.md** - System overview and operating manual

### Updated Files
1. **HEARTBEAT.md** - Simplified (delegate to daily ops)
2. **AGENTS.md** - Add decision authority tiers

### New Cron Jobs
1. Morning planning: 03:00 UTC+7 (20:00 UTC)
2. Evening wrap-up: 05:00 UTC+7 (22:00 UTC)

## Current Cron Job Findings (2026-03-02 14:25 UTC)

### Working Jobs (7/10)
1. ETH Daily News (every 1d) ✅
2. Decrypt News (every 2h) ✅
3. Nightly memory consolidation (20:00 UTC) ✅ - **Similar to evening wrap-up but wrong time**
4. Daily workflow upgrade (00:00 UTC) ✅
5. Memory cleanup (02:00 UTC) ✅
6. CryptoClarity Weekly (Monday 02:00 UTC) ✅
7. CryptoClarity Monthly (1st day 02:30 UTC) ✅

### Failing Jobs (3/10) - All CryptoClarity
1. Morning drafts (01:30 UTC) ❌
2. Midday engagement (05:30 UTC) ❌
3. Evening reports (12:00 UTC) ❌

### Issues Identified
1. 3 CryptoClarity jobs failing (need TeeSocial investigation)
2. CEO consolidation runs at wrong time (01:00 vs 20:00 UTC+7)
3. No morning planning cycle exists
4. A2A queue processing not in cron list (may be heartbeat-driven)

## Implementation Plan

### Phase 1: Foundation (Immediate)
1. Create 4 new operational files
2. Write to memory (this file + daily log)
3. Update AGENTS.md with decision tiers

### Phase 2: Cron Setup (Next)
1. Add morning planning job (20:00 UTC)
2. Adjust evening consolidation job (22:00 UTC)
3. Test both cycles

### Phase 3: Fix Failures (Parallel)
1. Delegate CryptoClarity investigation to TeeSocial
2. Implement failure protocol
3. Add auto-retry logic

### Phase 4: Validation (After 2-3 days)
1. Monitor daily cycles
2. Verify comprehensive reports
3. Check memory preservation
4. Adjust timing if needed

## Key Decisions Made Today

1. **8-agent C-suite structure finalized:**
   - TeeClaw (CEO) - Strategic leadership, challenges owner, removes bottlenecks
   - TeeCode (CTO) - Engineering
   - TeeSocial (CCO) - Content & social
   - TeeMarketing (CMO) - Marketing
   - TeeDesign (CDO) - Design
   - TeeResearcher (CRO) - Research
   - TeeWriter (CWO) - Writing
   - TeeSecure (CSO) - Security

2. **CEO role strengthened:**
   - Reports to owner (0xd)
   - Business strategist who challenges (not yes-man)
   - Removes bottlenecks proactively
   - 11 core CEO responsibilities documented

3. **Agent Operations Manual completed:**
   - 18 chapters written
   - PDF generated (16/18 initially, 2 regenerated)
   - ~180-220 pages estimated
   - Ready for design enhancement phase

4. **Autonomous operations system designed:**
   - Assisted autonomy model
   - 4-tier decision authority
   - Daily planning + wrap-up cycles
   - Failure auto-retry (2 attempts)
   - Memory preservation mandatory

## Critical Points for Retention

1. **Hierarchy:** Owner (0xd) → CEO (TeeClaw) → C-suite (7 dept heads)
2. **CEO must challenge owner:** Not a yes-man, provide strategic counsel
3. **CEO must remove bottlenecks:** Proactive operational optimization
4. **Assisted autonomy:** Company handles routine, owner handles strategy
5. **Cron timing:** 3-6 AM UTC+7 window for daily operations
6. **Report format:** Pending tasks (priority-sorted) + proactive work done
7. **Memory preservation:** Document everything to avoid context loss

## Next Actions (Post-Implementation)

1. Run first morning planning cycle (tomorrow 03:00 UTC+7)
2. Generate first comprehensive report
3. Fix 3 failing CryptoClarity jobs (delegate to TeeSocial)
4. Monitor for 2-3 days
5. Adjust based on owner feedback

## Owner's Instruction
"Make sure you work on the memory to memorize what you propose today, I don't want you and your agent lose the memory"

**Response:** This entire design is now documented in:
- This file (autonomous-ops-design.md)
- Today's daily log (2026-03-02.md)
- MEMORY.md (will consolidate tonight)
- New operational files (being created now)

Context will NOT be lost.
