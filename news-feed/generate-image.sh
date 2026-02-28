#!/usr/bin/env bash
# Generate a Mr. Tee themed news image using Nano Banana Pro (Gemini 3 Pro Image)
# Usage: ./generate-image.sh "<story_title>" "<tweet_text>" [output_path]
#
# Outputs the image path on success, exits 1 on failure.
# The caller should fall back to text-only posting on failure.

set -euo pipefail

STORY_TITLE="${1:?Usage: generate-image.sh <story_title> <tweet_text> [output_path]}"
TWEET_TEXT="${2:?Usage: generate-image.sh <story_title> <tweet_text> [output_path]}"
TIMESTAMP="$(date -u +%Y-%m-%d-%H-%M-%S)"
OUTPUT_PATH="${3:-/home/phan_harry/.openclaw/workspace/news-feed/images/${TIMESTAMP}-news.png}"
AVATAR_PATH="/home/phan_harry/.openclaw/workspace/a2a-endpoint/avatar.jpg"
GENERATE_SCRIPT="/home/phan_harry/.npm-global/lib/node_modules/openclaw/skills/nano-banana-pro/scripts/generate_image.py"

# Validate dependencies
if [ ! -f "$GENERATE_SCRIPT" ]; then
    echo "Error: Nano Banana Pro script not found at $GENERATE_SCRIPT" >&2
    exit 1
fi

if [ ! -f "$AVATAR_PATH" ]; then
    echo "Error: Avatar image not found at $AVATAR_PATH" >&2
    exit 1
fi

if ! command -v uv >/dev/null 2>&1; then
    echo "Error: uv command not found. Install with: brew install uv" >&2
    exit 1
fi

if [ -z "${GEMINI_API_KEY:-}" ]; then
    echo "Error: GEMINI_API_KEY environment variable not set" >&2
    exit 1
fi

# Create output directory
mkdir -p "$(dirname "$OUTPUT_PATH")"

# Build the image prompt: Mr. Tee character reacting to the news topic
# The avatar is passed as reference so Nano Banana can recreate the character
PROMPT="Create a 16:9 illustration featuring the character from the reference image (a retro CRT monitor-headed figure with glasses, blue lobster hoodie, and crab claws) as the main character.

Scene context based on this news topic: ${STORY_TITLE}

Style guidelines:
- The CRT monitor head character should be the focal point
- Scene should visually represent the news topic in an abstract or metaphorical way
- Clean, modern illustration style with bold colors
- Minimal background clutter, focus on the character and one key visual element
- No text or words in the image
- Aspect ratio: 16:9 wide format
- Mood: slightly sardonic, observational"

# Generate using Nano Banana Pro with avatar as reference
if uv run "$GENERATE_SCRIPT" \
    --prompt "$PROMPT" \
    --filename "$OUTPUT_PATH" \
    --input-image "$AVATAR_PATH" \
    --resolution 2K 2>&1; then
    
    if [ -f "$OUTPUT_PATH" ] && [ -s "$OUTPUT_PATH" ]; then
        echo "$OUTPUT_PATH"
        exit 0
    else
        echo "Error: Output file not created or is empty" >&2
        exit 1
    fi
fi

echo "Error: Image generation command failed" >&2
exit 1
