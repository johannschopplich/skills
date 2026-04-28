---
name: generate-tailwind-shades
description: Generates a Tailwind v4 OKLCH 50–950 palette anchored at shade 500 from a single hex or OKLCH brand color.
disable-model-invocation: true
---

# Generate Tailwind Shades

Generate a Tailwind-v4-style OKLCH 50–950 palette from one brand color, anchored exactly at shade 500. The lightness curve and chroma curve are derived from the mean of all 17 chromatic Tailwind palettes, so output stays consistent with Tailwind's defaults regardless of input hue.

## Workflow

### 1. Install culori (one-time, in a temp dir)

```bash
mkdir -p /tmp/tailwind-shades && cd /tmp/tailwind-shades && npm i culori --silent
```

### 2. Run the script

```bash
node /path/to/skill/scripts/generate.mjs '#4d6bdd'
```

Output is 11 lines of `--color-NN: oklch(L% C H); /* #hex */` ready to paste into a Tailwind v4 `@theme` block.

### 3. Apply

Paste into the target CSS. Use the variable name the user requested (e.g. `--color-brand-NN`, `--color-finanzfluss-NN`).

## How it works

The script embeds two 11-element arrays – the mean lightness curve and mean chroma curve across Tailwind's 17 chromatic palettes (red→rose, excluding neutrals). For an input `base`:

- **Lightness:** `L[i] = meanL[i] + bell(i) * (base.l - meanL[5])`. The cosine bell weights the offset to peak at index 5 and taper to zero at indices 0 and 10, so shade 50 stays near-white and shade 950 stays near-black regardless of input lightness.
- **Chroma:** `C[i] = meanC[i] * (base.c / meanC[5])`. Uniform multiplicative scale preserves the bell-shaped curve and respects input saturation.
- **Hue:** `H[i] = base.h` for every shade. Single hue across the palette is cleaner than mimicking Tailwind's per-palette hue drift, which doesn't generalize across hue families.
- **Anchor:** at index 5, output is exactly `base` (rounding loss only in the printed CSS).

Output rounding is `L:1` decimal, `C:3` decimals, `H:integer`. OKLCH stays unclamped in CSS to preserve P3 vibrancy on capable displays. Hex comments are gamut-mapped via `toGamut('rgb', 'oklch')` (CSS Color 4 binary search, preserves L and H).

## Rules

- The two embedded arrays are the formula. Don't bracket palettes by hue or vary the template at runtime – the cross-palette mean is the universal Tailwind shape.
- Always anchor at shade 500. The bell weighting and uniform scale require that anchor; shifting it to another shade breaks the model.
- Always emit OKLCH in CSS, hex only in a trailing comment.
