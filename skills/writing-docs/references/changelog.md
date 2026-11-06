# Changelog Entries

An entry is for the user who upgrades: what they notice, and what they do about it.

- **Symptom, then fix.** "Changed plugin asset extension from `.mjs` to `.js` for better compatibility" becomes "Some hosts serve `.mjs` files with the wrong MIME type, so the browser refused to load Copilot's AI library and generation failed. The plugin now ships its scripts as `.js`."
- **A dependency becomes the user's action.** "Talks to Kirby Copilot through its versioned plugin API" becomes "Update Kirby Copilot to v3.9.0 or later to keep translating with AI."
- **Internal work appears through what the user notices.** "Externalized the ModelFusion library" becomes "A smaller initial Panel bundle loads the Panel faster." A migration between internal libraries with no visible effect is no entry.
- **Detail lives in the docs.** An entry links to the page instead of carrying a code block, an option list, or a closing line on its benefits.
- **Every line carries a fact.** "Although a minor release, this is a major release in terms of features!" and "Many more improvements and bug fixes under the hood" go.
- **A fix to a bug the same or the previous release introduced** usually gets no entry: few users ran the broken version. One that shipped long enough to be hit keeps its line.
- **Trimming old entries:** superseded details and facts that are no longer true go; the rest stays as it shipped.
