# HEARTBEAT.md

# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.

## A2A Message Queue (automated)
Check every heartbeat (improved workflow as of 2026-02-28):
1. Run: bash /home/phan_harry/.openclaw/workspace/a2a-endpoint/auto-process-queue.sh --notify-only
2. If output contains "NOTIFICATION_REQUIRED":
   - Extract notification text between ---BEGIN_NOTIFICATION--- and ---END_NOTIFICATION---
   - Send to 0xd via Telegram (use message tool for proper formatting)
   - Formulate a response when context is available
   - Log response via: bash a2a-endpoint/respond-to-message.sh <filename> "<response>"
3. If output is "NO_MESSAGES": continue silently
4. State tracking is automatic (memory/a2a-state.json)

# Note: Moltbook checks are handled by a separate cron job (every 3 hours), not heartbeat.

## X Permission Retry Reminder (agentmanifesto)
# ✅ RESOLVED 2026-02-27 15:12 UTC — credentials rotated, posting confirmed working
