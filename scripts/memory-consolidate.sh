#!/bin/bash
# memory-consolidate.sh — Archive old daily memory files into weekly summaries
# Follows the 3-Layer Memory System (CONSOLIDATION.md)
#
# What it does:
# 1. Identifies daily memory files older than RETENTION_DAYS (default: 7)
# 2. Groups them by ISO week
# 3. Concatenates each week's files into memory/archive/week-YYYY-WNN.md
# 4. Moves originals to memory/archive/raw/ for safety
# 5. Reports stats
#
# Usage: bash scripts/memory-consolidate.sh [--dry-run] [--retention-days N]
# Safe: originals are never deleted, only moved.

set -euo pipefail

MEMORY_DIR="$HOME/.openclaw/workspace/memory"
ARCHIVE_DIR="$MEMORY_DIR/archive"
RAW_ARCHIVE="$ARCHIVE_DIR/raw"
RETENTION_DAYS=7
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --retention-days) RETENTION_DAYS="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Calculate cutoff date
CUTOFF=$(date -d "-${RETENTION_DAYS} days" +%Y-%m-%d 2>/dev/null || date -v-${RETENTION_DAYS}d +%Y-%m-%d)

echo "Memory Consolidation"
echo "  Retention: ${RETENTION_DAYS} days"
echo "  Cutoff: ${CUTOFF}"
echo "  Dry run: ${DRY_RUN}"
echo ""

# Find daily files older than cutoff (pattern: YYYY-MM-DD*.md)
OLD_FILES=()
for f in "$MEMORY_DIR"/2???-??-??*.md; do
  [ -f "$f" ] || continue
  basename=$(basename "$f")
  # Extract date portion (first 10 chars)
  file_date="${basename:0:10}"
  
  # Validate date format
  if [[ ! "$file_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    continue
  fi
  
  # Compare dates lexicographically (works for ISO dates)
  if [[ "$file_date" < "$CUTOFF" ]]; then
    OLD_FILES+=("$f")
  fi
done

if [ ${#OLD_FILES[@]} -eq 0 ]; then
  echo "No files older than ${RETENTION_DAYS} days. Nothing to consolidate."
  exit 0
fi

echo "Found ${#OLD_FILES[@]} files to consolidate:"

# Group by ISO week
declare -A WEEK_FILES
for f in "${OLD_FILES[@]}"; do
  basename=$(basename "$f")
  file_date="${basename:0:10}"
  # Get ISO week: YYYY-WNN
  week=$(date -d "$file_date" +%G-W%V 2>/dev/null || date -j -f "%Y-%m-%d" "$file_date" +%G-W%V)
  WEEK_FILES["$week"]+="$f "
  echo "  $basename -> $week"
done

echo ""

if $DRY_RUN; then
  echo "[DRY RUN] Would create ${#WEEK_FILES[@]} weekly summaries and archive ${#OLD_FILES[@]} files."
  for week in $(echo "${!WEEK_FILES[@]}" | tr ' ' '\n' | sort); do
    count=$(echo "${WEEK_FILES[$week]}" | wc -w)
    echo "  $week: $count files -> archive/week-${week}.md"
  done
  exit 0
fi

# Create archive dirs
mkdir -p "$RAW_ARCHIVE"

TOTAL_ARCHIVED=0
TOTAL_LINES_BEFORE=0
TOTAL_LINES_AFTER=0

for week in $(echo "${!WEEK_FILES[@]}" | tr ' ' '\n' | sort); do
  SUMMARY_FILE="$ARCHIVE_DIR/week-${week}.md"
  
  echo "Creating: week-${week}.md"
  
  # Build weekly summary
  {
    echo "# Weekly Summary: ${week}"
    echo ""
    echo "_Auto-consolidated on $(date -u +%Y-%m-%d) by memory-consolidate.sh_"
    echo ""
    
    for f in $(echo "${WEEK_FILES[$week]}" | tr ' ' '\n' | sort); do
      basename=$(basename "$f")
      lines=$(wc -l < "$f")
      TOTAL_LINES_BEFORE=$((TOTAL_LINES_BEFORE + lines))
      
      echo "---"
      echo ""
      echo "## ${basename%.md}"
      echo ""
      cat "$f"
      echo ""
    done
  } > "$SUMMARY_FILE"
  
  TOTAL_LINES_AFTER=$((TOTAL_LINES_AFTER + $(wc -l < "$SUMMARY_FILE")))
  
  # Move originals to raw archive
  for f in $(echo "${WEEK_FILES[$week]}" | tr ' ' '\n' | sort); do
    mv "$f" "$RAW_ARCHIVE/"
    TOTAL_ARCHIVED=$((TOTAL_ARCHIVED + 1))
  done
  
  echo "  -> $(wc -l < "$SUMMARY_FILE") lines"
done

echo ""
echo "Consolidation complete:"
echo "  Files archived: ${TOTAL_ARCHIVED}"
echo "  Lines before: ${TOTAL_LINES_BEFORE}"
echo "  Lines after: ${TOTAL_LINES_AFTER}"
echo "  Files remaining in memory/: $(ls "$MEMORY_DIR"/*.md 2>/dev/null | wc -l)"
echo "  Raw originals preserved in: memory/archive/raw/"
