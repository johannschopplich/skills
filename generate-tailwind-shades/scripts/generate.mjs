// Tailwind v4 OKLCH 50–950 palette from one color, anchored exactly at shade 500.
// L and C are the mean lightness and chroma curves of Tailwind's 17 chromatic palettes (red→rose).
// - Lightness: L[i] + bell(i) * (base.l - L[5]); the cosine bell peaks at 500 and tapers to 0 at 50 and 950,
//   so the ends stay near-white and near-black whatever the input lightness.
// - Chroma: C[i] * (base.c / C[5]); a uniform scale keeps the curve's shape and the input's saturation.
// - Hue: base.h for every shade; Tailwind's per-palette hue drift does not generalize across hues.
// Printed as L 1 decimal, C 3 decimals, H integer, the only loss at the anchor; OKLCH stays unclamped
// for P3 displays, and the hex comment is gamut-mapped with toGamut('rgb', 'oklch') (CSS Color 4 binary
// search, preserves L and H).

import { converter, formatHex, toGamut } from 'culori';

const L = [0.9772, 0.9504, 0.9055, 0.8405, 0.7535, 0.6827, 0.5978, 0.5149, 0.4461, 0.3946, 0.2779];
const C = [0.0177, 0.0416, 0.0802, 0.1347, 0.1894, 0.2141, 0.2129, 0.1874, 0.1545, 0.1238, 0.0877];
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const base = converter('oklch')(process.argv[2]);
if (!base) { console.error('Usage: generate.mjs <css color>'); process.exit(1); }
base.h ??= 0;
const fit = toGamut('rgb', 'oklch');
const lOff = base.l - L[5];
const cScale = base.c / C[5];
const bell = (i) => 0.5 * (1 + Math.cos(Math.PI * (i - 5) / 5));

for (let i = 0; i < SHADES.length; i++) {
  const color = i === 5 ? base : {
    mode: 'oklch',
    l: Math.max(0, Math.min(1, L[i] + bell(i) * lOff)),
    c: Math.max(0, C[i] * cScale),
    h: base.h,
  };
  const lPct = (color.l * 100).toFixed(1);
  const cVal = color.c.toFixed(3);
  const hVal = Math.round(((color.h % 360) + 360) % 360);
  const rounded = { mode: 'oklch', l: Math.round(color.l * 1000) / 1000, c: Math.round(color.c * 1000) / 1000, h: hVal };
  console.log(`--color-${SHADES[i]}: oklch(${lPct}% ${cVal} ${hVal}); /* ${formatHex(fit(rounded))} */`);
}
