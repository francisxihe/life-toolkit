# ProductWiki 编写规范

本包约束 ProductWiki 的规格形状与写法。Wiki **内容**写在消费方（True North 仓库里是 `packages/product-wiki/wiki/`），不放在本包内。

ProductWiki 是产品事实来源，不是技术设计文档。它用于维护用户价值、产品对象、业务流程、交互语义、规则、路线图与 desktop 是否实现。规格形状由 [spec.schema.json](./src/spec.schema.json) 与 [changelog.schema.json](./src/changelog.schema.json) 约束。完整产品表面只在 `apps/desktop`；DEV 用主窗口右侧吸附的检查器阅读与导出，不把 Wiki 正文打进生产包。检查器实现在本包，desktop 承接层把 `productWiki` 数据注入后再激活。

## 内容来源

每个模块只有一份 `spec.json`。

- 结构化事实：模块、实体字段、枚举、视图、规则、产品状态、是否实现。
- 讲解正文：`references[].title` 与 `references[].body`（`body` 为 Markdown 字符串，供检查器渲染）。
- 变更记录：根目录 `changelog.json`。

产品状态使用 `roadmap`（规划中）、`released`（已发布）、`deprecated`（已废弃）。是否实现使用 `none`（未实现）、`complete`（实现），表达 desktop 是否已用 `ProductSurface` / `productRef()` 钉上对应 view/rule。没有「部分实现」：若只落地一部分能力，应拆成更细的 view/rule，已钉的标 `complete`，未做的标 `none` 放到下一期。产品基线不是产品发布，不能仅因界面存在就标记为 `released`。

页面编辑尚未提供，当前仍直接修改 `spec.json` / `changelog.json`。阅读与 Markdown / JSON 导出在检查器中完成。

规格模型（`parentId` 成树、无 `children` 字段）见 [README.md](./README.md)。

## 变更流程

1. 修改对应模块的 `spec.json`，并为受影响对象在 `changelog.json` 追加变更记录。
2. 把产品语义写进对应 `references[].body`；不要在正文里复制字段、视图或规则表格（检查器导出模块时会从规格组装）。
3. 在 desktop 页面组装层用 `ProductSurface`（`@true-north/product-server`）钉 view 与有独立落点的 rule，引用 ID 用 `productRef()`（`@true-north/product-wiki`）；复用组件不要 `import productRef`。
4. 执行 `pnpm --filter @true-north/product-wiki product-wiki:sync` 生成引用类型。
5. 执行 `pnpm --filter @true-north/product-wiki product-wiki:check` 校验 Schema、引用、生命周期与 desktop 表面。

## 内容边界

ProductWiki 不包含 API、IPC、DTO/VO、控制器、数据库实体、组件名或工程架构。上述内容应从当前代码重建到 [TechnicalWiki](../../doc/TechnicalWiki/TechnicalWiki.md)。

可讲解区域通过页面组装层的 `productRef()` 写入 `data-product-ref`。检查器只接收 productRef 祖先链与当前路由，在主窗口中间栏解析 Wiki，左侧是业务页、右侧是主窗口 DevTools，三者互不覆盖。
