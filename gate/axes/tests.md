# Tests Axis

Audit the tests the diff adds or changes – their value and their names. This is an audit, not a red → green loop: write no tests. A missing source below is named in `note`, and the axis carries on.

## Value

Read the Anti-patterns section of `~/.agents/skills/tdd/SKILL.md` and its `tests.md`, then check each added or changed test for:

- **Tautological** – the expected value is recomputed the way the code computes it, or a fixture asserts itself.
- **Hollow** – it would still pass if every function it imports returned `undefined`: a weak assertion, a mock-only or absence-only check, a pinned constant.
- **Implementation-coupled** – it mocks what the repo owns, reaches into internals, or breaks on a refactor that keeps behavior.
- **Redundant** – an existing test, often an E2E spec, already covers the same behavior; or the cases differ only in data and belong in one `it.each` over real input/output pairs.
- **Not worth a test** – a one-line helper, framework behavior, a type shape, a debugging test left behind.
- **Missing** – a behavior the diff changes that no test observes, when a cheap seam exists.

## Names

Check every added or renamed test title against `~/.claude/rules/tests.md`. A rename needs a clause the old name breaks – name the clause; two compliant names are a lateral move and stay unmade. Where `context` names another author, the neighboring specs' style decides anything the rules leave open.

Done when every added or changed test has a verdict under Value and every added or renamed title is checked under Names.
