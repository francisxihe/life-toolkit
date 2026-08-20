# ProductWiki 编写规范

ProductWiki 位于 `apps/prototype/product-wiki/`，是产品事实来源，不是技术设计文档。它用于维护用户价值、产品对象、业务流程、交互语义、规则、路线图与原型覆盖情况。

## 双层内容

每个模块由 `spec.json` 和 `README.md` 组成。

- `spec.json` 是结构化来源：模块、实体字段、枚举、视图、规则、引用、产品状态、原型覆盖度与每个对象的变更记录。
- `README.md` 是叙事来源：背景、决策、流程和交互说明。每个被原型定位的章节必须有唯一的 `<!-- product-ref: ... -->` 标记。
- README 中的 `product-wiki:managed` 区块由脚本生成，禁止手工修改。

产品状态使用 `roadmap`、`released`、`deprecated`；原型覆盖度使用 `none`、`partial`、`complete`。原型基线不是产品发布，不能仅因界面存在就标记为 `released`。

## 变更流程

1. 修改对应模块的 `spec.json`，并为受影响对象追加变更记录。
2. 在 README 的唯一引用段落补充产品语义；不要复制字段、视图或规则表格。
3. 执行 `pnpm --filter true-north-prototype product-wiki:sync` 生成受管区块和引用类型。
4. 执行 `pnpm --filter true-north-prototype product-wiki:check` 校验 Schema、引用、生命周期、生成内容与 fixtures。

## 内容边界

ProductWiki 不包含 API、路由、DTO/VO、控制器、数据库实体、组件名或工程架构。上述内容应从当前代码重建到 [TechnicalWiki](../TechnicalWiki.md)，并从产品 README 链接过去。

原型的可交互元素通过 `productRef()` 写入 `data-product-ref`。检查器使用规格和唯一 Markdown 标记解析说明，因此不得依赖标题文案或为多个对象复用同一段落。
