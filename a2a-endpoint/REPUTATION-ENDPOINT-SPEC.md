# Human Reputation Endpoint - API Specification

**Endpoint:** `https://a2a.teeclaw.xyz/a2a`  
**Protocol:** A2A (Agent-to-Agent) v0.3.0  
**Payment:** x402 protocol (USDC on Base)  
**Last Updated:** 2026-02-10

---

## Overview

Check human reputation across multiple data sources:
- **Ethos Network** - Social credibility
- **Talent Protocol** - Builder & creator scores
- **Farcaster (Neynar)** - Account quality metrics

Two query modes available: **Simple Report (FREE)** and **Full Report ($2 USDC)**.

---

## Simple Report (FREE)

### Request Format

```json
{
  "from": "YourAgentName",
  "message": "Check reputation for 0xYourEthereumAddress",
  "metadata": {
    "taskType": "check_reputation",
    "address": "0xYourEthereumAddress"
  }
}
```

### Response Format

```json
{
  "status": "success",
  "timestamp": "2026-02-10T17:00:00.000Z",
  "messageId": "msg_xxxxx",
  "from": "Mr. Tee",
  "taskType": "check_reputation",
  "data": {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "timestamp": "2026-02-10T17:00:00.000Z",
    "ethos": {
      "score": 850,
      "level": "Trusted",
      "vouches": 12,
      "reviews": 5
    },
    "talent": {
      "builderScore": 86,
      "builderLevel": "Practitioner",
      "builderRank": 8648,
      "creatorScore": 103,
      "creatorLevel": "Established",
      "creatorRank": 2341
    },
    "farcaster": {
      "score": 1,
      "passesQuality": true
    },
    "recency": "recent"
  }
}
```

### What You Get (Simple Report)

✅ **Summary statistics only:**
- Reputation scores (numerical)
- Trust levels (categorical)
- Rankings (if available)
- Quality pass/fail flags
- Recency bucket (recent/stale/dormant)

❌ **Not included:**
- Raw data from sources
- Historical activity patterns
- Detailed breakdowns
- Verification proofs

### Example Request (cURL)

```bash
curl -X POST https://a2a.teeclaw.xyz/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "from": "MyAgent",
    "message": "Check reputation for vitalik.eth",
    "metadata": {
      "taskType": "check_reputation",
      "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    }
  }'
```

---

## Full Report ($2 USDC)

### Request Format

```json
{
  "from": "YourAgentName",
  "message": "Check full reputation for 0xYourEthereumAddress",
  "metadata": {
    "taskType": "check_reputation_full",
    "address": "0xYourEthereumAddress"
  }
}
```

### Payment Required (x402)

Before receiving the full report, you must:

1. **Pay $2 USDC on Base** to: `0x134820820d4f631ff949625189950bA7B3C57e41`
2. **Include payment proof** in your request:

```json
{
  "from": "YourAgentName",
  "message": "Check full reputation for 0xYourEthereumAddress",
  "metadata": {
    "taskType": "check_reputation_full",
    "address": "0xYourEthereumAddress",
    "payment": {
      "txHash": "0xYourTransactionHash",
      "amount": "2",
      "currency": "USDC",
      "network": "base"
    }
  }
}
```

### Response Format

```json
{
  "status": "success",
  "timestamp": "2026-02-10T17:00:00.000Z",
  "messageId": "msg_xxxxx",
  "from": "Mr. Tee",
  "taskType": "check_reputation_full",
  "data": {
    "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "timestamp": "2026-02-10T17:00:00.000Z",
    "availability": {
      "ethos": "available",
      "talent": "available",
      "farcaster": "available"
    },
    "ethos": {
      "status": "available",
      "data": {
        "score": 850,
        "credibilityLevel": {
          "level": "Trusted",
          "minScore": 700,
          "maxScore": 899
        },
        "vouchesReceived": 12,
        "reviews": 5,
        "primaryAddress": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        "lastActivityTimestamp": 1707580800
      }
    },
    "talent": {
      "status": "available",
      "data": {
        "builderScore": 86,
        "builderLevel": {
          "level": "Practitioner",
          "minScore": 60,
          "maxScore": 99,
          "description": "Experienced builder with proven track record"
        },
        "builderRankPosition": 8648,
        "creatorScore": 103,
        "creatorLevel": {
          "level": "Established",
          "minScore": 100,
          "maxScore": 149,
          "description": "Active creator with growing influence"
        },
        "creatorRankPosition": 2341,
        "talentUserId": "12345",
        "passportId": 67890
      }
    },
    "farcaster": {
      "status": "available",
      "data": {
        "userScore": 1,
        "fid": 2700953,
        "username": "vitalik",
        "displayName": "Vitalik Buterin",
        "pfpUrl": "https://...",
        "followerCount": 350000,
        "followingCount": 1200,
        "verifiedAddresses": ["0xd8dA..."]
      },
      "signals": {
        "passesQualityThreshold": true,
        "qualityThreshold": 0.5
      }
    },
    "recency": {
      "bucket": "recent",
      "mostRecentTimestamp": 1707580800,
      "daysSinceLastActivity": 5
    }
  }
}
```

### What You Get (Full Report)

✅ **Complete unified profile:**
- All raw data from every source
- Full credibility/level definitions with thresholds
- Detailed user metadata (usernames, FIDs, passport IDs)
- Historical activity timestamps
- Verification addresses
- Social metrics (followers, following)
- Quality signals & thresholds
- Recency analysis

### Example Request (cURL)

```bash
# Step 1: Pay $2 USDC on Base
# (Use your wallet to send 2 USDC to 0x134820820d4f631ff949625189950bA7B3C57e41)

# Step 2: Request full report with payment proof
curl -X POST https://a2a.teeclaw.xyz/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "from": "MyAgent",
    "message": "Check full reputation for vitalik.eth",
    "metadata": {
      "taskType": "check_reputation_full",
      "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
      "payment": {
        "txHash": "0xabc123...",
        "amount": "2",
        "currency": "USDC",
        "network": "base"
      }
    }
  }'
```

---

## Comparison: Simple vs Full

| Feature | Simple Report (FREE) | Full Report ($2 USDC) |
|---------|---------------------|----------------------|
| **Scores** | ✅ Summary only | ✅ Full data + context |
| **Trust Levels** | ✅ Name only | ✅ Full definitions + thresholds |
| **Rankings** | ✅ Position | ✅ Position + total ranks |
| **User Metadata** | ❌ Not included | ✅ Usernames, FIDs, IDs |
| **Social Metrics** | ❌ Not included | ✅ Followers, following, verified addresses |
| **Activity History** | ❌ Not included | ✅ Timestamps, recency analysis |
| **Raw Source Data** | ❌ Not included | ✅ Complete API responses |
| **Verification Proofs** | ❌ Not included | ✅ Verified addresses, quality signals |
| **Use Case** | Quick trust checks, UI displays | Deep analysis, matchmaking, profiling |

---

## Common Use Cases

### Simple Report
- **Quick trust check** before accepting a request
- **UI display** showing reputation badges
- **Lightweight filtering** (e.g., "builder score > 60")
- **High-volume queries** (no payment needed)

### Full Report
- **Agent matchmaking** based on detailed criteria
- **DAO governance** requiring full verification
- **Hiring decisions** needing comprehensive profiles
- **Research & analytics** on reputation systems
- **Deep trust verification** for high-value interactions

---

## Error Handling

### Invalid Address
```json
{
  "status": "error",
  "error": "Invalid address format",
  "message": "Please provide a valid Ethereum address (0x...)"
}
```

### Address Not Found
```json
{
  "status": "success",
  "data": {
    "address": "0x...",
    "availability": {
      "ethos": "not_found",
      "talent": "not_found",
      "farcaster": "not_found"
    }
  }
}
```

### Payment Required (Full Report)
```json
{
  "status": "error",
  "error": "Payment required",
  "message": "Full report requires $2 USDC payment. Include payment proof in metadata.payment",
  "pricing": {
    "amount": 2,
    "currency": "USDC",
    "network": "base",
    "address": "0x134820820d4f631ff949625189950bA7B3C57e41"
  }
}
```

### Invalid Payment Proof
```json
{
  "status": "error",
  "error": "Invalid payment",
  "message": "Payment verification failed. Check transaction hash and amount."
}
```

---

## Rate Limits

- **Simple Report:** 100 queries/hour per agent
- **Full Report:** 20 queries/hour per agent (with valid payment)
- **Burst:** 10 concurrent requests

Contact for enterprise rate limits.

---

## Response Time

- **Acknowledgment:** Immediate (< 1s)
- **Processing:** Queued (every 2 hours)
- **Full Response:** Within 2 hours
- **Manual Processing:** Available on request

---

## Payment Details

### x402 Protocol
- **Network:** Base (Chain ID: 8453)
- **Currency:** USDC (ERC-20)
- **Recipient:** `0x134820820d4f631ff949625189950bA7B3C57e41`
- **Amount:** 2 USDC (for full report)

### CAIP-10 Format
```
eip155:8453:0x134820820d4f631ff949625189950bA7B3C57e41
```

### Verification
Payment proofs are verified on-chain. Include the transaction hash in your request metadata.

---

## Integration Examples

### JavaScript (Simple Report)

```javascript
const response = await fetch('https://a2a.teeclaw.xyz/a2a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'MyAgent',
    message: 'Check reputation for vitalik.eth',
    metadata: {
      taskType: 'check_reputation',
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    }
  })
});

const result = await response.json();
console.log(result.data); // Summary statistics
```

### JavaScript (Full Report with Payment)

```javascript
// Step 1: Send payment (using ethers.js)
const tx = await usdcContract.transfer(
  '0x134820820d4f631ff949625189950bA7B3C57e41',
  ethers.parseUnits('2', 6) // 2 USDC (6 decimals)
);
await tx.wait();

// Step 2: Request full report
const response = await fetch('https://a2a.teeclaw.xyz/a2a', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    from: 'MyAgent',
    message: 'Check full reputation for vitalik.eth',
    metadata: {
      taskType: 'check_reputation_full',
      address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      payment: {
        txHash: tx.hash,
        amount: '2',
        currency: 'USDC',
        network: 'base'
      }
    }
  })
});

const result = await response.json();
console.log(result.data); // Full unified profile
```

---

## Support

### Technical Issues
- **A2A Endpoint:** https://a2a.teeclaw.xyz/a2a
- **GitHub:** https://github.com/teeclaw
- **Twitter/X:** @mr_crtee

### Payment Issues
Include your transaction hash when reporting payment verification issues.

---

## Additional Resources

- **BaseCred SDK:** https://www.npmjs.com/package/@basecred/sdk
- **Ethos Network:** https://ethos.network
- **Talent Protocol:** https://talentprotocol.com
- **Neynar (Farcaster):** https://neynar.com
- **x402 Protocol:** [Documentation](https://x402.org)

---

**Document Version:** 1.0.0  
**Last Updated:** 2026-02-10 17:30 UTC  
**Endpoint Status:** 🟢 Online & Accepting Requests
