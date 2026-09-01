---
name: write-product-wiki
description: >-
  Writes ProductWiki current-state documents and changelogs as product facts
  (not tech docs): parentId trees, required overviews, wiki.kind global | page |
  dom, wiki.route required on page and forbidden on global/dom, view.route or
  inherited wiki.route as page DOM, no inherited route as global DOM, rules as
  wiki-level product constraints bound by view.id (not tree children, not
  entities/DTOs), productStatus on Wiki, anchored views (ProductSurface +
  productRef; rules are prose, not pinned or inspectable), optional
  view.tests[] for Playwright grep tags, and versioned changelog snapshots.
  Use when adding or editing wikis, changelog.json, ProductWiki pages, views,
  rules, tests, or product references.
---

# Write ProductWiki

ProductWiki records **product facts**, not engineering docs. Do not write API, IPC, DTO/VO, component names, field/enum tables, or architecture into wikis. There is no `entities` field.

- **`wikis`**: current product state
- **`changelog`**: changes (`{ changes: [] }` when empty)

Canonical shapes: `@ylib/product-server/wiki.schema.json` and `@ylib/product-server/changelog.schema.json`. Minimal valid examples only: [wiki-template.md](wiki-template.md), [changelog-template.md](changelog-template.md). Follow `@ylib/product-server` `WIKI.md` for writing rules.

## Tree

- One wiki object per node. Tree via `parentId`. **No `children` field.**
- Every wiki needs `{id}.overview` in `references`.
- `kind: page` requires `wiki.route` (the page path). `kind: global` has no route (product root, not the home page). Home is `kind: page` with `wiki.route: '/'`. `kind: dom` has no route and must have `parentId` pointing at a `page` or `global` (in-page DOM vs global DOM).
- Align `wiki.route` / `parentId` with the **consumer router tree**, not URL string prefixes. `/A` and `/A/B` are parent/child only when the router nests B under A. Parallel routes are sibling `kind: page` wikis with the same `parentId`. Do not treat `/overview` as a child of `/` just because `/` prefixes every path.
- A view with `route`, or one that inherits the nearest ancestor `wiki.route`, is page DOM for that path. Nested `view.route` on a wiki that has `route` must be that page's true nested child path in the router (do not copy `wiki.route` onto the view).
- A view that inherits no route is global DOM. Match it only by `productRef` from `ProductSurface`.
- The current-page wiki tree lists views for the current path and `kind: dom` children of that page. Global DOM views and `kind: dom` children of `global` appear when the product root is selected, not on other pages. Wiki identity is router path + `productRef`, not component reuse. Do not list another path's view as a second entry on this page.
- **Rules are not tree nodes.** Do not nest a rule under a view in the DOM tree, and do not invent a view just so a rule appears in the left nav.

## Anchors

Explainable regions must be pinned. Missing pins are wiki/tagging errors.

- **view** (including “add document node”): must have `ProductSurface` + `productRef(view.reference)`. `data-product-ref` pins **views only**.
- **page overview**: the anchor is `wiki.route` (the page is the prototype). Do not wrap another Surface around the page.
- **global overview**: opened from the panel root, not a DOM document node.
- **rule**: product prose (`name` + `description`). Not in the tree, not inspectable, **do not** wrap with `ProductSurface`. Bind with `rule.views` to already-pinned views. Do not write body-only documents with nowhere to point.

Write prototype and wiki together, or prototype first. Hand pure-docs ideas to an agent that changes the page (`ProductSurface`) and the wiki in the same pass. Do not write an unpinned wiki first.

## Views vs rules

| | **view** | **rule** |
| --- | --- | --- |
| What | A surface or scenario the user can point at | A named product constraint (must / must not / how it behaves) |
| Tree | Router column if it has `view.route`; otherwise DOM column | Not in the tree |
| Open | Click the tree, or inspect a pinned `productRef` | Export 规则索引; not inspectable |

Write a **view** when it is a distinct region or nested route. Write a **rule** when it is a constraint, not a new screen. One constraint that applies on several surfaces is **one** rule with multiple `views` ids — do not duplicate the document.

## Tests

`WikiView.tests[]` is the structured case list for that view. Playwright files are the executable semantics; do not parse `rule.description`.

- Required: `id`, `name`, `reference` — typical `reference`: `{wikiId}.view.{viewId}.case.{id}`
- Optional: `rule` — this wiki's `rule.id`. Omit when the case is finer than any named rule (still required if the constraint lives only in the view body)
- Deprecated views are skipped. Missing `rule` ids fail `wikiKindIssues`
- Consumer Playwright tags the case `reference` and locates the host with `data-product-ref~="${PRODUCT_WIKI_VIEW}"`. Register the consumer root with `productWiki({ data, playwright: true })` (or a path). Do not add Playwright to the package `pnpm test`

## Rules

A wiki's `rules` array is that node's constraint pool (page-level or domain-level, same as the wiki). Bind to surfaces with ids; do not model objects or DTOs.

Shape (`wiki.schema.json` `$defs.rules`):

- Required: `id`, `name`, `description`, `reference`, `productStatus`
- Optional: `views` — list of **this wiki's** `view.id` values (many-to-many). Empty or omitted means unbound.
- `reference` must exist in `references[]`. Typical id: `{wiki.id}.rule.{rule.id}`.
- Do **not** write `entities` or field tables.

Changelog: `scope: "rule"`, `feature.key` `{wikiId}:rule:{rule.id}`, optional `feature.reference` = the rule's `reference`.

## Status

| Field | Values | Means |
| --- | --- | --- |
| `productStatus` | `roadmap` / `released` / `deprecated` | Product lifecycle on the Wiki (and as a changelog snapshot after that change) |

Existing UI is not a release; do not mark `released` just because a screen exists. `deprecated` leaves navigation.

## Body

Write semantics in `references[].body`. Do not copy view / rule tables into the prose; the views panel rebuilds those from the wiki on export.

## Changelog

Do not auto-bump versions. The user must name the version; otherwise write into the latest existing one.

- User names a version (`v0.1.0`, "开 0.1.0"): use that `vX.Y.Z`. If changelog has no such version, this starts it; if it exists, append to it.
- User does not name a version: do **not** increment patch/minor. Write changelog rows at the current latest version (the semantically greatest `vX.Y.Z` already in changelog).
- Changelog is empty (v0.0.0 baseline): there is no latest version. Unversioned edits change wiki bodies only — do not invent a version or add changelog rows. To start versioning, the user must explicitly give the first version (for example v0.0.1).

When a version is in play, any wiki change needs a changelog row: `vX.Y.Z`, `date`, `event`, and a `feature` snapshot (`key`, `scope`, `wikiId`, `wikiTitle`, `name`, optional `parentName` / `reference`).

Events: `baseline` | `introduced` | `changed` | `released` | `deprecated` | `removed`.

`feature.scope` is only `module` | `view` | `rule`.
