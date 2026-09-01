# Wiki template

Minimal valid page wiki. Not a complete product. Validate against `@ylib/product-server/wiki.schema.json`.

```json
{
  "id": "catalog.item",
  "kind": "page",
  "title": "条目",
  "parentId": "catalog",
  "route": "/catalog/item",
  "productStatus": "roadmap",
  "views": [
    {
      "id": "list",
      "name": "条目列表",
      "scenario": "浏览条目",
      "productStatus": "roadmap",
      "reference": "catalog.item.view.list",
      "tests": [
        {
          "id": "unique-name",
          "name": "同一目录下条目标题不能重复",
          "reference": "catalog.item.view.list.case.unique-name",
          "rule": "unique-name"
        },
        {
          "id": "empty-title",
          "name": "标题不能为空",
          "reference": "catalog.item.view.list.case.empty-title"
        }
      ]
    }
  ],
  "rules": [
    {
      "id": "unique-name",
      "name": "名称唯一",
      "description": "同一目录下条目标题不能重复。",
      "views": ["list"],
      "reference": "catalog.item.rule.unique-name",
      "productStatus": "roadmap"
    }
  ],
  "references": [
    {
      "id": "catalog.item.overview",
      "title": "概述",
      "body": "条目是目录的基本单位。"
    },
    {
      "id": "catalog.item.view.list",
      "title": "条目列表",
      "body": "浏览并筛选条目。"
    },
    {
      "id": "catalog.item.rule.unique-name",
      "title": "名称唯一",
      "body": "保存时同一目录下不能出现相同标题。"
    }
  ]
}
```
