---
name: generate-tailwind-shades
description: Generates or re-tunes Tailwind v4 OKLCH 50–950 palettes anchored at shade 500, with a comparison page against the current palette and the nearest Tailwind palette.
argument-hint: "<css color | name=color>... [--ladder even] [--share 0.9] [--tints 0.8]"
disable-model-invocation: true
---

# Generate Tailwind Shades

## Workflow

1. **Set up** – `culori` and `tailwindcss` resolve from the script's folder, so call it by absolute path:

   ```bash
   mkdir -p /tmp/tailwind-shades && cd /tmp/tailwind-shades
   npm i culori tailwindcss@latest --silent
   cp "<this skill's directory>/scripts/generate.mjs" .
   ```

2. **Run** once with every palette of the job. New colors go in as `name='#4d6bdd'`. For existing ones leave the color empty and pass `--current <absolute path of the project's @theme, base.css or tokens.ts>`: the 500 is read from it, and the name must match `--color-<name>-*`, `--un-color-<name>-*` or `<name> = {…}`. Pass `--share` only to move the 500 into the band below; wishes the user already stated go into this first run.

   ```bash
   node /tmp/tailwind-shades/generate.mjs orchid= danube= --current ~/Projects/kirby.tools/app/assets/css/main.css --share 0.9
   node /tmp/tailwind-shades/generate.mjs primary= secondary= --current ~/Projects/johannschopplich.com/src/tokens.ts --ladder even
   ```

3. **Review** – `open /tmp/tailwind-shades/palette.html` (headless: report the path). Judge candidates against the Current row: a shipped ramp changes only on explicit request. Prune candidate inputs, since every extra row makes judging harder.

4. **Bend** – map the user's words to flags, then re-run once:

   | Wish | Flags |
   |---|---|
   | erdig, earthy, "nicht so poppy" | `--ladder even --tints 0.8 --share 0.6`–`0.7` |
   | milder tints ("helle Töne mild") | `--tints 0.8` |
   | neon, knallig | `--share 0.9` or lower |
   | matschig, too close to gray | raise `--share`; dark greens: `--ladder even --drift 12` |
   | tints too yellow, keep the 500's character | `--hue 0.5` (tailwind) or `--ladder even`; no `--share` |
   | more contrast on 600, weak links | `--contrast 4.5` |
   | warmer, cooler, lighter 500 | extra candidate `name-warm=oklch(…)` with H or L moved; never silently |

5. **Apply** in the project's format; keep the DEFAULT alias line. johannschopplich.com derives hex at build time, so write only OKLCH. kirby.tools: also update the 500 in `THEME_COLORS` (`shared/theme.ts`, l/c/h plus hex); `test/theme-color.test.ts` guards it.

6. **Propagate** – grep sibling repos (hub, byjohann.link), favicon, OG images and avatar SVGs for the old 500 hex.

## Decisions

- **Ladder** – `tailwind` for product colors (kirby.tools, finanzfluss): L, chroma and hue offsets of the two nearest Tailwind palettes. `even` for the earthy sites (johannschopplich.com, realtroll.de): even steps, darker bottom, constant hue.
- **Chroma share** of the sRGB maximum at the 500: 0.6 earthy to 0.9; 0.99 tolerated for one loud primary. Above 1.0 is the neon he rejects.
- **Contrast** – the script flags white/500 < 3 and white/600 < 4.5; for light hues (lima), keep the 500 and set text on white in 700.
- **Neutrals** – never generated: copy a named Tailwind neutral verbatim (stone, mist, olive), picked by contrast.
