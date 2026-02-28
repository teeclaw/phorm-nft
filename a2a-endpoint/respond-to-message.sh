#!/bin/bash
#
# A2A Response Helper
# Send a response to an A2A message and archive it
#
# Usage: bash respond-to-message.sh <message-filename> "<response-text>"
# Example: bash respond-to-message.sh test-agent-123.json "Thanks for reaching out!"

set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 <message-filename> <response-text>"
  echo "Example: $0 test-agent-123.json 'Thanks for your message!'"
  exit 1
fi

PROCESSED_DIR="/home/phan_harry/.openclaw/workspace/a2a-endpoint/processed"
ARCHIVE_DIR="/home/phan_harry/.openclaw/workspace/a2a-endpoint/archive"
RESPONSE_LOG="/home/phan_harry/.openclaw/workspace/a2a-endpoint/responses.log"

MSG_FILENAME="$1"
RESPONSE_TEXT="$2"
MSG_FILE="$PROCESSED_DIR/$MSG_FILENAME"

# Check if message exists
if [ ! -f "$MSG_FILE" ]; then
  echo "❌ Message not found: $MSG_FILE"
  echo "Available messages in processed:"
  ls -1 "$PROCESSED_DIR" 2>/dev/null || echo "(none)"
  exit 1
fi

# Extract sender info
from=$(jq -r '.from // "unknown"' "$MSG_FILE")
original_message=$(jq -r '.message // ""' "$MSG_FILE")
timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Log response
echo "[$timestamp] To: $from | Response: $RESPONSE_TEXT" >> "$RESPONSE_LOG"

# Create response record
response_file="$ARCHIVE_DIR/response-$(date +%s)-$MSG_FILENAME"
jq --arg response "$RESPONSE_TEXT" --arg timestamp "$timestamp" \
  '. + {response: $response, respondedAt: $timestamp}' \
  "$MSG_FILE" > "$response_file"

# Move original to archive
mv "$MSG_FILE" "$ARCHIVE_DIR/$MSG_FILENAME"

echo "✅ Response logged and message archived"
echo ""
echo "📤 Response sent to $from:"
echo "$RESPONSE_TEXT"
echo ""
echo "📁 Archived: $ARCHIVE_DIR/$MSG_FILENAME"
echo "📝 Response logged: $RESPONSE_LOG"

exit 0
