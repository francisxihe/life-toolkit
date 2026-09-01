# Host architecture

The business UI stays independent of ProductWiki inspect/views. The **ProductWiki service** owns the views layer so consumers do not build an outer host app.

## Content app

Runs the business UI.

| Piece | Role |
| --- | --- |
| `ProductSurface` | DEV-only `data-product-ref` on a single element child |
| `attachProductWiki({ router })` | DEV: pick elements, emit page context, apply wiki `navigate` (wraps `bootstrapProductInspect`) |
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

// main.ts (DEV)
attachProductWiki({ router: bindVueRouter(router) });
```

The plugin is a production no-op (`apply: 'serve'`):

1. Discover or start the local service (reuse if the port is in use — multiple Vite apps can share one)
2. Register the current origin and push wiki into the service (Vite `ssrLoadModule`; a JSON directory is the non-Vite fallback)
3. Inject the inspect client and a right dock iframe pointing at the service views page. The splitter lives in the injected dock, not in consumer code

The service serves views (`bootstrapProductViews`) so the React wiki panel does not enter the business production graph, and forwards `viewsChannel` over WebSocket.

- Single app: the plugin may auto-start the service
- Multi-app / explicit: `product-wiki serve --data <path>`

This repo: start one playground at a time (`pnpm dev:react` on `:5102`, `pnpm dev:vue` on `:5103`). The Vite plugin starts or reuses the local service. There is no framework switcher host. `pnpm dev:electron` is only a `BrowserWindow` on `:5102` (or `PRODUCT_WIKI_ELECTRON_URL`); start `pnpm dev:react` first.

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
