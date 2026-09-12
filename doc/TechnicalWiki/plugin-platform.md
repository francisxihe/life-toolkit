# Plugin Platform

```yaml
document_meta:
  status: 'active'
  last_updated: '2026-09-11'
```

The plugin kernel is a serializable v2 contract plus instance-owned hosts. Built-in plugins load in-process today; a future isolated loader can return RPC/iframe proxies against the same contract. Manifests never contain functions.

## Contract

- `@true-north/plugin-contract` is the JSON-safe schema: plugin id, catalog metadata, requested host capabilities, and contribution maps keyed by local id.
- API version is `2.0`. Hosts namespace contribution ids from `pluginId` + local id (`contributionKey` / `namespacedId`).
- Entity refs are `{ pluginId, entityType, entityId }`. Legacy domain mapping stays in the desktop host only.
- Today snapshots are generic `metric` | `list` | `timer` sections. New plugins do not add SDK fields.
- Storage capability is `self-managed`. The contract does not depend on React, TypeORM, Electron, `@true-north/vo`, or business enums.

## SDK

- `@true-north/plugin-sdk` re-exports the contract plus `defineMainImplementation` / `defineRendererImplementation`.
- Author surfaces: `./main`, `./renderer`, optional `./sqlite`. The root barrel has no bind helpers, React hooks, TypeORM handles, or first-party plugin ids.
- Runtime modules bind implementations to manifest keys. `reconcileMain` / `reconcileRenderer` fail boot on missing, extra, or drifted keys (including controller `routePrefix`, e.g. `/trackTime` vs `/track-time`).

## Host

- `apps/desktop/src/plugin/desktop-plugins.ts` is the only Node-safe first-party registry of manifests, package ids, and wiki roots.
- Main and renderer each keep a typed loader map (`main-loaders.ts`, `renderer-loaders.ts`) that must be an exact `Record<FirstPartyPluginId, loader>`.
- `DesktopPluginHost` owns catalog, scoped storage, AI registries, Activity, IPC routes, activation, and dispose. Context is built only from requested capabilities.
- Runtime loads into a temporary registry, activates in dependency order, reconciles, then publishes IPC/AI/Activity. Failure rolls back in reverse. Main-process boot failure exits before IPC/windows. Quit awaits a single `host.dispose()`.
- Renderer boot returns a `RendererPlatform` instance provided through React. Boot failure shows an error page. `PluginStage` wraps each plugin in an ErrorBoundary; unknown plugins render 404.

## First-party plugins

`growth`, `expense`, `purchase`, and `library` are independent packages. Each keeps a single `src/plugin.ts` manifest. AI session, Workbench, and Activity are host platforms, not plugins.

Shared UI lives in `@true-north/plugin-ui`. Plugins must not import `@/`, desktop source, or central domain modules from `@true-north/web-service`.

## Storage

Each plugin receives an exclusive directory (`plugin-data/{pluginId}` in DEV, `{userData}/plugins/{pluginId}` in production) and exposes processed records through `PluginQueryPort`. First-party plugins open their own SQLite in that space. Host DataSource keeps User, AI, and Activity.

## Pages and shell

User entry is `/plugins`. Sidebar is AI + Plugins. Today/Activity aggregation is a host section on the plugin center. Compatibility redirects remain for `/plugins/activity`, `/activity/*`, and former domain paths.

Host commands include `host.workbench.open` and `host.browser.open`. Growth registers `growth.open-focus` as a renderer host action.

## Deferred

Disk discovery/install/update, package signatures, permission UI, utility-process/iframe sandbox, and hot unload. This kernel's serializable manifest, capability-scoped context, and loader maps are the seams for that work.
