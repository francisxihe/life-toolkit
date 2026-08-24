# True North ProductWiki

ProductWiki 是 True North 的产品事实来源。每个模块的 `spec.json` 定义可校验的产品对象、字段、视图、规则、生命周期，以及检查器讲解用的引用正文。变更记录在 `changelog.json`。规格形状由实现侧 `src/spec.schema.json` 与 `src/changelog.schema.json` 约束，本目录只写内容。

阅读与导出在 desktop DEV 检查器中进行；不要把 Wiki 正文打进生产包。修改规格后运行：

```bash
pnpm --filter @true-north/product-wiki product-wiki:sync
pnpm --filter @true-north/product-wiki product-wiki:check
```

工程实现、接口和数据传输模型见 [TechnicalWiki](../../../doc/TechnicalWiki/TechnicalWiki.md)。
