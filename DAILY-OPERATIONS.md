# DAILY-OPERATIONS.md

## Daily Autonomous Operations System

**Purpose:** Run assisted-autonomous operations with CEO coordination and owner strategic oversight.

**Timing:** All operations occur between 3-6 AM UTC+7 (20:00-23:00 UTC)

---

## Morning Planning Cycle (03:00 UTC+7 / 20:00 UTC)

**Owner:** TeeClaw (CEO)
**Frequency:** Daily
**Session:** Isolated
**Duration:** ~10-15 minutes

### Execution Steps

1. **Read All Department Logs**
   ```
   memory/2026-03-02-teecode.md
   memory/2026-03-02-teesocial.md
   memory/2026-03-02-teemarketing.md
   memory/2026-03-02-teedesign.md
   memory/2026-03-02-teeresearcher.md
   memory/2026-03-02-teewriter.md
   memory/2026-03-02-teesecure.md
   memory/2026-03-02-teeclaw.md (yesterday)
   ```

2. **Identify Issues**
   - Blockers (tasks waiting on other departments)
   - Stuck work (no progress for 24h+)
   - Failures (cron jobs, tools, services)
   - Capacity issues (agent maxed out)
   - Resource misallocation

3. **Check Work Queue**
   - Read WORK-QUEUE.md
   - Identify priorities for today
   - Check for new owner requests

4. **Assign/Resume Work**
   - Unfinished work from yesterday → assign to continue
   - New priority items → assign to appropriate department
   - Blocked items → coordinate dependencies

5. **Generate Report**
   Format:
   ```markdown
   # Daily Planning Report - YYYY-MM-DD
   
   ## 1. Pending Tasks (Priority-Sorted)
   
   ### High Priority
   - [ ] Task description (owner: agent, blocker: reason if blocked)
   
   ### Medium Priority
   - [ ] Task description
   
   ### Low Priority
   - [ ] Task description
   
   ## 2. Blockers Identified
   - Issue description → Action taken / Escalation needed
   
   ## 3. Work Assigned Today
   - Agent → Task (expected completion)
   
   ## 4. Capacity Status
   - Agent: X/Y concurrent tasks (OK / Near capacity / At capacity)
   
   ## 5. Escalations to Owner
   - (None / Issue requiring strategic decision)
   ```

6. **Send Report**
   - Write to memory/YYYY-MM-DD-teeclaw.md
   - Announce summary to owner (Telegram)

---

## Evening Wrap-Up Cycle (05:00 UTC+7 / 22:00 UTC)

**Owner:** TeeClaw (CEO)
**Frequency:** Daily
**Session:** Isolated
**Duration:** ~10-15 minutes

### Execution Steps

1. **Read All Department Logs (Today)**
   - Same list as morning, but today's files
   - Check for completion markers, blockers flagged

2. **Consolidate to MEMORY.md**
   - Extract key insights from all logs
   - Strategic decisions made
   - Architecture changes
   - Major milestones
   - Lessons learned
   - Cross-department patterns

3. **Update Work Queue**
   - Mark completed items as done
   - Move incomplete to tomorrow
   - Adjust priorities based on today's learnings

4. **Prepare Tomorrow's Context**
   - Identify carry-over work
   - Flag dependencies for morning planning
   - Note any overnight processing (cron jobs)

5. **Generate Summary**
   Format:
   ```markdown
   # Daily Wrap-Up - YYYY-MM-DD
   
   ## Completed Today
   - [ ] Task (agent, outcome)
   
   ## Proactive Work Done
   - Action taken by agent (not assigned, identified opportunity)
   
   ## Carry-Over to Tomorrow
   - [ ] Incomplete task (reason, priority)
   
   ## Key Insights Added to MEMORY.md
   - Insight summary
   
   ## Tomorrow's Priorities
   - Priority 1: Task
   - Priority 2: Task
   ```

6. **Send Summary**
   - Write to memory/YYYY-MM-DD-teeclaw.md
   - Announce to owner (Telegram)

---

## Department-Specific Routines (Future)

**Currently:** Agents do not have automated daily routines
**Future:** Each department can have auto-execute tasks

### Example: TeeSecure Daily Security Scan
- Check for failed login attempts
- Scan credential expiry dates
- Review access logs
- Report anomalies to CEO

### Example: TeeSocial Daily Engagement Check
- Check social mentions
- Review A2A messages
- Flag urgent responses
- Report metrics to CEO

---

## Failure Handling in Daily Ops

If a daily cycle fails:

1. **Auto-retry once** (5 min delay)
2. **If still fails:** Write error to memory/YYYY-MM-DD-teeclaw.md
3. **Alert owner:** Immediate Telegram notification
4. **Fallback:** Manual execution via heartbeat

---

## Integration with Existing Systems

### Heartbeat (Every 1h)
- Simplified: Check only for emergencies
- Delegate routine work to daily ops
- Emergency escalation still immediate

### Existing Cron Jobs
- Keep running as-is
- Daily ops monitors their status
- Failures flagged in morning planning

### Memory System
- Daily ops reads from memory/YYYY-MM-DD-*.md
- Daily ops writes to memory/YYYY-MM-DD-teeclaw.md
- Evening ops consolidates to MEMORY.md

---

## Owner Interaction Points

**Morning Report (03:00-03:15 UTC+7):**
- Receive planning summary
- Pending tasks sorted by priority
- Blockers flagged
- Escalations (if any)

**Evening Summary (05:00-05:15 UTC+7):**
- Completed work
- Proactive actions taken
- Tomorrow's priorities
- Key insights

**Ad-hoc:**
- Emergency escalations (immediate)
- Tier 3 approval requests (as needed)

---

## Success Metrics

**Daily ops working well when:**
- No silent failures (all caught in planning)
- Blockers identified < 24h after occurrence
- Work queue stays current
- Memory consolidation captures key insights
- Owner receives actionable reports (not noise)

**Red flags:**
- Same blocker appears 3+ days
- Tasks stuck > 48h without escalation
- Memory consolidation skipped
- Reports contain no actionable items
