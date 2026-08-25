# 产品需求概述

True North 不再在 `doc/{version}/` 写独立 PRD。产品需求的事实来源是 ProductWiki；本文件只说明落点、模型与协作边界。写法与 schema 由 `@true-north/product-server` 提供，wiki 包只写内容。

## 落点

| 层级 | 路径 | 职责 |
| --- | --- | --- |
| 形状与写法 | [packages/product-server/WIKI.md](../../../packages/product-server/WIKI.md)、[spec.schema.json](../../../packages/product-server/src/spec.schema.json)、[changelog.schema.json](../../../packages/product-server/src/changelog.schema.json) | 规格形状、检查器约定、如何改 spec |
| 产品细节 | [packages/product-wiki/wiki](../../../packages/product-wiki/wiki/README.md) | 各模块 `spec.json`、根目录 `changelog.json`、`references[].body` |
| 本版实现 | `doc/{version}/TDD.md` | 技术设计；版本目录可再放其它技术文件，不放 PRD |
| 工程规范 | [TechnicalWiki](../TechnicalWiki.md) | 架构、分层、代码约定 |

具体模块内容直接读 wiki，例如 [growth/spec.json](../../../packages/product-wiki/wiki/growth/spec.json)。

## 与 ProductWiki 现状吻合的模型

- 每个模块一份 `spec.json`。树靠 `parentId` 反向查找，**没有 `children` 字段**。
- 讲解正文在 `references[].title` / `references[].body`（Markdown）。
- `views` / `rules` 用 `reference` 指向一篇文档；`entities` 是产品对象，不是检查器文档节点。
- 变更记录在 wiki 根 `changelog.json`，不在 `doc/` 另写版本 PRD。
- 产品状态：`roadmap`（规划中）、`released`（已发布）、`deprecated`（已废弃）。
- 表面覆盖：`none`（未钉）/ `complete`（已用 `ProductSurface` / `productRef()` 钉上）。没有「部分实现」；只落地一部分时拆成更细的 view/rule。
- 阅读与导出在 desktop DEV 检查器。修改后运行 `product-wiki:sync` 与 `product-wiki:check`。

## 边界

- Wiki 管产品语义（用户价值、对象、流程、规则、路线图）。
- `doc/{version}/TDD.md` 管本版实现（数据模型、IPC、落地顺序）。
- TechnicalWiki 管长期工程架构。Wiki 不写 API、IPC、DTO/VO、组件名或仓库结构。

版本迭代：直接改对应 `spec.json` 并追加 `changelog.json`，再写本版 TDD 并实现；功能确认后回写 TechnicalWiki 现状。
