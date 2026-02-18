#!/usr/bin/env bash
# Mark a story GUID as posted to prevent re-posting
# Usage: ./mark-posted.sh "<guid>"

GUID="$1"
LOG_FILE="$(dirname "$0")/logs/posted.log"

if [ -z "$GUID" ]; then
    echo "Usage: mark-posted.sh <guid>" >&2
    exit 1
fi

mkdir -p "$(dirname "$LOG_FILE")"
echo "$GUID" >> "$LOG_FILE"
echo "Marked as posted: $GUID"
