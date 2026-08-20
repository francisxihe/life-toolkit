# ProductWiki 编写规范

ProductWiki 位于 `packages/product-wiki/wiki/`，是产品事实来源，不是技术设计文档。它用于维护用户价值、产品对象、业务流程、交互语义、规则、路线图与 desktop 表面覆盖情况。完整产品表面只在 `apps/desktop`；DEV 用主窗口右侧吸附的检查器讲解，不把 Wiki 正文打进生产包。

## 双层内容

每个模块由 `spec.json` 和 `README.md` 组成。

- `spec.json` 是结构化来源：模块、实体字段、枚举、视图、规则、引用、产品状态、表面覆盖度与每个对象的变更记录。
- `README.md` 是叙事来源：背景、决策、流程和交互说明。每个被产品定位的章节必须有唯一的 `<!-- product-ref: ... -->` 标记。
- README 中的 `product-wiki:managed` 区块由脚本生成，禁止手工修改。

产品状态使用 `roadmap`、`released`、`deprecated`；表面覆盖度使用 `none`、`partial`、`complete`，表达 desktop 是否已用 `ProductSurface` / `productRef()` 钉上对应 view/rule。产品基线不是产品发布，不能仅因界面存在就标记为 `released`。

## 变更流程

1. 修改对应模块的 `spec.json`，并为受影响对象追加变更记录。
2. 在 README 的唯一引用段落补充产品语义；不要复制字段、视图或规则表格。
3. 在 desktop 页面组装层用 `ProductSurface` 钉 view 与有独立落点的 rule；复用组件不要 `import productRef`。
4. 执行 `pnpm --filter @true-north/product-wiki product-wiki:sync` 生成受管区块和引用类型。
5. 执行 `pnpm --filter @true-north/product-wiki product-wiki:check` 校验 Schema、引用、生命周期、生成内容与 desktop 表面。

## 内容边界

ProductWiki 不包含 API、IPC、DTO/VO、控制器、数据库实体、组件名或工程架构。上述内容应从当前代码重建到 [TechnicalWiki](../TechnicalWiki.md)，并从产品 README 链接过去。

可讲解区域通过页面组装层的 `productRef()` 写入 `data-product-ref`。检查器只接收 productRef 祖先链与当前路由，在主窗口中间栏解析 Wiki，左侧是业务页、右侧是主窗口 DevTools，三者互不覆盖。
