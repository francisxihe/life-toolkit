# Changelog template

Minimal valid changelog. Not a product history. Validate against `@ylib/product-server/changelog.schema.json`. Empty changelog is `{ "changes": [] }`.

```json
{
  "changes": [
    {
      "version": "v0.1.0",
      "date": "2026-08-25",
      "event": "introduced",
      "summary": "新增条目列表。",
      "productStatus": "roadmap",
      "feature": {
        "key": "catalog.item:view:list",
        "scope": "view",
        "wikiId": "catalog.item",
        "wikiTitle": "条目",
        "name": "条目列表",
        "reference": "catalog.item.view.list"
      }
    }
  ]
}
```

`feature.scope` is `module` | `view` | `rule` only.
