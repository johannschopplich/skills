# Kirby 6 Panel at Runtime

The committed `panel/dist` in `/tmp/kirby-v6` lags `panel/src`, so build first.

1. **Build the Panel.** `cd /tmp/kirby-v6/panel && npm ci && npm run build`. The build rewrites the tracked `panel/dist`: restore it before the next pull.
2. **Wrap a site.** In `$TMPDIR/kirby-v6-site`: `public/index.php` requires `/tmp/kirby-v6/bootstrap.php` and runs `new Kirby\Cms\App` with the roots `index` (`public/`), `base`, `site`, `content`, `storage`, and `kirby` (`/tmp/kirby-v6`), all absolute; one page blueprint; one admin account under `site/accounts/`; a `route:before` hook calling `loginPasswordless()` on that user.
3. **Serve.** `php -S localhost:8899 -t public /tmp/kirby-v6/router.php`, then open `/panel` in Chrome DevTools MCP, in an isolated page (see [panel-smoke.md](panel-smoke.md)).
4. **Clear the Panel assets.** After every rebuild, delete the site's `public/media/panel` so Kirby copies the fresh assets.
