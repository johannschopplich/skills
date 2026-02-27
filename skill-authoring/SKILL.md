---
name: skill-authoring
description: Create and review agent skills with proper structure, progressive disclosure, and bundled resources. Use when user wants to create, write, build, review, audit, or improve a skill. Don't use for executing skill logic or modifying non-skill project files.
---

# Skill Authoring

## Create Workflow

1. **Gather requirements** – ask user about:
   - What task/domain does the skill cover?
   - What specific use cases should it handle?
   - Does it need executable scripts or just instructions?
   - Any reference materials to include?

2. **Draft the skill** – create:
   - SKILL.md with concise instructions (<500 lines)
   - Reference files in `references/` if content has distinct domains or exceeds main file comfort
   - Templates/schemas in `assets/` if agent needs to copy output structures
   - Utility scripts in `scripts/` if deterministic operations needed

3. **Review with user** – present draft and ask:
   - Does this cover your use cases?
   - Anything missing or unclear?
   - Should any section be more/less detailed?

4. **Validate** – see [VALIDATION.md](VALIDATION.md) for discovery, logic, and edge-case testing

## Review Workflow

1. **Read the target skill** – load the skill's SKILL.md and list its directory tree.

2. **Run the Review Checklist** – evaluate every item in the checklist below. For each failing item, note the specific violation.

3. **Assess discoverability** – evaluate the description against Description Requirements. Test whether triggers are specific enough and negative triggers prevent false matches.

4. **Check writing style** – verify instructions follow Writing Style rules: third-person imperative, numbered steps, consistent terminology, JiT loading.

5. **Identify structural issues** – check file depth (one level only), line count (<500), anti-patterns (README, library code, redundant logic).

6. **Present findings** – report as actionable items with severity:
   - **critical** – skill will malfunction or never trigger (e.g., name/directory mismatch, missing description triggers)
   - **warning** – degrades quality or discoverability (e.g., vague terminology, prose instead of templates)
   - **suggestion** – improvement opportunity (e.g., a script could replace repeated generated code)

7. **Optionally validate** – for deeper testing, run the [VALIDATION.md](VALIDATION.md) workflow against the skill.

## Skill Structure

```
skill-name/
├── SKILL.md              # Required: metadata + core instructions (<500 lines)
├── references/           # Supplementary context (schemas, cheatsheets)
│   └── api-docs.md
├── assets/               # Templates or static files used in output
│   └── config.template.ts
└── scripts/              # Executable scripts for deterministic tasks
    └── helper.js
```

- `SKILL.md` – the "brain." Use for navigation and high-level procedures.
- `references/` – link from SKILL.md via JiT loading. Keep one level deep only.
- `assets/` – templates, JSON schemas, static files the agent copies into output.
- `scripts/` – tiny single-purpose CLIs. Do not bundle library code here.

## Naming Requirements

The `name` field in frontmatter has strict constraints:

- 1–64 characters
- Lowercase letters, numbers, and hyphens only
- No consecutive hyphens
- **Must exactly match the parent directory name** (e.g., `name: angular-testing` lives in `angular-testing/SKILL.md`)

## SKILL.md Template

```md
---
name: skill-name
description: Brief description of capability. Use when [specific triggers]. Don't use for [negative triggers].
---

# Skill Name

## Quick start

[Minimal working example]

## Workflows

[Step-by-step numbered processes with decision trees for complex tasks]

## Advanced features

[Link to separate files: See [references/advanced.md](references/advanced.md)]
```

## Description Requirements

The description is the only thing the agent sees when deciding which skill to load. It's surfaced in the system prompt alongside all other installed skills. The agent reads these descriptions and picks the relevant skill based on the user's request.

**Goal**: Give the agent just enough info to know:

1. What capability this skill provides
2. When to trigger it (specific keywords, contexts, file types)
3. When **not** to trigger it (negative triggers to prevent false matches)

**Format**:

- Max 1024 chars
- Write in third person
- First sentence: what it does
- Second sentence: "Use when [specific triggers]"
- Third sentence: "Don't use for [negative triggers]"

**Good example**:

```
Creates and builds React components using Tailwind CSS. Use when the user wants to update component styles or UI logic. Don't use for Vue, Svelte, or vanilla CSS projects.
```

**Bad example**:

```
Helps with documents.
```

The bad example gives the agent no way to distinguish this from other document skills.

## Writing Style

Skills are for agents, not humans. Write instructions that LLMs execute reliably:

- **Third-person imperative** – "Extract the text..." not "You should extract..." or "I will extract..."
- **Step-by-step numbering** – define workflows as strict chronological sequences. Map out decision trees explicitly (e.g., "Step 2: If source maps are needed, run `build --source-map`. Otherwise, skip to Step 3.")
- **Concrete templates over prose** – agents pattern-match well. Place output templates in `assets/` and instruct the agent to copy the structure instead of describing it in paragraphs
- **Consistent terminology** – pick one term per concept and use it everywhere. Don't alternate between "component", "widget", and "element" for the same thing
- **Domain-specific language** – use the most specific native terminology (e.g., "template" instead of "html" in Angular)
- **JiT loading** – explicitly instruct the agent when to read reference files. It will not see them until directed (e.g., "Read `references/auth-flow.md` for error codes")
- **Relative paths** – always use relative paths with forward slashes (`/`), regardless of OS

## What Not to Include

Do not create:

- **Documentation files** – no `README.md`, `CHANGELOG.md`, or `INSTALLATION_GUIDE.md`
- **Redundant logic** – if the agent already handles a task reliably, delete the instruction
- **Library code** – skills should contain tiny single-purpose scripts, not long-lived library code

## When to Add Scripts

Add utility scripts when:

- Operation is deterministic (validation, formatting, parsing)
- Same code would be generated repeatedly
- Errors need explicit handling

Scripts save tokens and improve reliability vs. generated code.

**Error handling**: scripts must emit descriptive, human-readable messages to stdout/stderr so the agent knows exactly how to self-correct without user intervention.

## When to Split Files

Split into separate files when:

- SKILL.md exceeds 500 lines
- Content has distinct domains (finance vs. sales schemas)
- Advanced features are rarely needed

Keep all reference files one level deep (e.g., `references/schema.md`, not `references/db/v1/schema.md`).

## Review Checklist

After drafting or when reviewing an existing skill, verify:

- [ ] Name matches parent directory exactly
- [ ] Name is lowercase, 1–64 chars, hyphens only (no consecutive)
- [ ] Description includes positive triggers ("Use when...")
- [ ] Description includes negative triggers ("Don't use for...")
- [ ] SKILL.md under 500 lines
- [ ] No time-sensitive info
- [ ] Consistent terminology throughout
- [ ] Instructions use third-person imperative voice
- [ ] Concrete examples/templates included
- [ ] References one level deep
- [ ] No README, CHANGELOG, or documentation files
- [ ] Scripts emit descriptive error messages
- [ ] Validated using [VALIDATION.md](VALIDATION.md) workflow
