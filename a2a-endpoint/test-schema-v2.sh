#!/bin/bash

# Test A2A Schema v0.3.0

API="https://a2a.teeclaw.xyz/a2a"

echo "==============================================="
echo "Testing A2A Message Schema v0.3.0"
echo "==============================================="
echo ""

# Test 1: Simplified Format (string from/message - auto-upgraded)
echo "1️⃣  Testing Simplified Format (auto-upgrade)"
echo "-----------------------------------------------"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "TestAgent",
    "message": "Hello from simplified format!"
  }' | jq .
echo ""
echo ""

# Test 2: Basic v0.3.0 (with version and from object)
echo "2️⃣  Testing Basic v0.3.0 (with agent identity)"
echo "-----------------------------------------------"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "0.3.0",
    "from": {
      "name": "TestAgent",
      "agentId": "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:12345"
    },
    "message": {
      "contentType": "text/plain",
      "content": "Hello from v0.3.0 schema!"
    }
  }' | jq .
echo ""
echo ""

# Test 3: Full Format (with callback, threading, expiration)
echo "3️⃣  Testing Full v0.3.0 (all features)"
echo "-----------------------------------------------"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "0.3.0",
    "from": {
      "name": "TestAgent",
      "agentId": "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:12345",
      "callbackUrl": "https://example.com/callback"
    },
    "to": {
      "name": "Mr. Tee",
      "agentId": "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:18608"
    },
    "message": {
      "contentType": "application/json",
      "content": {
        "task": "test",
        "data": "full schema test"
      }
    },
    "metadata": {
      "messageId": "msg_test_custom_id",
      "threadId": "thread_test_123",
      "taskType": "test",
      "priority": "normal",
      "expiresAt": "'$(date -u -d '+1 hour' +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }' | jq .
echo ""
echo ""

# Test 4: Validation Error (missing required field)
echo "4️⃣  Testing Validation (missing 'from')"
echo "-----------------------------------------------"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "This should fail"
  }' | jq .
echo ""
echo ""

# Test 5: Validation Error (invalid agentId format)
echo "5️⃣  Testing Validation (invalid agentId)"
echo "-----------------------------------------------"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "0.3.0",
    "from": {
      "name": "TestAgent",
      "agentId": "invalid-format-123"
    },
    "message": {
      "contentType": "text/plain",
      "content": "Test"
    }
  }' | jq .
echo ""
echo ""

# Test 6: Validation Error (expired message)
echo "6️⃣  Testing Validation (expired message)"
echo "-----------------------------------------------"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "0.3.0",
    "from": {
      "name": "TestAgent"
    },
    "message": {
      "contentType": "text/plain",
      "content": "Test"
    },
    "metadata": {
      "expiresAt": "'$(date -u -d '-1 hour' +%Y-%m-%dT%H:%M:%SZ)'"
    }
  }' | jq .
echo ""
echo ""

# Test 7: JSON Content Type
echo "7️⃣  Testing JSON Content Type"
echo "-----------------------------------------------"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "0.3.0",
    "from": {
      "name": "TestAgent",
      "agentId": "eip155:8453:0x8004A169FB4a3325136EB29fA0ceB6D2e539a432:12345"
    },
    "message": {
      "contentType": "application/json",
      "content": {
        "task": "analyze",
        "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7",
        "networks": ["base", "ethereum"]
      }
    },
    "metadata": {
      "taskType": "analyze_address",
      "priority": "urgent"
    }
  }' | jq .
echo ""
echo ""

# Test 8: Threading (conversation)
echo "8️⃣  Testing Threading (multi-turn conversation)"
echo "-----------------------------------------------"
curl -s -X POST "$API" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "0.3.0",
    "from": {
      "name": "TestAgent"
    },
    "message": {
      "contentType": "text/plain",
      "content": "What is my reputation score?"
    },
    "metadata": {
      "threadId": "thread_test_convo_123"
    }
  }' | jq .
echo ""
echo ""

echo "==============================================="
echo "Test Complete"
echo "==============================================="
