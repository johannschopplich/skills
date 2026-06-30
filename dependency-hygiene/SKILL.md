---
name: dependency-hygiene
description: Sweep the safe dependency drift and land deliberate bumps or migrations cleanly – breaking changes handled against the installed source, every gate green, staged behind one grill-ready brief.
argument-hint: "nothing (sweep the drift), a range (patch|minor|major), or a dep + version to land (e.g. eslint 9)"
disable-model-invocation: true
---

# Dependency Hygiene

Discover what's drifted, sweep the safe bumps, and land the deliberate ones cleanly across the workspace – then stop once, late, with a grill-ready brief so the human resolves only the real judgment calls and picks what ships.

**Two altitudes, one pipeline.** A **routine sweep** folds the safe drift – every within-major bump – into one default-yes batch. A **deep landing** – a named target, or a cross-major bump opted into – gets breaking changes assessed against the installed source and call sites migrated. A bare invocation sweeps the safe drift and *lists* the majors it found without grinding them; naming one escalates it to a deep landing.

**Push-right** – do maximal work first (discover, bump, migrate, align, gates green – all staged on a branch); the two irreversible actions (push, open the MR) wait behind one late checkpoint.

## State – the workspace, not a file

No state file – the **workspace** is the state: the version source (a pnpm `catalog` or `package.json`), the lockfile, `node_modules`, plus any staged-but-unpushed migration commits. The loop is a **reconciler** – each fire **re-discovers** the target (latest-allowed within the range ceiling, via taze) and reconverges the delta. A named target pins a fixed point; the sweep's target *moves* as upstream publishes, so each fire is a fresh snapshot.

- Nothing drifted since the last fire, work already staged → re-present; don't re-migrate.
- Upstream moved (new releases, a teammate bumped the catalog, a peer changed) → reconcile: an unpushed safe bump **supersedes to the newer latest-allowed** (re-derive, diff-skip if identical), fresh drift folds in, open decisions re-present. **Unpushed local commits count as not-done** – they never reached the remote.
- At latest-allowed *as of this fire*, gates green, no open decisions → closed for this fire. Drift published later is the next invocation's work, not a reopening.

## Run – in order

1. **Discover the repo's dependency practice – never assume it.** The version source (single `package.json`? a pnpm `catalog`? workspace protocol?), lockfile + package manager, `overrides`, `patchedDependencies`, version/trust policies (`trustPolicy`, `minimumReleaseAge`, and any `trustPolicyExclude`/`minimumReleaseAgeExclude` – read these as **pre-vetted**, never re-surfaced as decisions), any renovate/dependabot config, pinning conventions – and the host for the eventual MR (`glab` for `finanzfluss-group`, `gh` for GitHub). The maturity/trust policies feed taze in step 2. Done once each is named; never carry a prior repo's setup over.
2. **Discover the drift – taze, read-only.** Two reads: `pnpm dlx taze minor -r --maturity-period <discovered>` gives the **safe batch** (every bump that stays within its current major); `pnpm dlx taze major -r --maturity-period <discovered>` additionally surfaces which deps have a **new major** available. A dep can land in both – it gets its safe minor now, the major noted for later. **Run both** – a dep whose sole drift is a new major shows up only in the `major` read; never infer the major list from `minor` alone. The range argument sets what's *acted on*, not what's discovered: `minor` (the default) sweeps the safe batch, `major`/`latest` also deep-assesses each available major, `patch` narrows the safe batch to patch-only. The discovered maturity/trust policies gate these automatic paths; a **named target** (`eslint 9`) is the human's explicit call – a forced deep landing whatever the ceiling; honor it, but flag anything that crosses a policy.
3. **Scope the change** across the workspace: which packages and files the acted-on API surface touches. The safe-batch bumps need no scoping; the deep landings do.
4. **Assess breaking changes – installed source first.** For each deep landing, after the bump read the new version's actual code, types, `CHANGELOG`, and migration guide in `node_modules`; the **installed version is ground truth**, never a remembered API shape. Then Context7 for migration docs, then the upstream repo via `gh` as a last resort. Find affected code by scanning the workspace for the exact API surface – never migrate blind. **Read the new major's `peerDependencies`:** a deep landing can drag a coupled peer-major that must land *with* it – the mismatch breaks lint at runtime, not install, so no gate catches it. Pull the required coupled major into the same landing, or present the bundle as one Decision. The assessment classifies the forced migration (see below).
5. **Branch first.** A routine sweep continues the single open `chore/deps-sweep` (a fresh one off the current base once the prior merged); a named or opted-major landing gets `chore/deps-<dep>-<target>` (`/write-dev-copy` naming). A re-fire continues the matching open branch rather than spawning a duplicate. One invocation = one branch = one MR; the safe batch rides along on whichever branch this invocation owns.
6. **Apply – taze writes, never a hand-edit** (staged, unpushed): the safe batch via `taze <minor|patch> -r -w` (the ceiling's mode), each opted major via `taze major -r -w --include <dep>` – both write the repo's *own* version source (catalog entry or `package.json`), YAML-preserving; then the lockfile via the repo's package manager; then the mechanical migration each breaking change forces. **Never `-I`** (a raw-mode TUI) or **`-i`/`-u`** (auto-install) – and never `pnpm up --latest` or `ncu`, which corrupt catalog refs; taze is the tool. One logical change per commit, `/write-dev-copy` subjects, **no explanatory comments**. The applied diff's job – the workspace compiles.
7. **Cascade / align** (monorepo only): check every peer for the same surface.
   - **Conform to how the repo centralizes** – a single-source catalog entry is bumped once and consumers follow; never fork per-package versions of something deliberately centralized.
   - **Respect existing divergence as intentional** – a peer pinning an older major, carrying a local `override`/`patch`, or opting out is flagged as a *decision*, never force-aligned silently.
8. **Hold the optional adoptions as curated decisions.** The few that **actually fire on this codebase or change behavior/output** → individual Decisions, each a recommendation + one-line tradeoff. The safe/conventional bulk with **no real hits** → one batched "adopt the recommended set (`N`) [show]," default-yes, never itemized. **Never silently inherit a changed default** that alters behavior or output – surface it. These are config/rule adoptions, distinct from the version safe-batch, which is already Applied.
9. **Verify the gates – the repo's own, in its own order** (discovered): install, lint, typecheck, build, tests. The lockfile's blast radius is the whole workspace, so they run **unscoped** – and the workspace was green before, so any red is the change's doing *unless* it's a gate that can't run here (below). **Order isn't fixed:** typecheck and tests often resolve generated or built workspace artifacts (dist types, `prepare`/codegen), so run build/`prepare` before typecheck. **Install is itself a gate** – a bump can fail it via `ERR_PNPM_TRUST_DOWNGRADE` (a transitive lost provenance under `trustPolicy: no-downgrade`); that's a **Decision** – add the transitive to `trustPolicyExclude` (the repo's or a sibling's list is the precedent) vs drop the bump – never a silent red. A safe-batch bump that turns lint/typecheck/test red **drops out of the batch into a Decision** rather than shipping red; a deep landing's red → fix it, or recommend pin/defer. A gate that genuinely can't run (needs secrets/env – e.g. prepare-time codegen) is **named in the brief and not attributed to the change**, never a silent "should work."
10. **Pre-draft outward copy via `/write-dev-copy` – stage, never post.** The MR description, an optional comment, an optional Asana update – or, when a great breaking change is deferred, a follow-up ticket capturing the migration scope. Language matches the audience – German for `finanzfluss-group`, English for public/OSS.
11. **Assemble the brief and present at the checkpoint.**

## Forced migration – three tiers

The breaking change's migration decides the altitude:

- **Mechanical** – one correct form (a renamed or moved API, a required config-key rename) → apply it, reach compiling, present at the checkpoint.
- **A choice** – more than one valid form, the right one depending on intent → apply the **conservative, behavior-preserving** option to keep the workspace compiling, and surface the choice as a Decision (the path taken, the alternative, a recommendation).
- **A great breaking change** – large call-site blast radius, a consequential API choice, a risky major, or no conservative path exists → it leads the brief's Decisions as **proceed vs pin/defer**, recommendation attached. Deferring **pins the current version** and drafts a follow-up ticket. No early gate – the single late checkpoint still governs.

## The brief

Decisions holds only judgment calls; the safe batch is **Applied** (FYI), never a Decision. `write-dev-copy` voice throughout (en dash, backticked identifiers, fact-only).

```
## Dependency hygiene · <sweep | dep old → new> · <workspace>
practice: <discovered – catalog (pnpm-workspace.yaml) · trustPolicy no-downgrade · maturity 7d> · lockfile ✅
discovered: <N> outdated (taze) – <S> safe (applied) · <M> majors <listed | assessed>

### Decisions            ← judgment calls only
majors available, not assessed: `eslint` 8→9 · `pinia` 2→3 – name one or re-run `major` to land.
1. <opted major / great breaking change>: proceed now vs pin/defer. Rec: <…>. [migration guide]
2. adopt rule `<x>`? (fires <K>×) Rec: yes – <tradeoff>. [config]
3. peer `<B>` pins an older major – align or keep? Rec: <…> – <reason>. [pkg]

### Applied (staged locally, not pushed)
- chore(deps): bump <S> safe deps in catalog              lockfile ✅ [show: vite 5.2→5.4, …]
- refactor: migrate `<API>` call sites (`<K>` files)      compiles ✅ [diff]   ← deep landing only

### Alignment
aligned `<N>` via catalog · `<M>` flagged [see decisions]

### Verification
install ✅ · lint ✅ · typecheck ✅ · build ✅ · tests ✅    (or ⚠️ <what failed>)

### Ready to ship – pick what posts
[ ] push commits   [ ] open MR [show description]   [ ] post Asana / ticket [show]
```

## After approval

Execute only the checked items, in a safe order: push commits → open the MR → post Asana. Before pushing, re-run the **execution-time staleness re-check**: the remote branch hasn't moved (the push would be non-fast-forward) **and** a clean `install` plus the gates still pass on the current base – a lockfile rots if the catalog moved under it since the brief. Abort that item if stale; **never push a workspace that no longer installs green**. Then a terse confirmation: what pushed, opened, and posted (with links), and any item that **failed** – reported, never swallowed.

## Non-goals

- **DOES NOT push or open the MR** without approval.
- **DOES NOT auto-land majors** – cross-major bumps are listed or assessed, never swept into the default-yes batch.
- **DOES NOT downgrade** – the loop moves forward; a named older version is flagged, not performed.

## Degradation

Discovery can't reach the registry (offline, registry down), a gate can't run (needs secrets or env), a breaking change has no migration guide, a major's blast radius outweighs the change → the brief **states it plainly**, presents what compiled, and recommends pin/defer rather than forcing a half-migrated workspace through. Never claim a green that wasn't observed. taze itself errors **non-fatally** on a pnpm `overrides` nested key (`Invalid package name "a>b"`) – the read still completes; note it, don't mistake it for a failed run.
