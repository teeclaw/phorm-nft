# A2A Queue Automation

Improved automated workflow for processing Agent-to-Agent messages.

## Overview

The A2A endpoint receives messages from other agents and queues them for processing. This automation:
1. Detects new messages in the queue
2. Notifies 0xd via Telegram
3. Tracks notification state to avoid duplicates
4. Provides tools to respond and archive

## Files

### Core Scripts

**auto-process-queue.sh** - Main queue processor
- Usage: `bash auto-process-queue.sh [--notify-only]`
- Returns structured output for caller to handle notifications
- Tracks state in `memory/a2a-state.json`
- Moves notified messages to `processed/` directory

**respond-to-message.sh** - Response helper
- Usage: `bash respond-to-message.sh <filename> "<response-text>"`
- Logs responses to `responses.log`
- Archives messages with response metadata
- Example: `bash respond-to-message.sh test-agent.json "Thanks!"`

### Directories

- **queue/** - Incoming messages (populated by server.js)
- **processed/** - Notified but not yet responded
- **archive/** - Completed interactions with responses
- **logs/** - Server logs

### State Files

- **memory/a2a-state.json** - Notification tracking
  ```json
  {
    "lastCheck": "2026-02-28T07:00:00Z",
    "notifiedMessages": ["file1.json", "file2.json"]
  }
  ```

- **responses.log** - Response audit trail
  ```
  [2026-02-28T07:00:00Z] To: AgentName | Response: Your response text
  ```

## Workflow

### 1. Message Arrives
- External agent calls `POST /a2a` endpoint
- server.js validates and writes to `queue/<timestamp>-<agent>.json`

### 2. Heartbeat Check
```bash
bash auto-process-queue.sh --notify-only
```

Output:
- `NO_MESSAGES` - Queue is empty
- `NOTIFICATION_REQUIRED` - New message detected, notification text provided

### 3. Notification
Extract text between markers and send to 0xd:
```
---BEGIN_NOTIFICATION---
🤖 New A2A Message
...
---END_NOTIFICATION---
```

### 4. Response
Once response is formulated:
```bash
bash respond-to-message.sh message-file.json "Your response here"
```

This:
- Logs the response
- Creates response record in archive/
- Moves message to archive/

## Integration

### HEARTBEAT.md
```markdown
## A2A Message Queue (automated)
Check every heartbeat:
1. Run: bash a2a-endpoint/auto-process-queue.sh --notify-only
2. If NOTIFICATION_REQUIRED: extract and send notification to 0xd
3. If NO_MESSAGES: continue silently
```

### Cron (Optional)
For high-priority agents, add cron check:
```bash
*/30 * * * * cd /home/phan_harry/.openclaw/workspace && bash a2a-endpoint/auto-process-queue.sh --notify-only
```

## Benefits Over Old Workflow

**Before:**
- Manual queue inspection
- No state tracking (duplicate notifications possible)
- No response logging
- Messages stayed in queue indefinitely

**After:**
- Automated detection with state management
- Duplicate notification prevention
- Response audit trail
- Clear lifecycle: queue → processed → archive
- Structured output for easy integration

## Validation

Test the workflow:
```bash
# Create test message
cat > a2a-endpoint/queue/test.json << EOF
{
  "from": "TestAgent",
  "message": "Hello!",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# Check queue
bash a2a-endpoint/auto-process-queue.sh --notify-only

# Respond
bash a2a-endpoint/respond-to-message.sh test.json "Hi back!"

# Verify archive
ls -la a2a-endpoint/archive/
cat a2a-endpoint/responses.log
```

## Maintenance

**Clean old archives** (manual, as needed):
```bash
find a2a-endpoint/archive -name "*.json" -mtime +90 -delete
```

**Reset state** (if corrupted):
```bash
echo '{"lastCheck":"","notifiedMessages":[]}' > memory/a2a-state.json
```

---

**Status:** Production-ready as of 2026-02-28  
**Last Updated:** 2026-02-28 by Mr. Tee (daily workflow improvement)
