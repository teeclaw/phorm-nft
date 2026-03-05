#!/bin/bash
# cron-health-check.sh — Check for failing cron jobs and report
# Usage: bash scripts/cron-health-check.sh [--json] [--quiet]
# Exit codes: 0 = all healthy, 1 = errors found, 2 = script error
#
# Designed to be called from heartbeat, daily crons, or manually.

set -euo pipefail

JSON_OUTPUT=false
QUIET=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json) JSON_OUTPUT=true; shift ;;
    --quiet) QUIET=true; shift ;;
    *) echo "Unknown option: $1"; exit 2 ;;
  esac
done

# Get cron list as raw text
RAW=$(openclaw cron list 2>/dev/null)

# Parse error crons (status column = "error")
ERROR_LINES=$(echo "$RAW" | grep -E '\s+error\s+' || true)
ERROR_COUNT=$(echo "$ERROR_LINES" | grep -c 'error' || echo 0)

# Parse running crons that seem stuck (last run > 1 hour ago but still "running")
# This is a heuristic check from the list output
RUNNING_LINES=$(echo "$RAW" | grep -E '\s+running\s+' || true)

if $JSON_OUTPUT; then
  # Output JSON for programmatic consumption
  echo "{"
  echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
  echo "  \"error_count\": $ERROR_COUNT,"
  echo "  \"errors\": ["
  
  first=true
  if [ "$ERROR_COUNT" -gt 0 ]; then
    while IFS= read -r line; do
      [ -z "$line" ] && continue
      # Extract ID (first field) and Name (second field, may have spaces)
      id=$(echo "$line" | awk '{print $1}')
      # Extract name: everything between first and "cron|every" keyword
      name=$(echo "$line" | sed -E 's/^[a-f0-9-]+\s+//' | sed -E 's/\s+(cron|every).*//')
      
      if $first; then first=false; else echo ","; fi
      printf '    {"id": "%s", "name": "%s"}' "$id" "$name"
    done <<< "$ERROR_LINES"
  fi
  
  echo ""
  echo "  ]"
  echo "}"
else
  if [ "$ERROR_COUNT" -eq 0 ]; then
    $QUIET || echo "All cron jobs healthy."
    exit 0
  fi
  
  echo "CRON HEALTH: $ERROR_COUNT job(s) in error state"
  echo ""
  echo "$ERROR_LINES" | while IFS= read -r line; do
    [ -z "$line" ] && continue
    id=$(echo "$line" | awk '{print $1}')
    name=$(echo "$line" | sed -E 's/^[a-f0-9-]+\s+//' | sed -E 's/\s+(cron|every).*//')
    last=$(echo "$line" | grep -oE '[0-9]+[hmd] ago' | head -1)
    echo "  FAIL: $name"
    echo "        ID: $id"
    echo "        Last run: ${last:-unknown}"
    echo ""
  done
  
  exit 1
fi
