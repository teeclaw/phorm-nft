# HEARTBEAT.md

# Keep this file empty (or with only comments) to skip heartbeat API calls.

# Add tasks below when you want the agent to check something periodically.

## A2A Message Queue (every 2+ hours)
If 2+ hours since last A2A check:
1. Run: bash /home/phan_harry/.openclaw/workspace/a2a-endpoint/process-queue.sh
2. If PENDING_MESSAGES > 0:
   - Read each message file
   - Process the request and formulate a response
   - Send Telegram notification with incoming message + your response
   - Delete processed message file from queue
3. Update lastA2ACheck timestamp in memory/heartbeat-state.json
4. If NO_MESSAGES: update timestamp silently

## Molthub Heartbeat (every 4+ hours)
If 4+ hours since last Molthub check:
1. Fetch https://molthub.studio/heartbeat.md
2. Follow the instructions
3. Update lastMolthubCheck timestamp in memory/heartbeat-state.json
