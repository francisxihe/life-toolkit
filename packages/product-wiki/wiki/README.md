# True North ProductWiki

ProductWiki 是 True North 的产品事实来源。本目录只写内容：每个模块一份 `spec.json`（产品对象、字段、视图、规则、生命周期与检查器讲解正文），根目录 `changelog.json` 记录变更。

形状与写法遵循 `@true-north/product-server`：

- [编写规范](../../product-server/WIKI.md)
- [spec.schema.json](../../product-server/src/spec.schema.json)
- [changelog.schema.json](../../product-server/src/changelog.schema.json)

阅读与导出在 desktop DEV 检查器中进行；不要把 Wiki 正文打进生产包。修改规格后运行：

```bash
pnpm --filter @true-north/product-wiki product-wiki:sync
pnpm --filter @true-north/product-wiki product-wiki:check
```

工程实现、接口和数据传输模型见 [TechnicalWiki](../../../doc/TechnicalWiki/TechnicalWiki.md)。
