#!/bin/bash
# Execute ERC-8004 metadata update for Agent ID 14482 on Base

set -e

CALLDATA=$(cat "$(dirname "$0")/final-setAgentURI-calldata.txt")

echo "=== ERC-8004 Metadata Update ==="
echo "Agent ID: 14482"
echo "Chain: Base (8453)"
echo "Contract: 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
echo "Calldata size: ${#CALLDATA} bytes"
echo ""
echo "Submitting via Bankr..."
echo ""

~/openclaw/skills/bankr/scripts/bankr.sh "Submit this transaction on Base: {\"to\": \"0x8004A169FB4a3325136EB29fA0ceB6D2e539a432\", \"data\": \"$CALLDATA\", \"value\": \"0\", \"chainId\": 8453}"
