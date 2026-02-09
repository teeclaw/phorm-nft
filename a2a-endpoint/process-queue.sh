#!/bin/bash
# Process A2A message queue
# Called by Mr. Tee during heartbeats or on-demand

QUEUE_DIR="/home/phan_harry/.openclaw/workspace/a2a-endpoint/queue"

# Check if queue directory exists and has files
if [ ! -d "$QUEUE_DIR" ] || [ -z "$(ls -A $QUEUE_DIR 2>/dev/null)" ]; then
  echo "NO_MESSAGES"
  exit 0
fi

# Count pending messages
MESSAGE_COUNT=$(ls -1 "$QUEUE_DIR"/*.json 2>/dev/null | wc -l)

echo "PENDING_MESSAGES: $MESSAGE_COUNT"

# List messages for processing
for msg_file in "$QUEUE_DIR"/*.json; do
  [ -f "$msg_file" ] || continue
  echo "MESSAGE_FILE: $msg_file"
  cat "$msg_file"
  echo "---"
done
