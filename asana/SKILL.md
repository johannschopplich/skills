---
name: asana
description: Asana through its MCP. Use when writing rich text or custom fields to Asana, finding a task by a field value, or moving a task between sections.
---

# Asana

## Rich Text

Asana renders no Markdown: `**bold**` or `- item` in `notes` or `text` shows up literally. Put formatted content in the tool's HTML field (`html_notes`, `html_text`) as XML.

Take the allowed elements from that field's schema; they differ per tool. `update_project` lists no elements: hold it to the `create_project` set. Paragraphs have no element: `<p>`, `<br/>`, and `<div>` return `400 XML invalid`.

## Custom Fields

- **Option GIDs** – `get_task` on a task that holds the value, with `opt_fields=custom_fields.gid,custom_fields.name,custom_fields.enum_value.gid,custom_fields.enum_value.name,custom_fields.multi_enum_values.gid,custom_fields.multi_enum_values.name`.
- **Writes** – fail with "Custom field … is not on given object" until the task is on a project that carries the field: add the project first, set fields second.
- **Search** – `search_tasks` with `completed` unset and `{"<field gid>.value": "<value>"}`; text search and `.contains` miss the field. On a miss, page `get_tasks` on the project with `opt_fields=custom_fields.gid,custom_fields.display_value` and match `display_value`.

## Moves

`update_tasks` with `add_projects: [{project_id, section_id}]`; section GIDs from `get_project` with `include_sections`.
