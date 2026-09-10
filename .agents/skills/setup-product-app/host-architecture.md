# Host architecture

The business UI stays independent of ProductWiki inspect/views. The **ProductWiki service** owns the views layer so consumers do not build an outer host app.

## Content app

Runs the business UI.

| Piece | Role |
| --- | --- |
| `ProductSurface` | DEV-only `data-product-ref` on a single element child |
| `attachProductWiki({ router, onSetVisible })` | DEV: pick elements, emit page context, apply wiki `navigate` (wraps `bootstrapProductInspect`). `onSetVisible` is for the consumer to hide/show their dock |
| `ProductRouterPort` | `getPath()`, `subscribe(listener)`, `navigate(path)` |
| Router path | Page path equals `wiki.route` (home is `/`). Parallel router entries are sibling pages; nested router `children` equal `view.route` when present. A view with no inherited route is global DOM |

Port adapters live in the surface packages, not in `product-server`:

```ts
import { bindVueRouter } from '@ylib/product-surface-vue/router';
import { bindReactRouter, ProductRouterSync } from '@ylib/product-surface-react/router';
```

`product-server` never imports `vue-router` / `react-router`.

Keep **hash** history in the playgrounds for now so wiki routes stay stable.

## Service

`viewsChannel` event names stay in `@ylib/product-server/channel`. Inspect/Views only see `window.productWikiInspect` / `window.productWikiViews`; the Vite plugin fills those objects over WebSocket to the Node service (HTTP + WS, localhost only).

`launchApp(name)` is reserved on the service. Do not implement launching other local apps.

### Default

```ts
// vite.config.ts
import { productWiki } from '@ylib/product-server/service/vite';
plugins: [productWiki({ data: './src/wiki.ts', playwright: true })]
// concurrent projects: pass port: 6101 or PRODUCT_WIKI_PORT so wiki services stay isolated

// DEV host
import { installHostDock } from '@ylib/product-dock';

const dock = installHostDock({ minWidth: 480, defaultWidth: 640 });
const frame = document.createElement('iframe');
frame.src = window.__productWikiService?.viewsUrl ?? 'http://127.0.0.1:5101/views';
dock.register({ id: 'wiki', label: '讲解面板', content: frame });
attachProductWiki({
  router: bindVueRouter(router),
  onSetVisible: (visible) => dock.setVisible(visible),
});
```

The plugin is a production no-op (`apply: 'serve'`):

1. Discover or start the local service (reuse only if `/health` matches the same `viewsEntry` and wiki file). Multiple Vite apps sharing one wiki file can share one service. Different projects should pass `port` / `PRODUCT_WIKI_PORT`. An explicit port that is occupied by something else fails instead of picking a random port.
2. Register the current origin and push wiki into the service (Vite `ssrLoadModule`; a JSON directory is the non-Vite fallback)
3. Inject the inspect client. The right column is `@ylib/product-dock`: callers `register({ id, label, content })`. The splitter and vertical tabs live in the dock, not in `product-server`.

The service serves views (`bootstrapProductViews`) so the React wiki panel does not enter the business production graph, and forwards `viewsChannel` over WebSocket.

- Single app: the plugin may auto-start the service
- Multi-app / explicit: `product-wiki serve --data <path>`

This repo: start one playground at a time (`pnpm dev:react` on `:5102`, `pnpm dev:vue` on `:5103`). The Vite plugin starts or reuses the local service. Playgrounds `register` the views iframe into product-dock. There is no framework switcher host. `pnpm dev:electron` is only a `BrowserWindow` on `:5102` (or `PRODUCT_WIKI_ELECTRON_URL`); start `pnpm dev:react` first.

Playgrounds demonstrate the default Wiki service. Overlay layout against the dock (modal / drawer / float button staying in the host pane) lives in `demo-dock-react` (`:5104`) and `demo-dock-vue` (`:5105`), which call `installHostDock` + `register` and do not load ProductWiki.

## Channel (`viewsChannel`)

Same event names on every transport:

- service WebSocket (default)
- iframe `postMessage` / Wujie bus (escape hatch)

Wiki → content: `product-wiki:navigate` with a path that has no `:param`.
Content → wiki: `product-wiki:page-context` (`route` + visible refs + `origin`) and `product-wiki:selection`.
Wiki → service: `product-wiki:run-tests` (`productRef`, `route`, `origin`, `viewReference`); service looks up the playwright root registered for that origin, spawns `npx playwright test --grep`, and broadcasts `product-wiki:run-tests-progress`. Overlay「运行测试」emits `product-wiki:open-tests`.

`page` has `route`. `global` and `dom` must not. `dom` must have a `page` or `global` parent. A DOM view with an inherited page route, or a view/wiki whose path equals the current page, stays wiki-only. Global DOM (no inherited route) is identified by `productRef` on every page.

## Escape hatch

A two-app Wujie (or iframe `postMessage`) host is **not** the template. Use it only when the Node service cannot host views. Copy the **shape** (content app, views app, channel, Port). Do not import playground modules into a product.

Playgrounds in this repo (`playground-react`, `playground-vue`) demonstrate the default service. Shared wiki **data** lives in `packages/product-server/data/` (dogfood fixture, not published).
