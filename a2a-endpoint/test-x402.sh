#!/bin/bash

# Test x402 payment verification

BASE_URL="http://localhost:3100"

echo "=== x402 Payment Testing ==="
echo

# Test 1: Free endpoint (health check)
echo "1. Testing free endpoint (health)..."
curl -s "$BASE_URL/health" | jq
echo

# Test 2: Paid endpoint without payment (should fail with 402)
echo "2. Testing A2A without payment (should return 402)..."
curl -s -X POST "$BASE_URL/a2a" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "TestAgent",
    "message": "Check my reputation",
    "metadata": {
      "taskType": "query_credentials"
    }
  }' | jq
echo

# Test 3: Free task (check_reputation)
echo "3. Testing free task (check_reputation)..."
curl -s -X POST "$BASE_URL/a2a" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "TestAgent",
    "message": "Check reputation for 0x123...",
    "metadata": {
      "taskType": "check_reputation"
    }
  }' | jq
echo

# Test 4: Paid endpoint with valid payment
echo "4. Testing A2A with payment..."
curl -s -X POST "$BASE_URL/a2a" \
  -H "Content-Type: application/json" \
  -H "x402-payment-receipt: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" \
  -H "x402-payment-amount: 0.10" \
  -H "x402-payment-currency: USDC" \
  -H "x402-payment-network: base" \
  -d '{
    "from": "TestAgent",
    "message": "Query credentials for address 0x123...",
    "metadata": {
      "taskType": "query_credentials"
    }
  }' | jq
echo

# Test 5: Check agent card for pricing info
echo "5. Checking agent card for x402 pricing..."
curl -s "$BASE_URL/.well-known/agent-card.json" | jq '.x402'
echo

echo "=== Tests Complete ==="
