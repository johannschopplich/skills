---
name: asana-formatting
description: Format Asana MCP writes correctly. Use when creating or updating any Asana task, project, status update, or comment that contains anything beyond plain text.
---

When an Asana MCP write tool exposes an HTML-formatted field (e.g. `html_notes`, `html_text`), use it – never the plain-text alternative.

- Wrap the content in a single `<body>...</body>` root. Asana returns `400 Rich text should be wrapped in <body> tag` without it.
- Use only the tags enumerated in the field's own schema. Anything else returns `400 XML invalid` (common foot-guns: `<p>`, `<br/>`, `<div>`).
- Attributes belong only on `<a>`.
