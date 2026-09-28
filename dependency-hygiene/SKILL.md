---
name: dependency-hygiene
description: Sweep the safe dependency drift and land deliberate bumps or migrations cleanly – breaking changes handled against the installed source, every check green, staged behind one grill-ready brief.
argument-hint: "nothing (sweep the drift), a range (patch|minor|major), or a dep + version to land (e.g. eslint 9)"
disable-model-invocation: true
---

# Dependency Hygiene

**Two altitudes.** A **routine sweep** applies every within-major bump as one batch and *lists* the majors it found. A **deep landing** – a named target or an opted-in major – assesses breaking changes against the installed source and migrates call sites.

**Invoke the `push-right` skill first.** Irreversible here: **push** and **open the MR**. Hard failure: a registry taze can't reach.

## Boundary Marker

The **workspace is the state**: version source, lockfile, `node_modules`, and unpushed commits. Each run re-discovers the sweep's target via taze; a named target stays fixed.

- Upstream moved (new releases, a teammate's catalog bump on the base) → an unpushed safe bump is **re-derived at the newer latest-allowed, not rebased** (a lockfile doesn't rebase cleanly; an exception to push-right's Boundary Marker); skip it when the diff is identical. Fresh drift folds in; open decisions re-present.
- At latest-allowed as of this run, checks green, no open decisions → closed. Later drift is the next invocation's work.

## Run – in Order

1. **Discover the practice.** Version source (`package.json`, pnpm `catalog`), package manager, `overrides`, `patchedDependencies`, pinning convention, renovate/dependabot config – fresh per repo. The `*Exclude` lists of `trustPolicy` and `minimumReleaseAge` are **pre-vetted**, never re-surfaced as decisions.
2. **Discover the drift – taze, read-only.** Via the repo's runner (`pnpm dlx`, `npx`, `bunx`). One flag set `<flags>` for every call, reads and writes: `-r --no-github-actions --no-node-version`, plus `-l` when the repo pins exact versions (taze skips exact pins without it). taze applies the maturity policy itself (`minimumReleaseAge` and `minimumReleaseAgeExclude` from `pnpm-workspace.yaml`, `npmMinimalAgeGate` and `npmPreapprovedPackages` from `.yarnrc.yml`); add `--maturity-period <days>` and `--maturity-period-exclude <deps>` only for a policy defined elsewhere. **Run both reads:**
   - `taze minor <flags>` → the **safe batch** (within-major bumps).
   - `taze major <flags>` → deps with a **new major**; a dep whose only drift is a major shows up only here. A dep in both gets its minor now, its major listed.

   The range argument sets what's *acted on*: `minor` (default) sweeps the safe batch, `major`/`latest` also deep-assesses each major, `patch` narrows the batch to patches. A **named target** (`eslint 9`) is a forced deep landing whatever the ceiling – honor it, flag any policy it crosses. Versions only move forward; a named older version is flagged, not performed.
3. **Branch first.** Sweep → the open `chore/deps-sweep` (fresh off the base once the prior one merged). Named or opted major → `chore/deps-<dep>-<target>`. A re-fire continues the matching open branch. One invocation = one branch = one MR; the safe batch rides along.
4. **Apply – taze writes, never a hand-edit.** `taze <minor|patch> <flags> -w` for the batch, `taze major <flags> -w --include <dep>` per opted major – both write the repo's own version source, YAML-preserving – then install once via the package manager. Only these write flags: `-I` is a raw-mode TUI, `-i`/`-u` install per call, and `pnpm up --latest` or `ncu` corrupt catalog refs.
5. **Assess each deep landing – installed source first.** Code, types, `CHANGELOG`, and migration guide in `node_modules` are ground truth; then context7 (`resolve-library-id`, `query-docs`); then the upstream repo via `gh`. Read the new major's **`peerDependencies`**: a coupled peer-major must land with it, and pnpm only warns on a mismatch (unless `strictPeerDependencies`). Pull it into the same landing, or present the bundle as one Decision.
6. **Migrate** per the tiers below until the workspace compiles.
7. **Align** (monorepo): a centralized catalog entry is bumped once, never forked per package. Existing divergence – an older-major pin, a local `override`/patch, an opt-out – is intentional: flag it as a Decision, never force-align.
8. **Optional config adoptions** (rules, presets, defaults a major offers but doesn't force) – the few that **fire on this codebase or change behavior/output** → individual Decisions, each with a one-line tradeoff; the rest → one batched default-yes "adopt the recommended set (`N`): <names>". A changed default that alters behavior or output is always surfaced.
9. **Verify – the repo's own checks, unscoped.** Run build/`prepare` before typecheck and tests when they resolve generated or built artifacts. **Install is a check** – `ERR_PNPM_TRUST_DOWNGRADE` (a transitive lost provenance under `trustPolicy: no-downgrade`) → Decision: add it to `trustPolicyExclude` (the repo's or a sibling's list is precedent) vs. drop the bump. A safe-batch bump that turns a check red **drops into a Decision**; a deep landing's red → fix, or recommend pin/defer.

## Forced Migration – Three Tiers

- **Mechanical** – one correct form (renamed or moved API, config-key rename) → apply.
- **A choice** – several valid forms → apply the **conservative, behavior-preserving** one and surface the choice as a Decision (an exception to Apply vs. Propose – a workspace that doesn't compile can't be verified).
- **A great breaking change** – large blast radius, a consequential API choice, a risky major, or no conservative path → leads Decisions as **proceed vs. pin/defer**. Deferring pins the current version and drafts a follow-up ticket.

## The Brief

The safe batch is **Done**, never a Decision.

<brief-template>
## Dependency Hygiene · <sweep | dep old → new> · <workspace> – <ready to push | blocked by N decisions>
<N> outdated · <S> safe bumped · majors: `eslint` 8→9 (Q1), `pinia` 2→3 not assessed (name it or re-run `major` to land)

**Needs you** – `Q1 a, Q2 a, ship 1–<n>`
**Q1** <opted major / great breaking change>: proceed now? a) proceed · b) pin/defer – **<letter>**: <reason> · [guide]
**Q2** Adopt rule `<x>`? fires <K>× a) yes · b) no – **a**: <tradeoff>
**Q3** Peer `<B>` pins an older major: a) align · b) keep – **<letter>**: <reason>
1. push commits
2. open the MR (D<n>)
3. post the tracker update or ticket (D<n>)

**Done** <S> safe deps bumped in the catalog (vite 5.2→5.4, …; <proof>) · `<API>` migrated in <K> files (<proof>) · <N> aligned via catalog
**Verification** <install | lint | typecheck | build | tests> ✗ <what failed>

**Drafts**
**D<n>** → <MR description | tracker update | follow-up ticket>
> <full text>

Practice discovered, versions, call sites, guide paths: `<report dir>/brief.md`
</brief-template>

## After Approval

Extra re-check: the base hasn't touched `pnpm-workspace.yaml`, any `package.json`, or the lockfile since this branch forked (`git fetch`, then `git diff --name-only HEAD...origin/<base>`). If it has, abort the push and the MR and report "base moved – re-run".

## Degradation

No migration guide, or a blast radius that outweighs the change → present what compiled and recommend pin/defer. taze errors **non-fatally** on a pnpm `overrides` nested key (`Invalid package name "a>b"`) – the read still completes.
