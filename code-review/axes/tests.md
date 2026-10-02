# Tests Axis

Audit the tests the diff adds, changes, or deletes – their value and their names. Name a missing source in `note` and carry on.

## Value

Read the Anti-patterns section of `~/.agents/skills/tdd/SKILL.md` and its `tests.md`, then check each test the diff touches for:

- **Tautological** and **Implementation-coupled** – as tdd defines them; a fixture asserting itself is tautological.
- **Hollow** – it would still pass if every function it imports returned `undefined`: a weak assertion, a mock-only or absence-only check, a pinned constant.
- **Redundant** – an existing test, often an E2E spec, already covers the behavior; or the cases differ only in data and belong in one `it.each` over real input/output pairs.
- **Not worth a test** – a one-line helper, framework behavior, a type shape, a leftover debugging test.
- **Lost** – a deleted test was the only one telling two cases apart; name the test that still does, else report it.
- **Missing** – a changed behavior no test observes, when a cheap seam exists.

## Names

Check every added or renamed test title against `~/.claude/rules/tests.md`; a rename finding names the clause the old name breaks.

Done when every added, changed, or deleted test has a Value verdict and every added or renamed title is checked under Names.
