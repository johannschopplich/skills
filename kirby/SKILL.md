---
name: kirby
description: Kirby source clones, Kirby 5 vs 6, the plugin playgrounds and UnoCSS, and the kirby.tools docs a release waits on. Use when working in a Kirby CMS plugin, Kirby core, a Kirby site, or the kirby.tools repos.
---

# Kirby

Check every claim about Kirby – a prop, a default, a CSS rule, a PHP signature, a "since" version – against the source, never from memory.

## Source

Pull the clone in `/tmp`, or clone it there shallow from `https://github.com/getkirby/kirby`:

| Clone | Kirby | Panel |
|---|---|---|
| `/tmp/kirby` | 5, `main` | Vue 2.7 |
| `/tmp/kirby-v6` | 6, `v6/develop` | Vue 3, TypeScript |

- **Panel** – a project's `vendor/getkirby/cms` has the PHP `src/` but only `panel/dist`: read the Panel from a clone's `panel/src/`.
- **Shallow** – a "since" version needs the tag or the full history; the shallow clone gives wrong answers.
- **Pinned ref** – `kirby.tools/layers/kirby-panel/kirby/` holds the Kirby 6 source at the commit its `kirby.json` pins (`pnpm kirby-panel:fetch`): read it for work on that layer.
- **Kirby 6** – `~/Projects/MIGRATION-K6.md` tracks what waits for it across plugins, licensing, and site. Read it before a Vue 3 or Kirby 6 change; record new items there.
- **Kirby 4** – supported as is until Kirby 6 ships: new guards, tests, and options target Kirby 5 and 6 only.

## Helper Packages

- **kirby-types** – `~/Projects/kirby-types`, types for `window.panel` and headless use. Panel type audits: its user-invoked `/audit-panel-types` skill.
- **kirbyuse** – `~/Projects/kirbyuse`, Panel composables (`usePanel`, `useApi`, `useDialog`, …), typed by kirby-types.
- **kirbyup** – `~/Projects/kirbyup`, the plugins' build tool.

Kirby 6 work sits on each package's `feat/kirby-6` (kirbyup: `feat/vue-3`). A change across them releases in order: kirby-types, kirbyuse, then kirbyup or the plugin.

## Gotchas

- **`panel.api` resets the loader** – `api.request()` sets `panel.isLoading = false` when its last request ends, `silent` or not (`panel/src/api/index.js`, K6 `index.ts`). A run mixing `panel.api` calls with long local work shows its own loading state.
- **Runtime markup** – the Panel adds classes no `.vue` file holds (`k-text` on the writer's ProseMirror node, from `Editor`). Props and defaults come from the source; markup and computed styles from a running Panel: a playground for Kirby 5, [kirby-6-panel.md](kirby-6-panel.md) for Kirby 6.

## Plugins

- **Playground** – runs on the Kirby 5 in `vendor/`. Before a [smoke test](panel-smoke.md), `pnpm build` in place – no asking, `index.js` stays uncommitted – and name the commit it was built from. A leftover `index.dev.mjs` wins over `index.js`. A playground-only feature (`__PLAYGROUND__`, a build-time constant) takes `pnpm build:playground`.
- **Shared files** – the `kirby-*` plugins share `.gitignore`, `.gitattributes`, `tsconfig.json`, and `playground/site/plugins/playground/`, shaped after `kirby-copilot`; the ones with Panel tests share `tests/panel/helpers/mock-kirbyuse.ts` byte for byte. Change every sibling or none; never prune a line one repo doesn't use.
- **UnoCSS** – `presetWind3` with a prefix per plugin (`uno.config.ts`: `kai-`, `kct-`, `ksr-`, …). Kirby tokens take the bracket form, `kai-mt-[var(--spacing-4)]`; Tailwind v4's `mt-(--spacing-4)` generates nothing. Sibling spacing is `[&>*+*]:kai-mt-[var(--spacing-N)]`, never `space-y-*` – Wind3 and the Tailwind v4 mocks in kirby.tools compile it differently.

## Docs

The Kirby Tools plugins document in `~/Projects/kirby.tools`: `content/1.docs/<n>.<product>/`, the website changelog in `content/<n>.<product>/changelog/`, the agent skill in `server/assets/skills/kirby-<product>/SKILL.md`. A feature or release is done once its docs edit is there. Read `kirby.tools/.claude/skills/kirby-tools-content/SKILL.md` before writing.

- **Editor-first** – keep the gotcha a reader trips over; drop implementation detail an editor never meets.
- **One Kirby version** – the docs describe the current major the plugins support, Kirby 5 until they move to 6, without naming it; no other major or minor version appears, not even as a caveat for a feature Kirby 4 lacks.
- **Changelog** – what an editor notices in the Panel; changelogithub writes the technical one on GitHub.
