---
name: dependency-hygiene
description: Sweep the safe dependency drift and land deliberate bumps or migrations cleanly – breaking changes handled against the installed source, every check green, staged behind one grill-ready brief.
argument-hint: "nothing (sweep the drift), a range (patch|minor|major), or a dep + version to land (e.g. eslint 9)"
disable-model-invocation: true
---

# Dependency Hygiene

Discover what's drifted, sweep the safe bumps, and land the deliberate ones cleanly across the workspace.

**Two altitudes, one pipeline.** A **routine sweep** folds the safe drift – every within-major bump – into one default-yes batch. A **deep landing** – a named target, or a cross-major bump opted into – gets breaking changes assessed against the installed source and call sites migrated. A bare invocation sweeps the safe drift and *lists* the majors it found without grinding them; naming one escalates it to a deep landing.

**Load the doctrine first: invoke the `push-right` skill.** This file adds what is specific to dependencies. The irreversible actions here are **push** and **open the MR**. The one hard failure is a registry taze can't reach: without discovery nothing drifts.

## Boundary Marker

The **workspace is the state**: the version source (a pnpm `catalog` or `package.json`), the lockfile, `node_modules`, plus any staged-but-unpushed migration commits. Each run is a **reconciler** – it **re-discovers** the target (latest-allowed within the range ceiling, via taze) and reconverges the delta. A named target pins a fixed point; the sweep's target *moves* as upstream publishes, so each run is a fresh snapshot.

- Nothing drifted since the last run, work already staged → re-present rather than re-migrate.
- Upstream moved (new releases, a teammate bumped the catalog, a peer changed) → reconcile: an unpushed safe bump **supersedes to the newer latest-allowed** – re-derived rather than rebased (a lockfile doesn't rebase cleanly), an exception to push-right's Boundary Marker; skip it when the re-derived diff is identical; fresh drift folds in; open decisions re-present.
- At latest-allowed *as of this run*, checks green, no open decisions → closed for this run. Drift published later is the next invocation's work, not a reopening.

## Run – in Order

1. **Discover the repo's dependency practice.** The version source (single `package.json`? a pnpm `catalog`? workspace protocol?), lockfile + package manager, `overrides`, `patchedDependencies`, version/trust policies (`trustPolicy`, `minimumReleaseAge`, and any `trustPolicyExclude`/`minimumReleaseAgeExclude` – read these as **pre-vetted**, never re-surfaced as decisions), any renovate/dependabot config, pinning conventions – and the host for the eventual MR (GitLab → `glab`, GitHub → `gh`). Done once each is named, discovered fresh for this repo.
2. **Discover the drift – taze, read-only.** Build one flag set, `<flags>`, and reuse it for every taze call, reads and writes alike: `-r --no-github-actions --no-node-version`, plus `-l` when the repo pins exact versions (taze skips exact pins without it). taze applies the maturity policy itself – `minimumReleaseAge` and `minimumReleaseAgeExclude` from `pnpm-workspace.yaml`, `npmMinimalAgeGate` and `npmPreapprovedPackages` from `.yarnrc.yml` – so add `--maturity-period <days>` and `--maturity-period-exclude <deps>` only for a policy defined anywhere else. Run taze through the repo's own runner (`pnpm dlx`, `npx`, `bunx`). Two reads:
   - `taze minor <flags>` gives the **safe batch** (every bump that stays within its current major).
   - `taze major <flags>` additionally surfaces which deps have a **new major** available.

   A dep can land in both – it gets its safe minor now, the major noted for later. **Run both** – a dep whose sole drift is a new major shows up only in the `major` read. The range argument sets what's *acted on*, not what's discovered: `minor` (the default) sweeps the safe batch, `major`/`latest` also deep-assesses each available major, `patch` narrows the safe batch to patch-only. The discovered maturity/trust policies govern these automatic paths; a **named target** (`eslint 9`) is the human's explicit call – a forced deep landing whatever the ceiling; honor it, and flag anything that crosses a policy. Versions only move forward – a named older version is flagged, not performed.
3. **Branch first.** A routine sweep continues the single open `chore/deps-sweep` (a fresh one off the current base once the prior merged); a named or opted-major landing gets `chore/deps-<dep>-<target>`. A re-fire continues the matching open branch rather than spawning a duplicate. One invocation = one branch = one MR; the safe batch rides along on whichever branch this invocation owns.
4. **Apply – taze writes, never a hand-edit** (staged, unpushed): the safe batch via `taze <minor|patch> <flags> -w` (the ceiling's mode), each opted major via `taze major <flags> -w --include <dep>` – both write the repo's *own* version source (catalog entry or `package.json`), YAML-preserving; then install (lockfile + `node_modules`) once, via the repo's package manager. Use the write flags above only: `-I` is a raw-mode TUI, `-i`/`-u` run the package manager per call instead of once after both writes, and `pnpm up --latest` or `ncu` corrupt catalog refs.
5. **Scope the change** across the workspace: which packages and files the acted-on API surface touches. The safe-batch bumps need no scoping; the deep landings do.
6. **Assess breaking changes – installed source first.** For each deep landing, with step 4's install in place, read the new version's actual code, types, `CHANGELOG`, and migration guide in `node_modules`; the **installed version is ground truth**. Then the context7 MCP server (`context7:resolve-library-id`, then `context7:query-docs`) for migration docs, then the upstream repo via `gh` as a last resort. Find affected code by scanning the workspace for the exact API surface. **Read the new major's `peerDependencies`:** a deep landing can drag a coupled peer-major that must land *with* it. pnpm only warns on a peer mismatch unless `strictPeerDependencies` is set, so install passes and the break surfaces later, at lint, test, or runtime. Pull the required coupled major into the same landing, or present the bundle as one Decision. The assessment classifies the forced migration (see below).
7. **Migrate** – apply the migration each breaking change forces, per its tier below. The applied diff's job – the workspace compiles.
8. **Cascade / align** (monorepo only): check every peer for the same surface.
   - **Conform to how the repo centralizes** – a single-source catalog entry is bumped once and consumers follow, rather than forking per-package versions of something deliberately centralized.
   - **Respect existing divergence as intentional** – a peer pinning an older major, carrying a local `override`/`patch`, or opting out is flagged as a *decision*, never force-aligned silently.
9. **Hold optional config adoptions – new rules, presets, or defaults a landed major offers but doesn't force – as curated decisions.** The few that **actually fire on this codebase or change behavior/output** → individual Decisions, each a recommendation + one-line tradeoff. The safe/conventional bulk with **no real hits** → one batched "adopt the recommended set (`N`): <names>", default-yes, never itemized. A changed default that alters behavior or output is always surfaced rather than inherited silently. These are config/rule adoptions, distinct from the version safe-batch, which is already Applied.
10. **Verify the checks – the repo's own, in its own order** (discovered): install, lint, typecheck, build, tests. The lockfile's blast radius is the whole workspace, so they run **unscoped** – the baseline here is the workspace before this run's commits, so any new red is the change's doing. **Order isn't fixed:** typecheck and tests often resolve generated or built workspace artifacts (dist types, `prepare`/codegen), so run build/`prepare` before typecheck. **Install is itself a check** – a bump can fail it via `ERR_PNPM_TRUST_DOWNGRADE` (a transitive lost provenance under `trustPolicy: no-downgrade`); that's a **Decision** – add the transitive to `trustPolicyExclude` (the repo's or a sibling's list is the precedent) vs drop the bump. A safe-batch bump that turns lint/typecheck/test red **drops out of the batch into a Decision** rather than shipping red; a deep landing's red → fix it, or recommend pin/defer. The check most likely to be unrunnable here is prepare-time codegen needing secrets.
11. **Draft the outward copy** (`push-right`): the MR description, an optional tracker update – or, when a great breaking change is deferred, a follow-up ticket capturing the migration scope.
12. **Assemble the brief and present at the checkpoint.**

## Forced Migration – Three Tiers

The breaking change's migration decides the altitude:

- **Mechanical** – one correct form (a renamed or moved API, a required config-key rename) → apply it, reach compiling, present at the checkpoint.
- **A choice** – more than one valid form, the right one depending on intent → apply the **conservative, behavior-preserving** option and surface the choice as a Decision (the path taken, the alternative, a recommendation). This is an exception to push-right's Apply vs. Propose, since a workspace that doesn't compile can't be verified.
- **A great breaking change** – large call-site blast radius, a consequential API choice, a risky major, or no conservative path exists → it leads the brief's Decisions as **proceed vs pin/defer**, recommendation attached. Deferring **pins the current version** and drafts a follow-up ticket. No early checkpoint – the single late checkpoint still governs.

## The Brief

The safe batch is **Applied** (FYI), never a Decision.

```
## Dependency Hygiene · <sweep | dep old → new> · <workspace>
practice: <discovered – catalog (pnpm-workspace.yaml) · trustPolicy no-downgrade · maturity 7d> · lockfile ✅
discovered: <N> outdated (taze) – <S> safe (applied) · majors: `eslint` 8→9 assessed (Q1) · `pinia` 2→3 not assessed (name it or re-run `major` to land)

### Decisions
Q1 <opted major / great breaking change>: a) proceed now b) pin/defer – Rec: <letter>, <reason>. guide: <URL or node_modules path>
Q2 adopt rule `<x>`? (fires <K>× – <file:line, …>) a) yes b) no – Rec: a, <tradeoff>.
Q3 peer `<B>` (`<path>/package.json`) pins an older major: a) align b) keep – Rec: <letter>, <reason>.

### Applied (Staged Locally, Not Pushed)
- chore(deps): bump <S> safe deps in catalog · <sha>      lockfile ✅ · vite 5.2→5.4, … · <traced | reproduced | checked>
- refactor: migrate `<API>` call sites (`<K>` files) · <sha>      compiles ✅ · <traced | reproduced | checked>

### Alignment
aligned `<N>` via catalog · `<M>` flagged (Q<n>)

### Verification
install ✅ · lint ✅ · typecheck ✅ · build ✅ · tests ✅    (or ⚠️ <what failed>)

### Ready to Ship – Pick What Posts
[ ] push commits   [ ] open MR (D<n>)   [ ] post tracker / ticket (D<n>)

### Drafts                (numbered in order of the drafts present)
D<n> <MR description, in full>
D<n> <tracker update or follow-up ticket, in full>
```

## After Approval

Safe order for this tray: push commits → open the MR → post the tracker update. The execution-time re-check carries one extra condition here: the base branch hasn't touched `pnpm-workspace.yaml`, any `package.json`, or the lockfile since this branch forked from it (`git fetch`, then `git diff --name-only HEAD...origin/<base>`). If it has, abort the push and the MR and report "base moved – re-run"; the lockfile would rot.

## Degradation

A check can't run (needs secrets or env), a breaking change has no migration guide, a major's blast radius outweighs the change → the brief **states it plainly**, presents what compiled, and recommends pin/defer rather than forcing a half-migrated workspace through. taze itself errors **non-fatally** on a pnpm `overrides` nested key (`Invalid package name "a>b"`) – the read still completes; note it rather than reading it as a failed run.
