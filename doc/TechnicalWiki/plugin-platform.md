# Plugin Platform

```yaml
document_meta:
  status: 'active'
  last_updated: '2026-09-11'
```

First-party plugins are assembled at build time from an explicit host catalog. There is no import-side-effect registration.

## Catalog

- Host catalog (`apps/desktop/src/plugin/catalog.ts` and `apps/desktop/src/render/plugin/catalog.ts`) is the only place allowed to import plugin `./manifest`, `./main`, and `./renderer`.
- Plugins may depend on each other's `./contract` only.
- Manifests are serializable (`@true-north/plugin-sdk`). Runtime contributions bind after catalog validation.
- There is no required plugin. Optional domains (`growth`, `expense`, `purchase`, `library`) are independent packages. AI session, Workbench, and Activity are host platforms, not plugins.

## Storage

Public protocol is storage-agnostic: `host-shared-transactional` | `host-isolated-sqlite` | `self-managed`. It does not expose TypeORM `EntityManager`.

The host gives each plugin an exclusive directory (`plugin-data/{pluginId}` in DEV, `{userData}/plugins/{pluginId}` in production) and reads processed records through `PluginQueryPort` (`get` / `list`). First-party plugins are `self-managed`: they open their own SQLite (or another backend) inside that space, run their own migrations, and copy leftover tables from the former shared host DB on first launch. Host DataSource keeps only User, AI, and Activity.

`host-shared-transactional` and `host-isolated-sqlite` remain in the capability enum but are not used by first-party plugins.

## Pages and shell

User entry is `/plugins` (plugin center). Sidebar is AI + Plugins. Activity aggregation is a section on the plugin center, not a catalog plugin. Compatibility redirects remain for `/plugins/activity`, `/activity/*`, and `/growth/*` (and expense/purchase/library).
