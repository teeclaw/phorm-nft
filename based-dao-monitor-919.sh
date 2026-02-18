#!/bin/bash
# Monitor BASED DAO Auction #919
# Checks if we've been outbid and sends Telegram alert

cd /home/phan_harry/.openclaw/workspace/skills/based-dao-skill

# Get auction status
AUCTION_DATA=$(node scripts/check-auction.js 2>&1)

# Extract current auction ID and bidder
AUCTION_ID=$(echo "$AUCTION_DATA" | grep "Auction #" | awk '{print $2}' | tr -d '#')
HIGHEST_BIDDER=$(echo "$AUCTION_DATA" | grep "Highest Bidder:" | cut -d':' -f2 | xargs)
CURRENT_BID=$(echo "$AUCTION_DATA" | grep "Current Bid:" | cut -d':' -f2 | xargs)
TIME_LEFT=$(echo "$AUCTION_DATA" | grep "Time Left:" | cut -d':' -f2 | xargs)

# Our wallet address
OUR_WALLET="0x134820820d4f631ff949625189950bA7B3C57e41"

# Only proceed if this is auction #919
if [ "$AUCTION_ID" != "919" ]; then
  echo "Auction #919 has ended. Current auction: #$AUCTION_ID"
  exit 0
fi

# Check if we've been outbid
if [ "$HIGHEST_BIDDER" != "None (no bids yet)" ] && [ "$HIGHEST_BIDDER" != "$OUR_WALLET" ]; then
  # We've been outbid - send alert
  MESSAGE="🚨 BASED DAO #919 Alert\n\nYou've been outbid!\n\nCurrent Bid: $CURRENT_BID\nHighest Bidder: $HIGHEST_BIDDER\nTime Left: $TIME_LEFT\n\nhttps://nouns.build/dao/base/0x10a5676ec8ae3d6b1f36a6f1a1526136ba7938bf/919"
  
  # Send via OpenClaw message tool (will route to Telegram)
  echo "OUTBID_ALERT: $MESSAGE"
else
  echo "✅ Still highest bidder on #919 (Bid: $CURRENT_BID, Time Left: $TIME_LEFT)"
fi
