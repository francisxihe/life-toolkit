# True North 文档地图

| 文档 | 路径 | 说明 |
| --- | --- | --- |
| 产品 Wiki | [apps/prototype/product-wiki](../apps/prototype/product-wiki/README.md) | 与原型同仓维护的产品定位、业务域与设计规范 |
| 技术 Wiki | [TechnicalWiki/TechnicalWiki.md](./TechnicalWiki/TechnicalWiki.md) | Monorepo、Desktop 分层、代码规范 |
| 版本交付 | [v0.1.0](./v0.1.0/PRD.md) · [v0.2.0](./v0.2.0/PRD.md) | 交付文档位于 `doc/{version}/`（PRD + TDD） |
| AI 技术域 | [TechnicalWiki/ai](./TechnicalWiki/ai/README.md) | AI 平台与 Capability 设计基线（`status: design`） |

协作约定：在 `doc/{version}/` 写 PRD/TDD 表达本版本差异并引用 Wiki；实现代码；功能入库后回写 ProductWiki / TechnicalWiki。

对本仓库项目文档的新增、修改、删除、移动，Agent 应遵循项目 skill：`TrueNorth文档说明`（`.cursor/skills/TrueNorth文档说明/`）。
