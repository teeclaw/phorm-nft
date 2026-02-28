#!/bin/bash
#
# A2A Queue Processor (Improved)
# Notifies 0xd about A2A messages and manages queue lifecycle
#
# Usage: bash auto-process-queue.sh [--notify-only]
# --notify-only: Just notify, don't move to archive (for heartbeat checks)

set -euo pipefail

QUEUE_DIR="/home/phan_harry/.openclaw/workspace/a2a-endpoint/queue"
ARCHIVE_DIR="/home/phan_harry/.openclaw/workspace/a2a-endpoint/archive"
PROCESSED_DIR="/home/phan_harry/.openclaw/workspace/a2a-endpoint/processed"
STATE_FILE="/home/phan_harry/.openclaw/workspace/memory/a2a-state.json"

NOTIFY_ONLY=false
if [ "${1:-}" = "--notify-only" ]; then
  NOTIFY_ONLY=true
fi

# Ensure directories exist
mkdir -p "$QUEUE_DIR" "$ARCHIVE_DIR" "$PROCESSED_DIR"

# Initialize state file if it doesn't exist
if [ ! -f "$STATE_FILE" ]; then
  echo '{"lastCheck":"","notifiedMessages":[]}' > "$STATE_FILE"
fi

# Count messages
MSG_COUNT=$(find "$QUEUE_DIR" -name "*.json" 2>/dev/null | wc -l)

if [ "$MSG_COUNT" -eq 0 ]; then
  # Update last check timestamp
  jq --arg now "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" '.lastCheck = $now' "$STATE_FILE" > "$STATE_FILE.tmp"
  mv "$STATE_FILE.tmp" "$STATE_FILE"
  echo "NO_MESSAGES"
  exit 0
fi

echo "Found $MSG_COUNT A2A message(s) in queue"

# Read notified messages from state
notified_messages=$(jq -r '.notifiedMessages[]' "$STATE_FILE" 2>/dev/null || echo "")

# Process each message
for msg_file in "$QUEUE_DIR"/*.json; do
  [ -f "$msg_file" ] || continue
  
  filename=$(basename "$msg_file")
  
  # Skip if already notified
  if echo "$notified_messages" | grep -q "^$filename$"; then
    echo "Already notified: $filename (skipping)"
    continue
  fi
  
  echo "New message: $filename"
  
  # Extract message data
  from=$(jq -r '.from // "unknown"' "$msg_file")
  message=$(jq -r '.message // ""' "$msg_file")
  timestamp=$(jq -r '.timestamp // ""' "$msg_file")
  task_type=$(jq -r '.metadata.taskType // "general"' "$msg_file")
  task_id=$(jq -r '.metadata.taskId // ""' "$msg_file")
  
  # Build Telegram notification
  notification="🤖 New A2A Message

📥 **From:** $from
🕒 **Time:** $timestamp
📋 **Type:** $task_type"
  
  if [ -n "$task_id" ]; then
    notification="$notification
🔖 **Task ID:** $task_id"
  fi
  
  notification="$notification

💬 **Message:**
$message

---
_Reply will be sent automatically after you formulate a response in this chat._"
  
  # Return notification for heartbeat caller to handle
  # (Heartbeat context can send via message tool with proper formatting)
  echo "NOTIFICATION_REQUIRED"
  echo "---BEGIN_NOTIFICATION---"
  echo "$notification"
  echo "---END_NOTIFICATION---"
  echo "MESSAGE_FILE: $msg_file"
  
  # Mark as notified in state
  jq --arg file "$filename" '.notifiedMessages += [$file]' "$STATE_FILE" > "$STATE_FILE.tmp"
  mv "$STATE_FILE.tmp" "$STATE_FILE"
  
  # If notify-only mode, keep in queue
  if [ "$NOTIFY_ONLY" = false ]; then
    # Move to processed directory (not archive yet - waiting for response)
    mv "$msg_file" "$PROCESSED_DIR/$filename"
    echo "Moved to processed: $filename"
  fi
done

# Update last check timestamp
jq --arg now "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" '.lastCheck = $now' "$STATE_FILE" > "$STATE_FILE.tmp"
mv "$STATE_FILE.tmp" "$STATE_FILE"

echo "✅ Queue check complete. Messages: $MSG_COUNT"
exit 0
