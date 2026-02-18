/**
 * Golden Ratio NFT — SVG Generator
 * Usage:
 *   node scripts/generate-svg.js [seedHex] [outFile]
 *
 * Examples:
 *   node scripts/generate-svg.js                          # random seed → stdout
 *   node scripts/generate-svg.js deadbeef... output.svg   # specific seed → file
 */

const fs   = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// ─── Art constants (must match contract) ────────────────────────────────────
const PHI      = 1.618033988749895;
const GA       = 2 * Math.PI - (2 * Math.PI) / PHI; // golden angle ≈ 2.3999 rad

const PALETTES = [
  ["#080808","#FFD700","#FFA500","#FF6B35","#F7C59F"],  // Solar
  ["#0c0a1e","#C77DFF","#9B5DE5","#e0aaff","#E9C46A"],  // Cosmic
  ["#0d0d0d","#e94560","#0f3460","#16213e","#f5e4e4"],  // Crimson
  ["#120a05","#8B4513","#D2691E","#F4A460","#FFDEAD"],  // Desert
  ["#0D1117","#161b22","#30A14E","#3FB950","#58d68d"],  // Forest
  ["#0d0522","#11998e","#38ef7d","#FC5C7D","#6A3093"],  // Neon
  ["#050505","#1c1c1c","#e0e0e0","#f5f5f5","#ffffff"],  // Monochrome
  ["#071a10","#1B4332","#40916C","#74C69D","#D8F3DC"],  // Emerald
];

const PAL_NAMES = ["Solar","Cosmic","Crimson","Desert","Forest","Neon","Monochrome","Emerald"];

// ─── LCG RNG (matches contract) ─────────────────────────────────────────────
function makeRng(seedHex) {
  let rs = BigInt("0x" + seedHex);
  return () => {
    rs = (rs * 6364136223846793005n + 1442695040888963407n) & 18446744073709551615n;
    return Number(rs & 4294967295n) / 4294967295;
  };
}

// ─── Random seed if not supplied ────────────────────────────────────────────
function randomSeedHex() {
  const buf = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) buf[i] = Math.floor(Math.random() * 256);
  return buf.toString("hex");
}

// ─── SVG generation ─────────────────────────────────────────────────────────
function generateSVG(seedHex, tokenId = 0) {
  const rnd = makeRng(seedHex);

  const palIdx = Math.floor(rnd() * 8);
  const pal    = PALETTES[palIdx];
  const N      = 250 + Math.floor(rnd() * 350);
  const ds     = 0.4  + rnd() * 1.6;
  const LY     = 1    + Math.floor(rnd() * 3);
  const ro     = rnd() * Math.PI * 2;

  const label  = tokenId ? `Golden Ratio #${tokenId}` : `Golden Ratio (preview)`;

  // ── Phyllotaxis circles ──────────────────────────────────────────────────
  const circles = [];
  for (let l = 0; l < LY; l++) {
    const lr = ro + l * (PHI - 1) * Math.PI * 2;
    const mr = 350 * (1 - l * 0.2);
    const np = Math.floor(N / LY);

    for (let i = 1; i <= np; i++) {
      const t  = i / np;
      const r  = Math.sqrt(t) * mr;
      const th = i * GA + lr;
      const x  = 400 + r * Math.cos(th);
      const y  = 400 + r * Math.sin(th);
      const ci = 1 + Math.floor(t * (pal.length - 1));
      const color   = pal[Math.min(ci, pal.length - 1)];
      const opacity = (0.4 + t * 0.6).toFixed(3);
      const radius  = (ds * (1.2 + t * 3.5) * (1 - l * 0.18) / 2).toFixed(2);

      circles.push(
        `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${radius}" fill="${color}" opacity="${opacity}"/>`
      );
    }
  }

  // ── Nested golden rectangles overlay ────────────────────────────────────
  const rects = [];
  let rw = 720;
  for (let i = 0; i < 6; i++) {
    const rh = rw / PHI;
    const rx = (800 - rw) / 2;
    const ry = (800 - rh) / 2;
    rects.push(
      `<rect x="${rx.toFixed(2)}" y="${ry.toFixed(2)}" ` +
      `width="${rw.toFixed(2)}" height="${rh.toFixed(2)}" ` +
      `fill="none" stroke="${pal[4]}" stroke-width="0.7" opacity="0.07"/>`
    );
    rw /= PHI;
  }

  // ── Assemble SVG ─────────────────────────────────────────────────────────
  const svg = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">`,
    `  <title>${label}</title>`,
    `  <desc>phi=${PHI} | palette=${PAL_NAMES[palIdx]} | points=${N} | layers=${LY} | seed=0x${seedHex.slice(0,16)}...</desc>`,
    `  <!-- Background -->`,
    `  <rect width="800" height="800" fill="${pal[0]}"/>`,
    `  <!-- Phyllotaxis spiral (${circles.length} points, ${LY} layer${LY > 1 ? "s" : ""}) -->`,
    `  <g id="spiral">`,
    ...circles.map(c => `    ${c}`),
    `  </g>`,
    `  <!-- Golden rectangle overlay (6 levels) -->`,
    `  <g id="golden-rects">`,
    ...rects.map(r => `    ${r}`),
    `  </g>`,
    `</svg>`,
  ].join("\n");

  return { svg, palIdx, palName: PAL_NAMES[palIdx], N, LY, ds };
}

// ─── CLI ─────────────────────────────────────────────────────────────────────
const seedArg = process.argv[2] || randomSeedHex();
const outArg  = process.argv[3] || null;

// Validate seed (must be 64 hex chars)
const seedHex = seedArg.replace(/^0x/, "").padEnd(64, "0").slice(0, 64);

const { svg, palName, N, LY } = generateSVG(seedHex);

if (outArg) {
  const outPath = path.resolve(outArg);
  fs.writeFileSync(outPath, svg, "utf8");
  const size = (fs.statSync(outPath).size / 1024).toFixed(1);
  console.log(`✅ SVG saved → ${outPath} (${size} KB)`);
  console.log(`   Palette: ${palName} | Points: ${N} | Layers: ${LY}`);
  console.log(`   Seed: 0x${seedHex}`);
} else {
  process.stdout.write(svg + "\n");
}
