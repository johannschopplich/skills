# Smoke-Testing a Plugin Playground

Drive the playground's Panel through Chrome DevTools MCP. A scenario is done once screenshots and file evidence prove it.

1. **Record the baseline.** Note which paths under `playground/` are already dirty.
2. **Serve as admin.** `KIRBY_DEBUG=true composer dev` in the background – the process env overrides `.env`. `/panel/login` then signs in as admin, `/panel/login?role=playground` as the role that can't update pages.
3. **Open an isolated page.** `new_page` with `isolatedContext` – the shared Chrome holds the user's tabs – then `resize_page` 1440×900.
4. **Hold the run open.** To act mid-run, install a `window.fetch` wrapper with `evaluate_script` that delays matching URLs by 15 s and logs every request. Test the pattern against a logged URL first; reinstall it after a full reload. A plugin cache can skip the request you want to delay: reload and pick a model not yet read.
5. **Act and wait in one script.** Click, sleep, navigate, then poll `panel.view.path`, `panel.language.code`, and `panel.notification` every 250–500 ms until the run settles, all in one async `evaluate_script`. Find buttons by `innerText`; snapshot uids go stale on re-render.
6. **Screenshot in sequence.** A `take_screenshot` in the same parallel block as a running `evaluate_script` captures the end state. The MCP writes only under `$TMPDIR` and the session's roots, not `/tmp`. Drop byte-identical frames before embedding.
7. **Prove what was written.** Touch a stamp before a scenario, then list what under `playground/storage/content` is newer; unsaved edits land in each page's `_changes/`. The request log shows no save followed an abort.
8. **Tear down.** `close_page`, stop the server, delete scenario files by absolute path, and restore only paths that were clean at the baseline.
