---
name: kirby
description: Kirby source clones, Kirby 5 vs 6, the plugin playgrounds, and UnoCSS. Use when working in a Kirby CMS plugin, Kirby core, a Kirby site, the helper packages (kirby-types, kirbyuse, kirbyup), or the kirby.tools repos.
---

# Kirby

Check every claim about Kirby – a prop, a default, a CSS rule, a PHP signature, a "since" version – against the source, never from memory.

## Source

Refresh the clone in `/tmp`, or clone it there shallow from `https://github.com/getkirby/kirby`:

| Clone | Kirby | Ref | Panel |
|---|---|---|---|
| `/tmp/kirby` | 6 | `main` | Vue 3, TypeScript |
| `/tmp/kirby-v5` | 5 | the newest stable `5.*` tag | Vue 2.7 |

- **Panel** – a project's `vendor/getkirby/cms` has the PHP `src/` but only `panel/dist`: read the Panel from a clone's `panel/src/`.
- **Shallow** – a "since" version needs the tag or the full history.
- **Pinned ref** – `kirby.tools/layers/kirby-panel/kirby/` holds the Kirby source at the commit its `kirby.json` pins (`pnpm kirby-panel:fetch`): read it for work on that layer.

## Helper Packages

- **kirby-types** – `~/Projects/kirby-types`, types for `window.panel` and headless use. Type audits, KQL included: its user-invoked `/audit-types` skill.
- **kirbyuse** – `~/Projects/kirbyuse`, Panel composables (`usePanel`, `useApi`, `useDialog`, …), typed by kirby-types.
- **kirbyup** – `~/Projects/kirbyup`, the plugins' build tool.

They follow the plugins' [lines](#plugins). A change across them releases in order: kirby-types, kirbyuse, then kirbyup or the plugin.

## Gotchas

- **`panel.api` resets the loader** – `api.request()` sets `panel.isLoading = false` when its last request ends, `silent` or not (`panel/src/api/index.ts`, Kirby 5 `index.js`). A run mixing `panel.api` calls with long local work shows its own loading state.
- **Runtime markup** – the Panel adds classes no `.vue` file holds (`k-text` on the writer's ProseMirror node, from `Editor`). Props and defaults come from the source; markup and computed styles from a playground's running Panel.
- **Site content** – in a site with `scripts/sync-content.sh`, web holds the content: `--download --apply` before a content edit, `--upload --apply` after.

## Plugins

- **Roadmap** – `~/Projects/kirby-tools-roadmap.md` holds the open work across plugins, licensing, paywall and site. Read it before work on a plugin; record new items there.
- **Lines** – a plugin's `main` is the Kirby 6 line, where every new feature lands. The Kirby 4 and 5 line sits on its version branch (`v3`, `v2`, …) and takes fixes only; Kirby 4 must not break there. A security or critical bug in both lines is fixed on each, any other bug once a user of that line reports it. The PHP-only plugins (Helpers, Locked Pages, kirbylog, Algolia DocSearch, Headless) serve Kirby 5 and 6 from `main`.
- **Playground** – runs on its line's Kirby in `vendor/`. Before a [smoke test](panel-smoke.md), `pnpm build` in place – no asking, `index.js` stays uncommitted – and name the commit it was built from. A leftover `index.dev.mjs` wins over `index.js`. A playground-only feature (`__PLAYGROUND__`, a build-time constant) takes `pnpm build:playground`.
- **Shared files** – the `kirby-*` plugins share `.gitignore`, `.gitattributes`, `tsconfig.json`, and `playground/site/plugins/playground/`, shaped after `kirby-copilot`; the ones whose tests import `tests/panel/helpers/mock-kirbyuse.ts` share it byte for byte. Each line shares them across repos: `main` with the other `main`s, a version branch with the other version branches. Change every sibling or none; never prune a line one repo doesn't use.
- **UnoCSS** – `presetWind3` with a prefix per plugin (`uno.config.ts`: `kai-`, `kct-`, `ksr-`, …). Kirby tokens take the bracket form, `kai-mt-[var(--spacing-4)]`; Tailwind v4's `mt-(--spacing-4)` generates nothing. Sibling spacing is `[&>*+*]:kai-mt-[var(--spacing-N)]`, never `space-y-*` – Wind3 and the Tailwind v4 mocks in kirby.tools compile it differently.

## Docs

The Kirby Tools plugins document in `~/Projects/kirby.tools`: `content/1.docs/<n>.<product>/`, the website changelog in `content/<n>.<product>/changelog/`, the agent skill in `server/assets/skills/kirby-<product>/SKILL.md`. A feature or release is done once its docs edit is there. Read `kirby.tools/.claude/skills/kirby-tools-content/SKILL.md` before writing.

- **Editor-first** – keep the gotcha a reader trips over; drop implementation detail an editor never meets.
- **One Kirby version** – the docs describe Kirby 6 without naming it. No other major or minor version appears, not even as a caveat for a feature Kirby 5 lacks.
