// Tailwind v4 OKLCH 50–950 palettes anchored exactly at shade 500, plus a comparison page.
//
// Usage: node generate.mjs <name=color | color>... [flags]
//   name=         With the color left empty, the 500 comes from --current (the name must match `--color-<name>-*`).
//   --current     Absolute path of the project's palette file (`@theme` CSS, UnoCSS `base.css`, or a `tokens.ts`
//                 `name = { 50: "…" }` object); shown as the first row of the page.
//   --ladder      tailwind (default): the neighbors' lightness ladder and hue offsets (kirby.tools, finanzfluss).
//                 even: the hand-made ladder of the earthy sites (johannschopplich.com, realtroll.de) – even steps
//                 from 97.2% down to a third of the 500's lightness, dark chroma proportional to L, hue constant.
//   --share       Re-tunes the 500's chroma to this share of the sRGB maximum at its L and H (0.6 earthy – 0.9).
//   --tints       Scales the chroma of 50–400; 0.8 = milder tints.
//   --hue         tailwind ladder: scales the neighbors' hue offsets; 0 = constant hue, 0.5 = half the drift.
//   --drift       even ladder: hue shift in degrees reached at 950, spread over the dark half.
//   --contrast    Darkens the 600 until white text on it reaches this ratio; 700–900 re-space below it.
//
// Model: per-hue curves blended from the two Tailwind palettes nearest in hue, read from `tailwindcss/theme.css`.
// - Lightness: tints sit between the 50 and the anchor, darks between the anchor and the 950, at the ladder's
//   relative positions, so the ramp stretches instead of collapsing for dark or light inputs.
// - Chroma: the anchor's chroma times the neighbors' C/C500 curve, tints capped at the 500's chroma
//   (even ladder's darks: proportional to L), clamped to sRGB with L and H preserved.
// - Hue: the anchor's hue plus the neighbors' per-shade offset (tailwind); constant plus --drift (even).

import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { clampChroma, converter, displayable, formatHex, wcagContrast } from "culori";

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
/** Even ladder: each shade's share of the way from the 50 to the 500, or from the 500 down to the floor. */
const EVEN_LADDER = { l50: 0.972, 50: 0, 100: 0.085, 200: 0.23, 300: 0.435, 400: 0.71, 600: 0.25, 700: 0.45, 800: 0.64, 900: 0.8, 950: 1 };
const STONE_950 = "oklch(14.7% 0.004 49.25)";
const toOklch = converter("oklch");

// #region CLI
const USAGE = "Usage: generate.mjs <name=color | color>... [--current <file>] [--ladder tailwind|even] [--share <0–1>] [--tints <factor>] [--hue <factor>] [--drift <deg>] [--contrast <ratio>]";
const args = process.argv.slice(2);
const flags = {};
const inputs = [];
for (let index = 0; index < args.length; index++) {
  if (args[index].startsWith("--")) flags[args[index].slice(2)] = args[++index];
  else inputs.push(args[index]);
}
const options = {
  ladder: flags.ladder ?? "tailwind",
  tints: Number(flags.tints ?? 1),
  hue: Number(flags.hue ?? 1),
  drift: Number(flags.drift ?? 0),
  contrast: flags.contrast ? Number(flags.contrast) : null,
};
const targetShare = flags.share ? Number(flags.share) : null;
const fail = (message) => {
  console.error(message);
  process.exit(1);
};
if (!inputs.length || !["tailwind", "even"].includes(options.ladder)) fail(USAGE);
if (flags.drift && options.ladder !== "even") fail("--drift only applies to --ladder even; the tailwind ladder takes its hue from the neighbors (scale it with --hue).");
if (flags.hue && options.ladder === "even") fail("--hue only applies to --ladder tailwind; the even ladder keeps the hue constant (add --drift for dark greens).");
const currentSource = flags.current ? readFileSync(flags.current, "utf8") : "";
// #endregion

// #region Tailwind curves
const require = createRequire(import.meta.url);
const tailwind = parsePalettes(readFileSync(require.resolve("tailwindcss/theme.css"), "utf8"));
const chromaticByHue = Object.entries(tailwind)
  .filter(([, palette]) => palette[500].c > 0.1)
  .map(([name, palette]) => ({ name, hue: palette[500].h }))
  .sort((a, b) => a.hue - b.hue);

function parsePalettes(css) {
  const palettes = {};
  for (const [, name, shade, value] of css.matchAll(/--color-([a-z]+)-(\d+):\s*(oklch\([^)]*\))/g))
    (palettes[name] ??= {})[shade] = { h: 0, ...toOklch(value) };
  return palettes;
}

/** Finds the two chromatic Tailwind palettes around a hue and the hue's position between them. */
function neighbors(hue) {
  for (let index = 0; index < chromaticByHue.length; index++) {
    const a = chromaticByHue[index];
    const b = chromaticByHue[(index + 1) % chromaticByHue.length];
    const span = (b.hue - a.hue + 360) % 360 || 360;
    const offset = (hue - a.hue + 360) % 360;
    if (offset <= span) return { a: a.name, b: b.name, t: offset / span };
  }
}

const hueDelta = (from, to) => ((to - from + 540) % 360) - 180;

/** Blends the neighbors' curves: each shade's relative L position within its half, C/C500 and hue offset. */
function neighborCurve(hue) {
  const { a, b, t } = neighbors(hue);
  const mix = (read) => read(tailwind[a]) * (1 - t) + read(tailwind[b]) * t;
  const shades = {};
  for (const shade of SHADES) {
    shades[shade] = {
      position: mix((palette) => shade < 500
        ? (palette[50].l - palette[shade].l) / (palette[50].l - palette[500].l)
        : (palette[500].l - palette[shade].l) / (palette[500].l - palette[950].l)),
      chromaRatio: mix((palette) => palette[shade].c / palette[500].c),
      hueOffset: mix((palette) => hueDelta(palette[500].h, palette[shade].h)),
    };
  }
  return { shades, l50: mix((palette) => palette[50].l), l950: mix((palette) => palette[950].l), nearest: t < 0.5 ? a : b };
}
// #endregion

// #region Generator
/** Largest chroma still inside sRGB at the given lightness and hue. */
function gamutMaxChroma(l, h) {
  let low = 0, high = 0.5;
  for (let step = 0; step < 30; step++) {
    const middle = (low + high) / 2;
    if (displayable({ mode: "oklch", l, c: middle, h })) low = middle;
    else high = middle;
  }
  return low;
}

function generate(anchor, { ladder, tints = 1, hue = 1, drift = 0, contrast = null }) {
  const curve = neighborCurve(anchor.h);
  const isEven = ladder === "even";
  const l50 = isEven ? EVEN_LADDER.l50 : curve.l50;
  const floor = isEven ? anchor.l / 3 : curve.l950;
  const positionOf = (shade) => isEven ? EVEN_LADDER[shade] : curve.shades[shade].position;

  const shadeAt = (shade, position) => {
    const isDark = shade > 500;
    const l = isDark ? anchor.l - position * (anchor.l - floor) : l50 - position * (l50 - anchor.l);
    const ratio = curve.shades[shade].chromaRatio;
    const c = isDark
      ? (isEven ? anchor.c * (l / anchor.l) : anchor.c * ratio)
      : anchor.c * Math.min(ratio, 1) * tints;
    const h = anchor.h + (isEven ? (isDark ? drift * position : 0) : hue * curve.shades[shade].hueOffset);
    return clampChroma({ mode: "oklch", l, c, h }, "oklch");
  };

  // --contrast: move the 600 down until white text reaches the ratio, then re-space 700–900 between it and the floor.
  const p600 = positionOf(600);
  let p600Target = p600;
  if (contrast) {
    while (p600Target < 0.99 && wcagContrast("#fff", hex(shadeAt(600, p600Target))) < contrast) p600Target += 0.005;
  }
  const darkPosition = (shade) => p600Target + (positionOf(shade) - p600) * (1 - p600Target) / (1 - p600);

  const palette = {};
  for (const shade of SHADES) {
    if (shade === 500) palette[shade] = anchor;
    else palette[shade] = shadeAt(shade, shade > 500 ? darkPosition(shade) : positionOf(shade));
  }
  return palette;
}

const gamutShare = (color) => color.c / gamutMaxChroma(color.l, color.h);
const hex = (color) => formatHex(clampChroma(color, "oklch"));
const trim = (number, digits) => String(+number.toFixed(digits));
const formatOklch = (color) => `oklch(${trim(color.l * 100, 1)}% ${trim(color.c, 3)} ${trim(((color.h % 360) + 360) % 360, 1)})`;
const onWhite = (palette, shade) => wcagContrast("#fff", hex(palette[shade]));

function metrics(palette) {
  const darkLink = wcagContrast(hex(palette[400]), STONE_950).toFixed(1);
  return `share ${gamutShare(palette[500]).toFixed(2)} · white/500 ${onWhite(palette, 500).toFixed(1)} · white/600 ${onWhite(palette, 600).toFixed(1)} · white/700 ${onWhite(palette, 700).toFixed(1)} · 400/stone-950 ${darkLink} · 500 ${hex(palette[500])}`;
}
// #endregion

// #region Current palette
function readCurrent(name) {
  const palette = {};
  for (const [, shade, value] of currentSource.matchAll(new RegExp(`--[\\w-]*\\b${name}-(\\d+)\\s*:\\s*([^;]+);`, "g")))
    palette[shade] = toOklch(value.trim());
  const objectBody = currentSource.match(new RegExp(`\\b${name}\\s*[:=]\\s*\\{([^}]*)\\}`))?.[1];
  for (const [, shade, value] of objectBody?.matchAll(/(\d+)\s*:\s*["'`]([^"'`]+)["'`]/g) ?? [])
    palette[shade] = toOklch(value);
  return SHADES.every((shade) => palette[shade]) ? palette : null;
}
// #endregion

// #region Run
const sections = [];
for (const input of inputs) {
  const [name, value] = input.includes("=") ? input.split("=") : ["brand", input];
  const currentPalette = currentSource ? readCurrent(name) : null;
  const parsedColor = value ? toOklch(value) : currentPalette?.[500];
  if (!parsedColor) {
    fail(value
      ? `Can't parse "${value}" as a CSS color.`
      : flags.current
        ? `No ${name}-50 … ${name}-950 in ${flags.current}; the name must match the file's \`--color-<name>-*\` or \`<name> = {…}\`.`
        : `"${name}=" without a color needs --current <file>.`);
  }
  const inputAnchor = { mode: "oklch", l: parsedColor.l, c: parsedColor.c, h: parsedColor.h ?? 0 };
  const anchor = targetShare ? { ...inputAnchor, c: targetShare * gamutMaxChroma(inputAnchor.l, inputAnchor.h) } : inputAnchor;

  const palette = generate(anchor, options);
  console.log(`--color-${name}: ${formatOklch(palette[500])};`);
  for (const shade of SHADES) console.log(`--color-${name}-${shade}: ${formatOklch(palette[shade])};`);
  console.log(`/* ${metrics(palette)} */`);
  if (gamutShare(anchor) > 1) console.log(`/* ${name}-500 lies outside sRGB (share ${gamutShare(anchor).toFixed(2)}): neon; try --share 0.9. */`);
  if (anchor.l > 0.9 || anchor.l < 0.35) console.log(`/* ${name}-500 at L ${trim(anchor.l * 100, 1)}% is far from a 500; tints or darks get cramped. */`);
  if (onWhite(palette, 500) < 3) console.log(`/* White text on ${name}-500 is below 3:1: light hue – buttons take dark text; keep the 500. */`);
  if (onWhite(palette, 600) < 4.5 && !options.contrast) {
    const textShade = SHADES.find((shade) => shade > 500 && onWhite(palette, shade) >= 4.5);
    console.log(`/* White text on ${name}-600 is below 4.5:1: set text on white in ${textShade}, or re-run with --contrast 4.5. */`);
  }
  console.log();

  const otherLadder = options.ladder === "even" ? "tailwind" : "even";
  const nearestTailwind = neighborCurve(anchor.h).nearest;
  const chosenFlags = [`--ladder ${options.ladder}`, ...["share", "tints", "hue", "drift", "contrast"].filter((flag) => flags[flag]).map((flag) => `--${flag} ${flags[flag]}`)].join(" ");
  sections.push({
    name,
    rows: [
      currentPalette && ["Current", currentPalette],
      targetShare && [`Input 500 (share ${gamutShare(inputAnchor).toFixed(2)})`, generate(inputAnchor, options)],
      [chosenFlags, palette],
      [`--ladder ${otherLadder}`, generate(anchor, { ladder: otherLadder })],
      [`Tailwind ${nearestTailwind}`, tailwind[nearestTailwind]],
    ].filter(Boolean),
  });
}
// #endregion

// #region Comparison page
const shadeVariables = (palette) => SHADES.map((shade) => `--c-${shade}: ${formatOklch(palette[shade])}`).join("; ");
const renderRow = ([label, palette]) => `
<div class="row" style="${shadeVariables(palette)}">
  <div class="label"><b>${label}</b><small>${metrics(palette)}</small></div>
  <div class="swatches">${SHADES.map((shade) => `<div style="background: var(--c-${shade})" title="${shade} ${formatOklch(palette[shade])} ${hex(palette[shade])}">${shade}</div>`).join("")}</div>
  <div class="ui light"><button>Solid 500</button><span class="soft">Soft 100</span><a>Link 600</a><span class="subtle">Subtle 50/200</span></div>
  <div class="ui dark"><button>Solid 400</button><span class="soft">Soft 950</span><a>Link 400</a><span class="subtle">Subtle 900/800</span></div>
</div>`;

const html = `<!doctype html><meta charset="utf-8"><title>Palette comparison</title>
<style>
  body { margin: 2rem; font: 14px/1.5 system-ui, sans-serif; color: #1c1917; }
  h2 { margin: 2.5rem 0 .5rem; }
  .row { display: grid; grid-template-columns: 16rem 1fr 1fr; gap: .5rem 1rem; align-items: center; padding: .75rem 0; border-top: 1px solid #e7e5e4; }
  .label small { display: block; color: #78716c; font-size: 12px; }
  .swatches { grid-column: 2 / 4; display: flex; gap: 2px; }
  .swatches div { flex: 1; height: 3rem; padding: 2px 4px; font-size: 10px; color: var(--c-950); }
  .swatches div:nth-child(n+6) { color: var(--c-50); }
  .ui { display: flex; gap: .75rem; align-items: center; padding: .75rem; }
  .ui.light { grid-column: 2; background: #fff; }
  .ui.dark { grid-column: 3; background: ${STONE_950}; color: #e7e5e4; }
  button, .soft, .subtle { font: inherit; border: 0; padding: .35rem .75rem; border-radius: .375rem; }
  a { text-decoration: underline; text-underline-offset: 3px; }
  .light button { background: var(--c-500); color: #fff; }
  .light .soft { background: var(--c-100); color: var(--c-700); }
  .light a { color: var(--c-600); }
  .light .subtle { background: var(--c-50); color: var(--c-800); outline: 1px solid var(--c-200); }
  .dark button { background: var(--c-400); color: ${STONE_950}; }
  .dark .soft { background: var(--c-950); color: var(--c-300); }
  .dark a { color: var(--c-400); }
  .dark .subtle { background: var(--c-900); color: var(--c-200); outline: 1px solid var(--c-800); }
</style>
${sections.map((section) => `<h2>${section.name}</h2>${section.rows.map(renderRow).join("")}`).join("")}`;

const pagePath = new URL("palette.html", import.meta.url).pathname;
writeFileSync(pagePath, html);
console.log(`Comparison page: ${pagePath}`);
// #endregion
