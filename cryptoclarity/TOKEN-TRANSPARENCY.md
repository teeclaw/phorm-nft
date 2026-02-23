# CryptoClarity Token Transparency

Last updated: 2026-02-23
Status: Draft for public publication

## Purpose

$CLARITY is designed to support CryptoClarity and ERC-8004 public goods with verifiable onchain flows.

This page is the single source of truth for token mechanics and reporting commitments.

## Token

- Name: CLARITY
- Symbol: `$CLARITY`
- Contract: `0x826a322b75B1b5b65B336337BCCAE18223beBb07`
- Deployment: Clanker
- Network: Base

## Fee Flow Policy

Trading fees generate value in:
- `WETH`
- `$CLARITY`

### CLARITY Fee Allocation

CLARITY fees are split as follows:

- **50% Burn**
- **50% Public Goods (ERC-8004 context)**

## Burn Policy

Primary path:
- Use Clanker-native burn support if available.

Fallback path:
- If native burn is not supported, send burn allocation to dead address:
  - `0x000000000000000000000000000000000000dEaD`

## Public Goods Wallet

Public goods allocation wallet:
- **Safe wallet (multisig)**

Address:
- **TBA in public post** (already set operationally)

Use of funds is limited to ERC-8004-aligned public goods, including:
- Open standards tooling
- Security hardening and audits
- Ecosystem infra support
- Developer resources in trust/accountability scope

## Governance

Treasury and allocation governance are designed for multisig control:
- Minimum signers: **2**
- Signer list: **TBA**

Any governance-relevant changes (routing, policy, allocation criteria) must be announced publicly before or at execution with onchain references.

## Reporting Commitments

### Weekly Transparency Report

Published weekly with:
- CLARITY amount burned
- CLARITY amount allocated to public goods
- WETH-related fee notes (if applicable)
- Transaction links for all material movements

### Monthly Impact Report

Published monthly with:
- Summary of cumulative burn and allocations
- Public goods usage breakdown
- Outcomes delivered for ERC-8004 ecosystem
- Carry-over and next-month priorities

## Claim Discipline

CryptoClarity communications for `$CLARITY` follow these constraints:

- No guaranteed return or price-performance claims
- No unverifiable statements
- All material allocation/burn claims backed by onchain references

## Pending Disclosures

The following fields are pending publication and will be added as soon as finalized for public release:

1. Safe wallet address (public-facing disclosure)
2. Multisig signer list
3. First proof transactions (burn + public goods allocation)

## Verification Checklist

Before publishing updates, verify:

- Contract address matches all public channels
- Burn and allocation percentages match this policy
- Reported amounts reconcile with tx hashes
- Links resolve on BaseScan

---

CryptoClarity principle: trust is computed, not promised.
