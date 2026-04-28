import { converter, formatHex, toGamut } from 'culori';

const L = [0.9772, 0.9504, 0.9055, 0.8405, 0.7535, 0.6827, 0.5978, 0.5149, 0.4461, 0.3946, 0.2779];
const C = [0.0177, 0.0416, 0.0802, 0.1347, 0.1894, 0.2141, 0.2129, 0.1874, 0.1545, 0.1238, 0.0877];
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const base = converter('oklch')(process.argv[2]);
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
