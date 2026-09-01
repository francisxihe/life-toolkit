# True North ProductWiki

ProductWiki 是 True North 的产品事实来源。本目录只写内容：每个节点一份 `spec.json`（视图、规则、产品状态与讲解正文），根目录 `changelog.json` 记录变更。

形状与写法遵循 `@ylib/product-server`：

- 编写规范：`@ylib/product-server` 包内 `WIKI.md`
- schema：`@ylib/product-server/wiki.schema.json`、`@ylib/product-server/changelog.schema.json`

阅读与导出在 desktop DEV 检查器中进行；不要把 Wiki 正文打进生产包。修改 `spec.json` / `changelog.json` 后运行：

```bash
pnpm --filter @true-north/product-wiki product-wiki:sync
pnpm --filter @true-north/product-wiki product-wiki:check
```

工程实现、接口和数据传输模型见 [TechnicalWiki](../../../doc/TechnicalWiki/TechnicalWiki.md)。
