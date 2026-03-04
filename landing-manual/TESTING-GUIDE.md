# Testing Guide - x402 Payment Integration

## Quick Test (Development)

```bash
cd landing-manual
npm run dev
```

Open http://localhost:3000

1. Click "Pay with USDC" button
2. **Expected:** Modal opens (no browser prompt)
3. Enter wallet address (optional) or skip
4. Click "Continue to Payment"
5. **Expected:** See payment details (39 USDC, Base network, recipient address)
6. Copy recipient address
7. Send 39 USDC on Base (testnet or mainnet)
8. Enter transaction hash
9. Click "Verify Payment"
10. **Expected:** 
    - "Checking with payment validators..." message
    - After verification: "Payment Confirmed!"
    - Facilitator name displayed (e.g., "Verified by: Coinbase Commerce")
    - Download button appears

---

## Production Test

**Requirements:**
- 39 USDC on Base mainnet
- Base-compatible wallet (MetaMask, Coinbase Wallet, etc.)

**Steps:**

1. Navigate to production URL: https://agent18608.xyz
2. Click "Pay with USDC" button
3. Modal opens with wallet input
4. Click "Continue to Payment"
5. Copy payment address: `0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78`
6. Send exactly 39 USDC on Base network
7. Copy transaction hash from wallet
8. Paste into modal
9. Click "Verify Payment"
10. Wait for onchain.fi verification (~5-10 seconds)
11. Confirm payment verified ✓
12. Check facilitator name shows
13. Click "Download Your Playbook"
14. Verify PDF downloads
15. Test download link expiry (24 hours later)

---

## Error Case Testing

### 1. Wrong Amount

**Test:** Send 38 USDC instead of 39

**Expected:**
- Verification fails
- Error: "Payment verification failed"
- Clear message about expected amount

### 2. Invalid Transaction Hash

**Test:** Enter `0x123` (invalid format)

**Expected:**
- Verification fails
- Error: "Invalid transaction hash" or "Transaction not found"

### 3. Different Network

**Test:** Send USDC on Ethereum mainnet (not Base)

**Expected:**
- Verification fails
- Error: "No USDC transfer found" or "Wrong network"

### 4. Expired Session

**Test:** Wait 2+ hours after payment initiation

**Expected:**
- Session expired message
- Option to restart payment process

---

## Verification Logs

Check server logs for onchain.fi responses:

```bash
# In production (Vercel)
vercel logs --project=agent-18608-landing

# Look for:
[x402-verify] Calling onchain.fi /v1/pay
[x402-verify] Response: { verified: true, facilitator: "..." }
```

---

## Environment Validation

Verify all required environment variables are set:

```bash
# Check .env.local
cat landing-manual/.env.local | grep -E "(ONCHAIN_API_KEY|X402_WALLET_ADDRESS|DOWNLOAD_SECRET)"
```

**Expected output:**
```
ONCHAIN_API_KEY=onchain_f4b16848569003bcf6a055d4f909889cee7c5a998745e6b5ca5af359b32d252b
X402_WALLET_ADDRESS=0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78
DOWNLOAD_SECRET=26d0628373175950335ca09d3661615fa820445d9f6a6edf6bd598fb857daf31
```

---

## Monitoring

### Success Metrics

Track in analytics:
- Payment modal opens
- Payment initiations
- Verification attempts
- Successful verifications
- Download completions

### Error Metrics

Monitor:
- Verification failures (by reason)
- Invalid transaction hashes
- Wrong amounts
- Network mismatches
- API errors (onchain.fi downtime)

---

## Troubleshooting

### Modal doesn't open

**Check:** Browser console for JavaScript errors

### Payment verification fails

**Check:**
1. Transaction hash is correct (64 hex characters)
2. Amount is exactly 39 USDC (not 39.00001)
3. Network is Base (not Ethereum/Polygon/etc.)
4. ONCHAIN_API_KEY is valid

### Download link doesn't work

**Check:**
1. DOWNLOAD_SECRET is set correctly
2. Signature validation in `/api/download/file`
3. PDF file exists at expected path

### "Verification failed" error

**Debug:**
1. Check onchain.fi API status
2. Verify API key is valid
3. Check network logs in browser DevTools
4. Review server logs for detailed error

---

## Performance Benchmarks

**Expected response times:**

- Payment initiation: <100ms
- Payment verification: 2-5 seconds (onchain.fi API call)
- Download URL generation: <50ms
- PDF download: 1-2 seconds (depending on file size)

**If slower:**
- Check onchain.fi API latency
- Verify server resources
- Check network connectivity

---

## Security Checklist

- [ ] ONCHAIN_API_KEY not exposed in frontend
- [ ] Download URLs are signed (HMAC-SHA256)
- [ ] Session IDs are cryptographically random
- [ ] No sensitive data in error messages
- [ ] Download links expire after 24 hours

---

## Browser Compatibility

Tested in:
- Chrome 120+
- Firefox 120+
- Safari 17+
- Edge 120+

**Mobile:**
- iOS Safari
- Chrome Mobile
- MetaMask Mobile Browser

---

## API Endpoints

### POST /api/payments/x402/initiate

**Request:**
```json
{
  "walletAddress": "0x..." // optional
}
```

**Response:**
```json
{
  "x402Version": 1,
  "error": "Payment Required",
  "accepts": [{
    "scheme": "exact",
    "network": "base",
    "maxAmountRequired": "39000000",
    "payTo": "0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
  }],
  "sessionId": "1234567890-abc123"
}
```

### POST /api/payments/x402/verify

**Request:**
```json
{
  "sessionId": "1234567890-abc123",
  "txHash": "0xabc..."
}
```

**Response (success):**
```json
{
  "success": true,
  "verified": true,
  "status": "confirmed",
  "downloadUrl": "/api/download/file?token=...",
  "txHash": "0xabc...",
  "facilitator": "Coinbase Commerce"
}
```

**Response (failure):**
```json
{
  "success": false,
  "verified": false,
  "status": "failed",
  "error": "Wrong amount. Expected 39000000, got 38000000"
}
```

---

**Ready for testing!** 🚀

For production deployment, see IMPLEMENTATION-REPORT.md
