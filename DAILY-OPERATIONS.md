# DAILY-OPERATIONS.md

## Daily Autonomous Operations System

**Purpose:** Run assisted-autonomous operations with CEO coordination and owner strategic oversight.

**Timing:** Single daily report at 7:00 AM UTC+7 (00:00 UTC)

---

## Daily Comprehensive Report (07:00 UTC+7 / 00:00 UTC)

**Owner:** TeeClaw (CEO)
**Frequency:** Daily
**Session:** Isolated
**Duration:** ~15-20 minutes
**Delivery:** Telegram Topic 341 (automatic)
**Format:** High-level bullet points (concise)

### Execution Steps

1. **Read All Department Logs from Yesterday**
   ```
   memory/YYYY-MM-DD-teecode.md
   memory/YYYY-MM-DD-teesocial.md
   memory/YYYY-MM-DD-teemarketing.md
   memory/YYYY-MM-DD-teedesign.md
   memory/YYYY-MM-DD-teeresearcher.md
   memory/YYYY-MM-DD-teewriter.md
   memory/YYYY-MM-DD-teesecure.md
   memory/YYYY-MM-DD-teeclaw.md
   ```

2. **Read Current Work Queue**
   - Read WORK-QUEUE.md
   - Check pending tasks by tier and priority

3. **Consolidate to MEMORY.md**
   - Extract key insights from all logs
   - Strategic decisions made
   - Architecture changes
   - Major milestones
   - Lessons learned
   - Cross-department patterns

4. **Update Work Queue**
   - Mark completed items as done
   - Move incomplete tasks to today
   - Adjust priorities based on yesterday's learnings
   - Add new work from department recommendations

5. **Identify Issues**
   - Blockers (tasks waiting on dependencies)
   - Stuck work (no progress for 24h+)
   - Failures (cron jobs, tools, services)
   - Capacity constraints (agents maxed out)
   - Escalations needed (owner decisions required)

6. **Generate Comprehensive Report (High-Level Bullet Points)**

   **Format for Owner (Topic 341):**
   ```markdown
   ## 📋 PENDING TASKS (Priority-Sorted)
   **High Priority:**
   - [ ] Task (owner, blocker if any)
   
   **Medium Priority:**
   - [ ] Task
   
   **Low Priority:**
   - [ ] Task
   
   ## ✅ COMPLETED YESTERDAY
   - Task (agent, outcome)
   
   ## 🚀 PROACTIVE WORK DONE
   - Action taken by agents (not assigned)
   
   ## 🚧 BLOCKERS
   - Issue → Action taken / Needs escalation
   
   ## ⚠️ ESCALATIONS TO OWNER
   - (None / Issue requiring decision)
   
   ## 📅 TODAY'S PRIORITIES
   1. Priority 1
   2. Priority 2
   3. Priority 3
   ```

7. **Write Detailed Log**
   - Full context to memory/YYYY-MM-DD-teeclaw.md
   - Include all department activities
   - Document reasoning for priorities
   - Note any coordination actions taken

8. **Send Report**
   - High-level bullet points sent to Topic 341 (automatic)
   - Owner receives concise daily snapshot
   - Full details available in memory files

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

If the daily report fails:

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
- Failures flagged in daily report

### Memory System
- Daily ops reads from memory/YYYY-MM-DD-*.md (all departments)
- Daily ops writes to memory/YYYY-MM-DD-teeclaw.md (detailed log)
- Daily ops consolidates to MEMORY.md (key insights only)

---

## Owner Interaction Points

**Daily Report (07:00 UTC+7):**
- Receive comprehensive summary in Topic 341
- High-level bullet points (concise)
- Pending tasks sorted by priority
- Completed work and proactive actions
- Blockers flagged
- Escalations (if any)
- Today's priorities

**Ad-hoc:**
- Emergency escalations (immediate, any time)
- Tier 3 approval requests (as needed)

---

## Success Metrics

**Daily ops working well when:**
- No silent failures (all caught within 24h)
- Blockers identified and escalated promptly
- Work queue stays current (completed items marked, priorities adjusted)
- Memory consolidation captures key insights (not verbose logs)
- Owner receives concise, actionable reports (high-level bullet points)
- Report arrives reliably at 7am daily

**Red flags:**
- Same blocker appears 3+ days
- Tasks stuck > 48h without escalation
- Memory consolidation skipped
- Reports contain no actionable items
- Reports too verbose (owner wants bullet points, not essays)
