---
name: generate-tailwind-shades
description: Generates a Tailwind v4 OKLCH 50–950 palette anchored at shade 500 from a single brand color in any CSS syntax.
argument-hint: "<css color> [name]"
disable-model-invocation: true
---

# Generate Tailwind Shades

Generate a Tailwind-v4-style OKLCH 50–950 palette from one brand color, anchored exactly at shade 500.

## Workflow

1. **Set up** – Node resolves `culori` from the script's folder, so the script runs from beside its install; `/tmp` clears on reboot:

   ```bash
   mkdir -p /tmp/tailwind-shades && cd /tmp/tailwind-shades
   [ -d node_modules/culori ] || npm i culori --silent
   cp "<this skill's directory>/scripts/generate.mjs" .
   ```

2. **Run** with the color in any CSS syntax (`'#4d6bdd'`, `'oklch(62% 0.19 264)'`):

   ```bash
   node /tmp/tailwind-shades/generate.mjs '#4d6bdd'
   ```

   It prints 11 lines of `--color-NN: oklch(L% C H); /* #hex */`.

3. **Apply** – rename `--color-NN` to `--color-<name>-NN` with the name the user gave (ask if none), and paste into the target CSS's `@theme` block.

## Rules

- Run the script unchanged: its two arrays, the mean curves of Tailwind's 17 chromatic palettes, are the whole model.
- The input color is always shade 500. If the user wants it at another shade, say the palette anchors at 500 and generate it that way.
- Keep OKLCH as the CSS value and hex only in the trailing comment, so P3 displays keep full chroma.
