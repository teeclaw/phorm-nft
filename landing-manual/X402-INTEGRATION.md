# x402 + USDC Payment Integration

## Overview

This document describes the USDC payment integration for Agent 18608 Revenue Playbook ($39 PDF).

**Implementation Date:** 2026-03-03  
**Status:** ✅ LIVE  
**Network:** Base Mainnet (Chain ID: 8453)  
**Payment Amount:** 39 USDC  
**Payment Address:** `0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78`

## Architecture

### Design Principles (KISS)

- **Simple storage:** JSON file (`data/sessions.json`) instead of database
- **Direct RPC:** Base RPC via fetch instead of CDP SDK
- **Stateless verification:** Transaction verification using blockchain RPC
- **No dependencies:** Minimal external dependencies, built with Next.js stdlib

### Components

1. **Session Management** (`lib/sessions.ts`)
   - JSON file-based storage
   - Session creation, retrieval, and updates
   - Automatic cleanup (7 days)

2. **Blockchain Verification** (`lib/base-rpc.ts`)
   - Direct Base RPC calls
   - USDC transfer event decoding
   - Amount and recipient verification

3. **API Routes**
   - `/api/payments/x402/initiate` - Create payment session
   - `/api/payments/x402/verify` - Verify USDC transaction

4. **Frontend**
   - `components/USDCPaymentModal.tsx` - Payment modal
   - `app/page.tsx` - Landing page with 3 connected buttons

## Payment Flow

### 1. Initiation

User clicks "Pay with USDC" → Provides wallet address → Session created

**Request:**
```json
POST /api/payments/x402/initiate
{
  "address": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "manual-1234567890-abc123",
  "amount": "39000000",
  "currency": "USDC",
  "network": "base",
  "recipient": "0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78",
  "expiresAt": 1234567890000
}
```

### 2. Payment

User sends 39 USDC to payment address on Base network using their wallet.

**Required Details:**
- **Network:** Base (not Ethereum mainnet!)
- **Token:** USDC (`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- **Amount:** Exactly 39 USDC
- **Recipient:** `0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78`

### 3. Verification

User submits transaction hash → Backend verifies on Base → Download link generated

**Request:**
```json
POST /api/payments/x402/verify
{
  "sessionId": "manual-1234567890-abc123",
  "txHash": "0x..."
}
```

**Verification Checks:**
1. Transaction exists and succeeded
2. Transferred exactly 39 USDC (39000000 with 6 decimals)
3. Sent to correct recipient address
4. USDC contract on Base

**Response (Success):**
```json
{
  "success": true,
  "verified": true,
  "downloadUrl": "/api/download/file?id=...&expires=...&sig=..."
}
```

### 4. Download

User clicks download → Receives PDF with 24-hour signed URL

## Technical Details

### USDC Contract (Base Mainnet)
- **Address:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Decimals:** 6
- **Amount:** 39 USDC = `39000000` (39 × 10^6)

### Base RPC
- **Endpoint:** `https://mainnet.base.org`
- **Chain ID:** 8453
- **Methods Used:**
  - `eth_getTransactionReceipt` - Verify transaction

### Event Decoding

ERC20 Transfer event structure:
```
event Transfer(address indexed from, address indexed to, uint256 value)
```

**Event Signature:** `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`

**Log Structure:**
- `topics[0]` - Event signature
- `topics[1]` - From address (padded)
- `topics[2]` - To address (padded)
- `data` - Amount (uint256)

### Session Storage

Sessions stored in `landing-manual/data/sessions.json`:

```json
{
  "manual-1234567890-abc123": {
    "sessionId": "manual-1234567890-abc123",
    "buyerAddress": "0x...",
    "amount": "39000000",
    "status": "confirmed",
    "createdAt": 1234567890000,
    "expiresAt": 1234567897200,
    "txHash": "0x...",
    "confirmedAt": 1234567892000
  }
}
```

**Status Values:**
- `pending` - Awaiting payment
- `confirmed` - Payment verified
- `failed` - Verification failed
- `expired` - Session expired (2 hours)

**Cleanup:** Sessions older than 7 days are automatically removed.

## Security

### Payment Verification
- ✅ Transaction hash validated (0x + 64 hex chars)
- ✅ Transaction status checked (must be successful)
- ✅ USDC contract verified
- ✅ Amount verified (exact match)
- ✅ Recipient verified (correct address)

### Download URLs
- ✅ HMAC-SHA256 signed URLs
- ✅ 24-hour expiration
- ✅ Session ID included in signature
- ✅ Secret from environment variable

### Session Management
- ✅ Unique session IDs (timestamp + random)
- ✅ 2-hour expiration for payment
- ✅ Addresses normalized to lowercase
- ✅ Automatic old session cleanup

## Environment Variables

Required in `landing-manual/.env.local`:

```bash
X402_WALLET_ADDRESS=0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78
X402_PAYMENT_AMOUNT_USD=39
DOWNLOAD_SECRET=<your-secret-here>
```

## Frontend Integration

### USDCPaymentModal Component

**Features:**
- Payment address display with copy button
- Transaction hash input
- Verification with loading states
- Error handling with user feedback
- Download button on success
- Responsive design (mobile-friendly)

### Connected Buttons

3 locations on landing page:
1. Hero section (top)
2. Pricing section (middle)
3. Final CTA (bottom)

All buttons call `handleUSDCPayment()` on click.

## Testing

### Manual Test Flow

1. **Start dev server:**
   ```bash
   cd landing-manual
   npm run dev
   ```

2. **Click "Pay with USDC"**
   - Enter your wallet address
   - Modal should open with payment details

3. **Send USDC (Testnet first!)**
   - Use Base Sepolia testnet for testing
   - Send exactly 39 USDC to displayed address
   - Copy transaction hash

4. **Verify payment**
   - Paste transaction hash in modal
   - Click "Verify Payment"
   - Should confirm and show download link

5. **Download**
   - Click download button
   - PDF should download

### Production Checklist

Before going live:

- ✅ `DOWNLOAD_SECRET` set to strong random value
- ✅ Test with real USDC on Base mainnet
- ✅ Verify payment address is correct
- ✅ Test all 3 payment buttons
- ✅ Test error cases (wrong amount, wrong network)
- ✅ Verify download URLs work
- ✅ Build succeeds without errors
- ✅ Deploy to Vercel

## Deployment

### Build

```bash
cd landing-manual
npm run build
```

### Deploy (Vercel)

```bash
git add .
git commit -m "Add x402 USDC payment integration"
git push origin main
```

Vercel will auto-deploy.

### Post-Deployment

1. Test payment flow on production
2. Verify environment variables in Vercel dashboard
3. Monitor `data/sessions.json` for successful payments
4. Check transaction confirmations on BaseScan

## Monitoring

### Check Sessions

```bash
cat landing-manual/data/sessions.json | jq
```

### Check Recent Payments

```bash
cat landing-manual/data/sessions.json | jq '[.[] | select(.status == "confirmed")] | sort_by(.confirmedAt) | reverse | .[0:5]'
```

### Check Failed Payments

```bash
cat landing-manual/data/sessions.json | jq '[.[] | select(.status == "failed")]'
```

## Future Enhancements

Potential improvements:

1. **Wallet Connection**
   - Integrate MetaMask/WalletConnect
   - Auto-detect user address
   - One-click payment flow

2. **Email Notifications**
   - Send download link via email
   - Payment confirmations
   - Receipt generation

3. **Analytics**
   - Track conversion rates
   - Payment funnel analysis
   - Revenue reporting

4. **Multi-Network Support**
   - Ethereum mainnet
   - Other L2s (Arbitrum, Optimism)
   - Cross-chain verification

5. **Database Migration**
   - PostgreSQL/Supabase for scale
   - Better session management
   - Payment history tracking

## Support

Questions or issues?

- **Email:** manual@agent18608.xyz
- **GitHub:** teeclaw/landing-manual
- **BaseScan:** https://basescan.org/address/0x1Af5f519DC738aC0f3B58B19A4bB8A8441937e78

---

**Built by:** TeeCode (CTO) for Mr. Tee  
**Last Updated:** 2026-03-03  
**Version:** 1.0
