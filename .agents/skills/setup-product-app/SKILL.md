---
name: setup-product-app
description: >-
  Splits a product host so the business UI stays independent of ProductWiki
  inspect/views, wires ProductSurface, attachProductWiki / bootstrapProductInspect,
  ProductRouterPort, and the ProductWiki service (Vite plugin + Node service).
  Use when scaffolding a product app, adding the DEV wiki panel, connecting wiki
  navigation to the consumer router, or choosing the views transport.
---

# Setup product app

The business frontend **is** the product surface, but the **wiki/views layer must stay independent**. Users must not receive product-design information mixed into the business page. The ProductWiki service provides that layer so you do not build an outer host app.

## Architecture (read this)

Full wiring, channel events, and what not to copy from the playground: [host-architecture.md](host-architecture.md).

## Constraints

- **Default:** Vite plugin `@ylib/product-server/service/vite` + Node service (`product-wiki serve`). Plugin is DEV-only. Do not ship views in the same **production** bundle as the business page.
- **Escape hatch:** Wujie / iframe `postMessage` two-app host. Not the template.
- **DEV only:** `attachProductWiki` / `bootstrapProductInspect` and `bootstrapProductViews`. `ProductSurface` does not stamp `data-product-ref` in production.
- Wiki **content** (`ProductWikiData`) is owned by the consumer, not `@ylib/product-server`.
- Do not put `productRef` on route meta. Sync by **path**: `wiki.route` is the page (home is `wiki.route: '/'`). Parallel router entries are sibling pages; nested `view.route` is only for a router child path. A view with no inherited route is global DOM.
- `product-server` must not depend on `vue-router` / `react-router`. Bind via `ProductRouterPort` only.
- `launchApp(name)` is reserved. Do not implement launching other local apps.

## Content app (business page)

1. Wrap explainable regions with `ProductSurface` and `productRef()` from `@ylib/product-server`.
2. Adapt the consumer router to `ProductRouterPort` (`getPath` / `subscribe` / `navigate`).
   - Vue: `bindVueRouter(router)` from `@ylib/product-surface-vue/router`.
   - React: `bindReactRouter(router)` or `ProductRouterSync` from `@ylib/product-surface-react/router`.
3. Add `productWiki({ data: './src/wiki.ts', playwright: true })` to `vite.config.ts` (or `playwright: 'e2e'`). The plugin installs `productWikiInspect` and the dock iframe. `playwright: true` POSTs `{ root, origin }` to `/api/playwright` so the tests tab can spawn `npx playwright test` from the matching consumer.
4. Call `attachProductWiki({ router })` in DEV. If `router` is omitted, Inspect falls back to `location.hash` / `pathname`.
5. Page paths in the wiki must match the consumer **router tree** (`/`, `/spec`, …), not a hash prefix like `#/spec`, and not URL string nesting. `kind: page` uses `wiki.route`. The home page is `kind: page` with `wiki.route: '/'`. `/overview` beside `/` in the router is a sibling page, not a child of `/`. `global` has no `wiki.route` and only holds global DOM. Nested `view.route` values must match nested router `children` paths. Page DOM omits `view.route` and inherits the nearest wiki `route`. Global DOM inherits no route. `kind: dom` has no `route` and must hang under a `page` or `global`. A view must have `ProductSurface` + `productRef`. Page overview is anchored by `wiki.route`.

## Views

The Node service mounts `bootstrapProductViews` on its views page. The plugin dock iframes that page.

Do not put the React wiki panel in the business production graph.

## Channel

Use `viewsChannel` from `@ylib/product-server/channel` (`selection`, `page-context`, `navigate`, `run-tests`, …). Default transport: WebSocket (Node service). Wiki tree clicks with a concrete path call `sendNavigate`; a DOM view (no inherited route, or inherited route equal to the current page) or a wiki whose path equals the current page stays wiki-only. The tests tab sends `runTests`; overlay「运行测试」sends `openTests`.

## Do not

- Treat this repo’s playground as a library to import.
- Monkey-patch the router or write `productRef` into route meta.
- Bundle views/inspect into the production business page.
