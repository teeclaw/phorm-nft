# Golden Ratio — φ

> Fully onchain generative art NFT driven by φ = 1.618...

## Numbers

| Parameter  | Value   | Derivation           |
|------------|---------|----------------------|
| Price      | 0.0618 ETH | = 1/φ ÷ 10        |
| Max Supply | 61      | ≈ 100/φ rounded down |
| Symbol     | PHI     | Greek letter phi     |
| Network    | Base    | Mainnet (chainId 8453) |

## Art

Each token is a **phyllotaxis spiral** — the same pattern found in sunflower seeds, pine cones, and nautilus shells — driven by the golden angle (137.5°).

The golden angle = 360° × (1 - 1/φ) = 360° × 0.382 = 137.508°...

Every point `i` is placed at:
```
r = sqrt(i/n) × maxRadius        (uniform density)
θ = i × goldenAngle + rotation   (golden angle rotation)
x = cx + r·cos(θ)
y = cy + r·sin(θ)
```

This produces the characteristic spiral arms: the same count as Fibonacci numbers.

### Parameters (per token, derived from seed)

| Parameter | Range    | Trait      |
|-----------|----------|------------|
| Palette   | 8 options | `Palette` |
| Points    | 250–600  | `Points`   |
| Layers    | 1–3      | `Layers`   |
| Dot size  | 0.4–2.0x | (internal) |
| Rotation  | 0–2π     | (internal) |

### Palettes

| # | Name       | Base color |
|---|------------|------------|
| 0 | Solar      | Black + Gold |
| 1 | Cosmic     | Deep blue + Purple |
| 2 | Crimson    | Dark + Red |
| 3 | Desert     | Brown + Sand |
| 4 | Forest     | Dark + Green |
| 5 | Neon       | Dark purple + Cyan/Pink |
| 6 | Monochrome | Black + White |
| 7 | Emerald    | Deep green tones |

## Fully Onchain

- **No IPFS.** No Arweave. No external CDN.
- `tokenURI` returns `data:application/json;base64,...`
- `image` and `animation_url` are both `data:text/html;base64,...`
- The HTML contains a p5.js-compatible Canvas shim + art script, all embedded.
- The seed is derived from `blockhash(block.number - 1)` + `tokenId` + `msg.sender` + `block.timestamp`.

## Setup

```bash
npm install
cp .env.example .env
# Edit .env with your keys
```

## Compile

```bash
npm run compile
```

## Test

```bash
npm test
```

## Deploy to Base Sepolia (testnet)

```bash
npm run deploy:testnet
```

## Deploy to Base Mainnet

```bash
npm run deploy:mainnet
```

## Minting Site

After deployment:

1. Update `CONTRACT_ADDRESS` in `frontend/index.html`
2. Serve `frontend/index.html` on any static host (Vercel, Netlify, GitHub Pages)

No backend needed. The site talks directly to Base via the user's wallet.

## Contract Interface

```solidity
function mint() external payable;                // 0.0618 ETH
function totalMinted() external view returns (uint256);
function tokenURI(uint256) external view returns (string); // fully onchain
function seedOf(uint256) external view returns (bytes32);
function withdraw() external; // owner only
```

## Security Notes

- Refund of excess ETH via `call` (not `transfer`) for forward-compatible gas.
- `withdraw()` restricted to `Ownable` owner.
- Token IDs start at 1.
- Seed uses `blockhash(block.number - 1)` — not perfectly unpredictable but sufficient for art.
  If you want stronger randomness, consider Chainlink VRF (adds cost + complexity).

---

*φ = 1.618033988749895...*
