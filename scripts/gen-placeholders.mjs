// One-off generator for branded SVG placeholder art used by the landing page.
// Run: node scripts/gen-placeholders.mjs
// These are intentional, on-brand placeholders — replace the files in
// /public/images with real photography (same filenames) when available.
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "public", "images");
mkdirSync(OUT, { recursive: true });

const MAROON = "#7a1e2b";
const MAROON_DEEP = "#3a0d14";
const SILVER = "#c7cacc";
const GRAPHITE = "#17191b";
const INK = "#0a0b0c";

// A premium "plated meal" placeholder: dark cinematic surface, a metallic
// plate ring, a maroon accent wedge, brushed sheen and the dish label.
function meal({ w = 1200, h = 900, label, kicker = "Performance Meal" }) {
  const cx = w * 0.5;
  const cy = h * 0.46;
  const r = Math.min(w, h) * 0.32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label} placeholder">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GRAPHITE}"/>
      <stop offset="1" stop-color="${INK}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stop-color="${MAROON}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${MAROON}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="plate" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#eef0f1"/>
      <stop offset="0.5" stop-color="${SILVER}"/>
      <stop offset="1" stop-color="#8d9295"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <circle cx="${cx}" cy="${cy}" r="${r + 14}" fill="none" stroke="url(#plate)" stroke-width="10" opacity="0.9"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0f1113" stroke="${SILVER}" stroke-width="2" opacity="0.95"/>
  <path d="M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy} L ${cx} ${cy} Z" fill="${MAROON}" opacity="0.9"/>
  <path d="M ${cx} ${cy} L ${cx + r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy + r} Z" fill="${MAROON_DEEP}" opacity="0.85"/>
  <g opacity="0.4" stroke="#ffffff">
    <line x1="${cx - r * 0.5}" y1="${cy - r * 0.5}" x2="${cx + r * 0.5}" y2="${cy + r * 0.5}" stroke-width="1"/>
  </g>
  <text x="${cx}" y="${h - 96}" text-anchor="middle" fill="${SILVER}" font-family="Arial Narrow, Arial, sans-serif" font-size="26" letter-spacing="4" opacity="0.8">${kicker.toUpperCase()}</text>
  <text x="${cx}" y="${h - 46}" text-anchor="middle" fill="#ffffff" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="48" letter-spacing="1">${label}</text>
</svg>`;
}

// Hero composition — taller plate with a maroon diagonal panel.
function hero() {
  const w = 1400;
  const h = 1500;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Hero meal placeholder">
  <defs>
    <linearGradient id="hbg" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="${GRAPHITE}"/>
      <stop offset="1" stop-color="${INK}"/>
    </linearGradient>
    <radialGradient id="hglow" cx="0.6" cy="0.4" r="0.7">
      <stop offset="0" stop-color="${MAROON}" stop-opacity="0.6"/>
      <stop offset="1" stop-color="${MAROON}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hplate" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f2f4f5"/>
      <stop offset="0.5" stop-color="${SILVER}"/>
      <stop offset="1" stop-color="#868b8e"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#hbg)"/>
  <path d="M0 0 L ${w} 0 L ${w} ${h * 0.62} L 0 ${h * 0.82} Z" fill="${MAROON_DEEP}" opacity="0.55"/>
  <rect width="${w}" height="${h}" fill="url(#hglow)"/>
  <circle cx="${w * 0.5}" cy="${h * 0.46}" r="430" fill="none" stroke="url(#hplate)" stroke-width="14" opacity="0.92"/>
  <circle cx="${w * 0.5}" cy="${h * 0.46}" r="410" fill="#0f1113" stroke="${SILVER}" stroke-width="2"/>
  <path d="M ${w * 0.5} ${h * 0.46 - 410} A 410 410 0 0 1 ${w * 0.5 + 410} ${h * 0.46} L ${w * 0.5} ${h * 0.46} Z" fill="${MAROON}" opacity="0.92"/>
  <path d="M ${w * 0.5} ${h * 0.46} L ${w * 0.5 + 410} ${h * 0.46} A 410 410 0 0 1 ${w * 0.5} ${h * 0.46 + 410} Z" fill="${MAROON_DEEP}"/>
  <text x="${w * 0.5}" y="${h - 70}" text-anchor="middle" fill="#ffffff" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="60" letter-spacing="1">SIGNATURE PROTEIN BOWL</text>
</svg>`;
}

// Inside-gym pickup counter scene.
function gym() {
  const w = 1200;
  const h = 1000;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="In-gym restaurant counter placeholder">
  <defs>
    <linearGradient id="gbg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${GRAPHITE}"/>
      <stop offset="1" stop-color="${INK}"/>
    </linearGradient>
    <linearGradient id="counter" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${SILVER}"/>
      <stop offset="1" stop-color="#7e8285"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#gbg)"/>
  <rect x="0" y="${h * 0.62}" width="${w}" height="${h * 0.16}" fill="url(#counter)"/>
  <rect x="0" y="${h * 0.78}" width="${w}" height="${h * 0.22}" fill="#101214"/>
  <g fill="${MAROON}" opacity="0.85">
    <rect x="${w * 0.12}" y="${h * 0.3}" width="${w * 0.22}" height="${h * 0.28}" rx="14"/>
    <rect x="${w * 0.4}" y="${h * 0.24}" width="${w * 0.22}" height="${h * 0.34}" rx="14"/>
    <rect x="${w * 0.68}" y="${h * 0.32}" width="${w * 0.2}" height="${h * 0.26}" rx="14"/>
  </g>
  <g stroke="${SILVER}" stroke-width="3" opacity="0.5">
    <line x1="0" y1="${h * 0.2}" x2="${w}" y2="${h * 0.2}"/>
  </g>
  <text x="${w * 0.5}" y="${h - 60}" text-anchor="middle" fill="${SILVER}" font-family="Arial Narrow, Arial, sans-serif" font-weight="700" font-size="40" letter-spacing="3">IN-GYM PICKUP COUNTER</text>
</svg>`;
}

// Member avatar (testimonials).
function avatar(initials, accent = MAROON) {
  const s = 240;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" role="img" aria-label="Member avatar placeholder">
  <defs>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="${MAROON_DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${s}" height="${s}" fill="url(#a)"/>
  <circle cx="${s / 2}" cy="${s * 0.4}" r="${s * 0.18}" fill="#ffffff" opacity="0.92"/>
  <path d="M ${s * 0.18} ${s} C ${s * 0.18} ${s * 0.66}, ${s * 0.82} ${s * 0.66}, ${s * 0.82} ${s} Z" fill="#ffffff" opacity="0.92"/>
  <text x="${s / 2}" y="${s * 0.46}" text-anchor="middle" fill="${accent}" font-family="Arial, sans-serif" font-weight="700" font-size="64">${initials}</text>
</svg>`;
}

const files = {
  "hero-meal.svg": hero(),
  "meal-chicken.svg": meal({ label: "Grilled Chicken Fuel", kicker: "High Protein" }),
  "meal-salmon.svg": meal({ label: "Lemon Herb Salmon", kicker: "Omega Rich" }),
  "meal-steak.svg": meal({ label: "Steak Power Bowl", kicker: "Bulking" }),
  "meal-turkey.svg": meal({ label: "Turkey Macro Bowl", kicker: "Lean" }),
  "meal-smoothie.svg": meal({ label: "Recovery Smoothie", kicker: "Post-Workout" }),
  "meal-lowcarb.svg": meal({ label: "Low-Carb Bowl", kicker: "Cutting" }),
  "gym-counter.svg": gym(),
  "avatar-1.svg": avatar("MK"),
  "avatar-2.svg": avatar("SR", "#97303d"),
  "avatar-3.svg": avatar("DL", "#5a141d"),
};

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(OUT, name), svg.trim() + "\n");
  console.log("wrote", name);
}
console.log("Done. Placeholders in /public/images");
