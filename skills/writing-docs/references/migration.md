# Migration Guides

A migration guide answers one question: what do I change?

- **Entries that ask for an action.** A change that asks nothing of the reader – a new seam, an option nothing ever read – leaves the guide, or shrinks to one line inside a related entry: "The `url` option is gone from the same type. Nothing ever read it, so delete the key if you have one."
- **Newest version first.** Within a version, group by how a change reaches the reader – code to change, behavior that changed, types that are now stricter, renames – and open each group with what its entries share: "These changes touch no runtime behavior. They reach you as compile errors." A renames table opens with who it concerns: "Only relevant if you …".
- **What it used to do, then the action:** "A `format: binary` string used to be typed as `string`. Pass a `Blob` or a `File` instead."
- **The heading** states the change as a claim, "`OpenAPIBuilder` Is Now `openAPIBuilder`", or names the action, "Regenerate Your Types".
- **Before and after in one diff block,** with the docs engine's diff markers (VitePress: `// [!code --]`, `// [!code ++]`), not two blocks labeled "Before" and "After".

Moving from another library:

- The two libraries' code side by side in a code group.
- A table mapping each old option to its new one.
- Differences ordered by how often they break code: "These three break code most often:", then "The other changes:".
- Headings that name the swap: "Do X Instead of Y".
