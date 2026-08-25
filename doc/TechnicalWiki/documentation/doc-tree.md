# 文档目录约定

## 命名规范

> [!IMPORTANT]
> 所有交付文档必须遵循以下命名。

- **TDD.md** — Technical Design Document（本版技术设计）
- 版本目录可再放其它技术文件；**不**放 PRD.md

## 层次结构

### 版本级（技术交付落点）

目录名采用 semver 风格（如 `v0.1.0`）。产品需求不在此目录，见 ProductWiki。

```
doc/{version}/
└── TDD.md          # 本版本技术设计（目录可扩展）
```

完整 `doc/` 树：

```
doc/
├── TechnicalWiki/
│   ├── growth/                         # Growth 域代码实现、DTO/VO 和路由入口
│   ├── ai/                             # AI 平台域（Settings/Runner/Capability）
├── {version}/
│   └── TDD.md
└── README.md
```

## 内容分工

| 文档类型 | 主要内容 | 目标读者 |
| --- | --- | --- |
| **ProductWiki** | 功能需求、业务规则、交互语义 | 产品、设计、测试、开发 |
| **TDD.md** | 数据模型、API/IPC、枚举、实现细节 | 开发、架构 |
| **TechnicalWiki** | 长期工程架构与代码规范 | 开发、架构 |

## Wiki 与交付文档

| 层级 | 路径 | 作用 |
| --- | --- | --- |
| 产品 SSOT | [packages/product-wiki/wiki](../../../packages/product-wiki/wiki/README.md) | 产品架构、业务规范 |
| 写法与形状 | [packages/product-server/WIKI.md](../../../packages/product-server/WIKI.md) | ProductWiki 编写规范与 schema |
| 技术 SSOT | [TechnicalWiki/TechnicalWiki.md](../TechnicalWiki.md) | 工程架构、代码规范 |
| 版本交付 | `doc/{version}/`（示例 [v0.1.0 TDD](../../v0.1.0/TDD.md)、[v0.2.0 TDD](../../v0.2.0/TDD.md)） | 本版本 TDD（可扩展） |

域级产品蓝图（如 Growth）见 [packages/product-wiki/wiki/growth](../../../packages/product-wiki/wiki/growth/spec.json)，**不**使用 `doc/growth/` 等独立需求/TDD 目录。

## 写作规范

- [PRD-guide.md](./PRD-guide.md) — 产品需求概述（落点 ProductWiki）
- [TDD-guide.md](./TDD-guide.md)
- [packages/product-server/WIKI.md](../../../packages/product-server/WIKI.md) — ProductWiki 编写规范

## 维护原则

- 产品差异直接改 wiki `spec.json` 并追加 `changelog.json`，不在 `doc/{version}/` 写 PRD
- TDD 引用 TechnicalWiki，不复制全局分层/代码模板全文
- 版本迭代：改 ProductWiki → 写 `doc/{version}/TDD.md` → 代码 → 功能确认后回写 TechnicalWiki
