#!/bin/bash
# Test x402 payment gating on A2A endpoint

echo "=== Testing A2A Payment Gates ==="
echo ""

# Test 1: Free endpoint (check_reputation - simple report)
echo "1. Testing FREE endpoint: check_reputation"
curl -s -X POST http://localhost:3100/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "from": "TestAgent",
    "message": "Check reputation for 0x112F14D7aB03111Fdf720c6Ccc720A21576F7487",
    "metadata": {
      "taskType": "check_reputation",
      "address": "0x112F14D7aB03111Fdf720c6Ccc720A21576F7487"
    }
  }' | jq -r 'if .status then "✅ FREE - No payment required" else "❌ FAILED" end'
echo ""

# Test 2: Paid endpoint WITHOUT payment (check_reputation_full)
echo "2. Testing PAID endpoint WITHOUT payment: check_reputation_full"
RESPONSE=$(curl -s -X POST http://localhost:3100/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "from": "TestAgent",
    "message": "Check full reputation for 0x112F14D7aB03111Fdf720c6Ccc720A21576F7487",
    "metadata": {
      "taskType": "check_reputation_full",
      "address": "0x112F14D7aB03111Fdf720c6Ccc720A21576F7487"
    }
  }')

if echo "$RESPONSE" | jq -e '.error == "Payment Required"' > /dev/null; then
  echo "✅ GATED - Returns 402 Payment Required"
  echo "$RESPONSE" | jq -r '.pricing | "   Required: \(.amount) \(.currency) on \(.network)"'
else
  echo "❌ FAILED - Should require payment but didn't"
  echo "$RESPONSE" | jq '.'
fi
echo ""

# Test 3: Default A2A message (free)
echo "3. Testing DEFAULT A2A message (no specific taskType)"
curl -s -X POST http://localhost:3100/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "from": "TestAgent",
    "message": "Hello Mr. Tee, can you help me with something?"
  }' | jq -r 'if .status then "✅ FREE - No payment required" else "❌ FAILED" end'
echo ""

# Test 4: Credential query (free)
echo "4. Testing CREDENTIAL query (free)"
curl -s -X POST http://localhost:3100/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "from": "TestAgent",
    "message": "Query credentials",
    "metadata": {
      "taskType": "query_credentials"
    }
  }' | jq -r 'if .status then "✅ FREE - No payment required" else "❌ FAILED" end'
echo ""

echo "=== Payment Gate Test Complete ==="
