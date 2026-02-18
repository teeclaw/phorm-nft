/**
 * Golden Ratio NFT — Bauhaus PNG Renderer
 * Usage: node scripts/render-png.js [seedHex] [outFile] [size]
 */

const { createCanvas } = require("canvas");
const fs   = require("fs");
const path = require("path");

const PHI    = 1.618033988749895;
const TWO_PI = Math.PI * 2;

// 8 Bauhaus palettes: [bg, primary, secondary, accent, ink]
const PALS = [
  ["#F8F7F0","#D62828","#1B4F72","#F39C12","#1A1A1A"],  // Classic Bauhaus
  ["#0D0D0D","#E63946","#F4D35E","#1A936F","#F5F5F5"],  // Dark Primary
  ["#F5F0E8","#2E4057","#C84B31","#048A81","#111111"],  // Weimar Earth
  ["#F5F5F5","#B80000","#111111","#999999","#E0E0E0"],  // Constructivist
  ["#FFF8E1","#1A1A1A","#C62828","#1565C0","#9E6B0A"],  // Ochre Primary
  ["#F7F7F7","#FF6B35","#004E98","#EEEEEE","#111111"],  // Warm Geometric
  ["#141414","#FFB703","#FB8500","#023047","#8ECAE6"],  // Night Bauhaus
  ["#E8E8E8","#212529","#C0392B","#2471A3","#6C757D"],  // Dessau Gray
];

const PAL_NAMES  = ["Classic Bauhaus","Dark Primary","Weimar Earth","Constructivist",
                    "Ochre Primary","Warm Geometric","Night Bauhaus","Dessau Gray"];
const COMP_NAMES = ["Circle Dominance","De Stijl Grid","Constructivist Diagonal","Nested Forms"];

function makeRng(seedHex) {
  let rs = BigInt("0x" + seedHex);
  return () => {
    rs = (rs * 6364136223846793005n + 1442695040888963407n) & 18446744073709551615n;
    return Number(rs & 4294967295n) / 4294967295;
  };
}

function randomSeedHex() {
  const buf = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) buf[i] = Math.floor(Math.random() * 256);
  return buf.toString("hex");
}

// Parse hex color to [r, g, b]
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function render(seedHex, size = 800) {
  const rnd = makeRng(seedHex);
  const sc  = size / 800;

  const pal  = PALS[Math.floor(rnd() * 8)];
  const COMP = Math.floor(rnd() * 4);
  const V1   = rnd(), V2 = rnd(), V3 = rnd(), V4 = rnd();

  const canvas = createCanvas(size, size);
  const cx     = canvas.getContext("2d");

  // ── Helpers ──────────────────────────────────────────────────────────────
  const S = n => Math.floor(n * sc); // scale to canvas size

  function bg(c)          { cx.fillStyle = c; cx.fillRect(0, 0, size, size); }
  function circ(x, y, r, fill, stroke, sw) {
    cx.beginPath(); cx.arc(S(x), S(y), S(r), 0, TWO_PI);
    if (fill)   { cx.fillStyle = fill; cx.fill(); }
    if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = S(sw || 2); cx.stroke(); }
  }
  function rct(x, y, w, h, fill, stroke, sw) {
    if (fill)   { cx.fillStyle = fill; cx.fillRect(S(x), S(y), S(w), S(h)); }
    if (stroke) { cx.strokeStyle = stroke; cx.lineWidth = S(sw || 2); cx.strokeRect(S(x), S(y), S(w), S(h)); }
  }
  function ln(x1, y1, x2, y2, c, w) {
    cx.beginPath(); cx.moveTo(S(x1), S(y1)); cx.lineTo(S(x2), S(y2));
    cx.strokeStyle = c; cx.lineWidth = S(w || 2); cx.stroke();
  }
  function tri(ax, ay, bx, by, ex, ey, fill) {
    cx.beginPath();
    cx.moveTo(S(ax), S(ay)); cx.lineTo(S(bx), S(by)); cx.lineTo(S(ex), S(ey));
    cx.closePath();
    if (fill) { cx.fillStyle = fill; cx.fill(); }
  }
  function phiLines() {
    const g1 = 800 / PHI, g2 = 800 - g1;
    ln(0, g2, 800, g2, pal[4], 1);
    ln(g1, 0, g1, 800, pal[4], 1);
  }

  // ── Composition 0: Circle Dominance ──────────────────────────────────────
  if (COMP === 0) {
    bg(pal[0]);
    const R  = Math.floor(250 + V1 * 50);
    const R2 = Math.floor(R / PHI);
    const R3 = Math.floor(R2 / PHI);
    const ox = Math.floor((V2 - 0.5) * 140);
    const oy = Math.floor((V3 - 0.5) * 100);

    circ(400 + ox, 400 + oy, R, pal[1]);
    circ(400 + ox + Math.floor(R * 0.55), 400 + oy - Math.floor(R2 * 0.35), R2, pal[2]);
    circ(400 + ox - Math.floor(R3 * 0.9), 400 + oy + Math.floor(R2 * 0.8), R3, pal[3]);
    circ(400, 400, Math.floor(R * PHI * 0.48), null, pal[4], 2);
    phiLines();
    ln(0, 400, 800, 400, pal[4], 1);
  }

  // ── Composition 1: De Stijl Grid ─────────────────────────────────────────
  else if (COMP === 1) {
    bg(pal[0]);
    const G1 = Math.floor(800 / PHI);  // ~494
    const G2 = 800 - G1;               // ~306
    const G3 = Math.floor(G2 / PHI);   // ~189
    const G4 = G2 - G3;                // ~117
    const G5 = Math.floor(G3 / PHI);   // inner

    rct(0, 0, G3, G3, pal[1]);
    rct(G1, 0, G2, G1, pal[2]);
    rct(0, G1, G3, G2, pal[3]);
    rct(G3, G1 - G4, G1 - G3, G4, pal[2]);
    rct(G1 + G5, G1 + G5, G4 - G5, G4 - G5, pal[3]);

    const gw = 5;
    ln(G3, 0, G3, 800, pal[4], gw);
    ln(G1, 0, G1, 800, pal[4], gw);
    ln(0, G3, 800, G3, pal[4], gw);
    ln(0, G1, 800, G1, pal[4], gw);
    ln(G3, G1 - G4, G1, G1 - G4, pal[4], gw);
    cx.strokeStyle = pal[4]; cx.lineWidth = S(gw); cx.strokeRect(0, 0, size, size);
  }

  // ── Composition 2: Constructivist Diagonal ────────────────────────────────
  else if (COMP === 2) {
    bg(pal[0]);
    const ang = [Math.PI / 6, Math.PI / 4, Math.PI / 3][Math.floor(V1 * 3)];

    cx.save(); cx.translate(size / 2, size / 2); cx.rotate(ang);
    cx.fillStyle = pal[1]; cx.fillRect(S(-55), S(-700), S(110), S(1400));
    cx.restore();

    cx.save(); cx.translate(size / 2, size / 2); cx.rotate(ang + Math.PI / 2);
    cx.fillStyle = pal[2]; cx.globalAlpha = 0.55;
    cx.fillRect(S(-28), S(-700), S(56), S(1400));
    cx.globalAlpha = 1; cx.restore();

    const R  = Math.floor(120 + V2 * 90);
    const cx2 = Math.floor(160 + V3 * 120);
    const cy2 = Math.floor(560 + V4 * 100);
    circ(cx2, cy2, R, pal[3]);
    circ(Math.floor(620 + V4 * 80), Math.floor(160 + V1 * 80), Math.floor(R / PHI), pal[1]);

    const tx = Math.floor(620 + V3 * 60);
    const ty = Math.floor(80 + V2 * 60);
    const ts = Math.floor(60 + V1 * 50);
    tri(tx, ty, tx + ts, ty + Math.floor(ts * PHI), tx - ts, ty + Math.floor(ts * PHI), pal[2]);

    ln(0, 800 / PHI, 800, 800 / PHI, pal[4], 3);
  }

  // ── Composition 3: Nested Forms ───────────────────────────────────────────
  else {
    bg(pal[0]);
    const useCircle = V1 > 0.5;
    let sz = 720, ci = 0;
    while (sz > 24) {
      const c  = pal[1 + (ci % (pal.length - 1))];
      const x  = (800 - sz) / 2;
      const y  = (800 - sz) / 2;
      const yo = useCircle ? 0 : Math.floor(ci * (8 + V2 * 12));
      if (useCircle) circ(400, 400, sz / 2, c);
      else           rct(x, y + yo, sz, sz - yo * 2, c);
      sz = Math.floor(sz / PHI);
      ci++;
    }
    circ(400, 400, Math.floor(12 + V3 * 16), pal[4]);
    phiLines();
  }

  return { canvas, palName: PAL_NAMES[PALS.indexOf(pal)], compName: COMP_NAMES[COMP] };
}

// ── CLI ───────────────────────────────────────────────────────────────────────
const seedArg = (process.argv[2] || "").replace(/^0x/, "") || randomSeedHex();
const outArg  = process.argv[3] || "output.png";
const sizeArg = parseInt(process.argv[4] || "800", 10);
const seedHex = seedArg.padEnd(64, "0").slice(0, 64);

console.log(`Seed:      0x${seedHex}`);
const { canvas, palName, compName } = render(seedHex, sizeArg);

const buf = canvas.toBuffer("image/png");
const out = path.resolve(outArg);
fs.writeFileSync(out, buf);
console.log(`Palette:   ${palName}`);
console.log(`Comp:      ${compName}`);
console.log(`Output:    ${out} (${(buf.length / 1024).toFixed(1)} KB)`);
