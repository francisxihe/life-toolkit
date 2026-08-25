# True North 文档地图

| 文档 | 路径 | 说明 |
| --- | --- | --- |
| 产品 Wiki | [packages/product-wiki/wiki](../packages/product-wiki/wiki/README.md) | desktop 产品事实来源：定位、业务域与设计规范 |
| 编写规范 | [packages/product-server/WIKI.md](../packages/product-server/WIKI.md) | ProductWiki 形状与写法（schema 同包） |
| 技术 Wiki | [TechnicalWiki/TechnicalWiki.md](./TechnicalWiki/TechnicalWiki.md) | Monorepo、Desktop 分层、代码规范 |
| 版本交付 | [v0.1.0/TDD.md](./v0.1.0/TDD.md) · [v0.2.0/TDD.md](./v0.2.0/TDD.md) | 本版技术设计位于 `doc/{version}/`（可再放其它技术文件，不放 PRD） |
| AI 技术域 | [TechnicalWiki/ai](./TechnicalWiki/ai/README.md) | AI 平台与 Capability 设计基线（`status: design`） |

协作约定：产品差异直接改 ProductWiki（`spec.json` + `changelog.json`）；在 `doc/{version}/` 写 TDD；实现代码；功能确认后回写 TechnicalWiki。

对本仓库项目文档的新增、修改、删除、移动，Agent 应遵循项目 skill：`TrueNorth文档说明`（`.cursor/skills/TrueNorth文档说明/`）。
