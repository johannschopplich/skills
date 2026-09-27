---
name: asana-formatting
description: Writes rich text into Asana tasks, projects, status updates, and comments through the Asana MCP's HTML fields. Use when an Asana write carries formatting, links, or @-mentions.
---

Asana renders no Markdown: `**bold**` or `- item` in `notes` or `text` shows up literally. Put formatted content in the tool's HTML field (`html_notes`, `html_text`) as XML, and plain prose in the plain field.

Take the allowed elements from that field's schema; they differ per tool (task `html_notes` allows headings, `<hr/>`, `<img>`, and tables; project `html_notes`, comments, and status updates do not). `update_project` lists no elements: hold it to the `create_project` set. Paragraphs have no element: `<p>`, `<br/>`, and `<div>` return `400 XML invalid`.
