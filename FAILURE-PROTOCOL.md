# FAILURE-PROTOCOL.md

## Automated Failure Handling & Escalation

**Purpose:** Define how the company handles failures without manual intervention
**Owner:** All agents follow this protocol
**Updates:** CEO maintains this file

---

## Standard Failure Pattern

### Step 1: First Attempt
- Execute task normally
- Log execution attempt with timestamp
- Capture any error messages

### Step 2: Auto-Retry (If Failed)
- **Wait:** 5 minutes
- **Retry with:** Verbose logging enabled
- **Capture:** Full error stack, environment state
- **Log:** Second attempt timestamp + outcome

### Step 3: Escalation to CEO (If Still Failed)
- **Write to:** memory/YYYY-MM-DD-{agent-id}.md
  ```markdown
  ## HH:MM - FAILURE: Task Name
  - Task: What was being executed
  - Attempts: 2 (both failed)
  - Error: Full error message
  - Context: What was happening when it failed
  - Impact: What's broken now
  - Recommendation: Suggested fix (if known)
  ```
- **Flag:** High priority for next morning planning cycle
- **Alert:** If critical (security, revenue, data loss)

### Step 4: CEO Investigation (Next Morning Planning)
- **Read:** Failure report from department log
- **Classify:** Operational fix (CEO handles) vs Strategic issue (escalate to owner)
- **Attempt Fix:** If operational (permissions, config, resource)
- **Document:** Fix attempt + outcome in memory/YYYY-MM-DD-teeclaw.md

### Step 5: Owner Escalation (If CEO Can't Fix)
- **Report Format:**
  ```markdown
  # Failure Report: [Task Name]
  
  ## What Failed
  - Task: Clear description
  - Owner: Which agent/system
  - Frequency: How often does this run
  
  ## Timeline
  - First failure: YYYY-MM-DD HH:MM UTC
  - Retry failed: YYYY-MM-DD HH:MM UTC
  - CEO investigation: YYYY-MM-DD HH:MM UTC
  
  ## Error Details
  - Error message: [exact error]
  - Logs: [relevant excerpts]
  - Environment: [system state]
  
  ## Impact
  - What's broken: [specific functionality]
  - Revenue impact: [if any]
  - User impact: [if any]
  - Workaround: [if available]
  
  ## What We Tried
  1. Attempt 1: [action] → [result]
  2. Attempt 2: [action] → [result]
  3. CEO fix: [action] → [result]
  
  ## Recommended Solution
  - Fix: [proposed solution]
  - Why: [reasoning]
  - Risk: [potential issues]
  - Alternative: [backup plan]
  
  ## Owner Decision Needed
  - [ ] Approve recommended fix
  - [ ] Suggest alternative approach
  - [ ] Disable/pause this task
  - [ ] Escalate to external support
  ```
- **Send:** Telegram message to owner
- **Wait:** For owner decision

---

## Failure Categories

### Category A: Auto-Recoverable
**Examples:** Network timeout, temporary API outage, rate limit hit
**Pattern:** Retry after delay usually succeeds
**Escalation:** Only if 2 retries fail

### Category B: Configuration Issues
**Examples:** Missing env var, wrong path, permission denied
**Pattern:** Needs config fix, not code change
**Escalation:** CEO can usually fix

### Category C: Code Bugs
**Examples:** Syntax error, logic bug, uncaught exception
**Pattern:** Needs code change
**Escalation:** CEO assigns to TeeCode for fix

### Category D: External Dependencies
**Examples:** Third-party API down, service deprecated, breaking change
**Pattern:** Outside our control
**Escalation:** CEO finds workaround or escalates to owner

### Category E: Security Incidents
**Examples:** Credential compromise, attack detected, unauthorized access
**Pattern:** Immediate response required
**Escalation:** Auto-execute emergency protocol + notify owner immediately

---

## Cron Job Failures

### Special Handling for Scheduled Tasks

**Detection:**
- Cron system reports failure status
- Daily planning cycle checks all cron job statuses

**Auto-Retry:**
- Cron jobs do NOT auto-retry on failure (to avoid duplicate work)
- Instead: Manual retry triggered by CEO if safe

**Escalation:**
- Failed cron appears in morning planning report
- CEO decides: Retry now, Fix config, or Disable

**Example:**
```markdown
## Failed Cron Jobs (from openclaw cron list)
- Job: CryptoClarity Morning Drafts (c070498c...)
- Status: ERROR (ran 13h ago)
- Last success: 2026-03-01 01:30 UTC
- Impact: Marketing workflow broken
- Action: Assigned to TeeSocial for investigation
```

---

## Emergency Failures (Tier 4)

### Immediate Auto-Response (No Retry Delay)

**Security Incident:**
1. **Detect:** Credential compromise, suspicious activity
2. **Execute:** Rotate affected credentials immediately
3. **Notify:** Owner + CEO (Telegram alert)
4. **Log:** Full incident details to memory/incidents/YYYY-MM-DD-{type}.md
5. **Follow-up:** CEO assigns TeeSecure for root cause analysis

**Service Outage:**
1. **Detect:** A2A endpoint down, critical service unavailable
2. **Execute:** Enable fallback if available
3. **Notify:** Owner + CEO
4. **Log:** Outage details + impact
5. **Follow-up:** CEO assigns appropriate department for fix

**Data Loss Risk:**
1. **Detect:** Backup failure, corruption detected
2. **Execute:** Halt writes if possible
3. **Notify:** Owner immediately
4. **Log:** Full state snapshot
5. **Wait:** For owner decision before proceeding

---

## Failure Prevention

### Proactive Monitoring (Daily Planning Checks)

**Cron Job Health:**
- All jobs green (last run successful)?
- Any jobs overdue (should have run but didn't)?
- Any jobs disabled (why + is it still needed)?

**Service Health:**
- A2A endpoint responding?
- Social posting working?
- Memory search functional?

**Resource Health:**
- Disk space OK?
- API rate limits healthy?
- Credentials valid (not expired)?

**If any check fails:**
- Log to morning planning report
- Assign to appropriate department
- Track until resolved

---

## Success Criteria

**Failure handling working well when:**
- ✅ No silent failures (all caught within 24h)
- ✅ Auto-retry resolves 60%+ of transient issues
- ✅ CEO can fix 80%+ of operational issues without escalation
- ✅ Owner only sees well-documented, strategic failures
- ✅ Emergency response < 5 minutes from detection to action

**Red flags:**
- ❌ Same failure repeats 3+ days
- ❌ Failures discovered by owner (we should find first)
- ❌ Emergency protocol triggered for non-emergencies
- ❌ CEO stuck investigating same issue 2+ days
- ❌ Owner receives incomplete failure reports

---

## Templates

### Agent Failure Log Entry
```markdown
## HH:MM - FAILURE: [Task Name]
- **Task:** What was being executed
- **Attempts:** 2 (timestamps)
- **Error:** `full error message`
- **Context:** What was happening
- **Impact:** What's broken
- **Category:** A/B/C/D/E (see above)
- **Recommendation:** Suggested fix or "Needs CEO investigation"
```

### CEO Investigation Entry
```markdown
## HH:MM - INVESTIGATING: [Task Name] Failure
- **Read:** Agent's failure report
- **Classification:** Category B (Config issue)
- **Fix Attempted:** Updated .env variable X
- **Result:** ✅ Resolved / ❌ Still failing
- **Next:** (if still failing) Escalating to owner / Assigning to TeeCode
```

### Owner Escalation Entry
```markdown
## HH:MM - ESCALATION TO OWNER: [Task Name]
- **Failure:** [summary]
- **Tried:** [CEO attempts]
- **Impact:** [business impact]
- **Recommendation:** [proposed fix]
- **Owner Decision:** [awaiting / approved: X / alternative: Y]
```

---

## Appendix: Common Failures & Fixes

### "Permission Denied"
- **Category:** B (Config)
- **Fix:** Check file permissions, env vars, API keys
- **Owner:** Usually TeeCode or TeeSecure

### "Module Not Found"
- **Category:** B (Config)
- **Fix:** npm install or path correction
- **Owner:** TeeCode

### "API Rate Limit"
- **Category:** A (Auto-recoverable)
- **Fix:** Wait + retry, or reduce request frequency
- **Owner:** Department using the API

### "Timeout"
- **Category:** A (Auto-recoverable) or D (External dependency)
- **Fix:** Retry, or if persistent, check service status
- **Owner:** CEO investigates

### "Unauthorized"
- **Category:** B (Config) or E (Security)
- **Fix:** Rotate credentials if compromised, or fix auth config
- **Owner:** TeeSecure (if security), otherwise CEO

---

## Maintenance

**CEO reviews this file:**
- Monthly: Update common failures list
- When pattern emerges: Add new category or fix template
- After major incident: Document lessons learned

**Agents reference this file:**
- When failure occurs: Follow standard pattern
- When logging: Use templates
- When escalating: Include required information
