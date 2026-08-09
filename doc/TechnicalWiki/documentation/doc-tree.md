# 文档目录约定

## 命名规范

> [!IMPORTANT]
> 所有交付文档必须遵循以下命名。

- **PRD.md** — Product Requirements Document（产品需求）
- **TDD.md** — Technical Design Document（技术设计）
- **README.md** — 版本说明 / 导航（可选）

## 层次结构

### 版本级（唯一交付落点）

目录名采用 semver 风格（如 `v0.1.0`）。每个版本目录包含该版本的 PRD/TDD：

```
doc/{version}/
├── README.md       # 可选：版本说明与导航
├── PRD.md          # 本版本产品需求
└── TDD.md          # 本版本技术设计
```

完整 `doc/` 树：

```
doc/
├── TechnicalWiki/
│   ├── growth/                         # Growth 域代码实现、DTO/VO 和路由入口
│   ├── ai/                             # AI 平台域（Settings/Runner/Capability）
├── {version}/
│   ├── README.md
│   ├── PRD.md
│   └── TDD.md
└── README.md
```

## 内容分工

| 文档类型 | 主要内容 | 目标读者 |
| --- | --- | --- |
| **PRD.md** | 功能需求、业务规则、UI、交互流程 | 产品、设计、测试 |
| **TDD.md** | 数据模型、API/IPC、枚举、实现细节 | 开发、架构 |
| **README.md** | 快速概览、导航 | 所有角色 |

## Wiki 与交付文档

| 层级 | 路径 | 作用 |
| --- | --- | --- |
| 产品 SSOT | [apps/prototype/product-wiki](../../../apps/prototype/product-wiki/README.md) | 产品架构、业务规范 |
| 技术 SSOT | [TechnicalWiki/TechnicalWiki.md](../TechnicalWiki.md) | 工程架构、代码规范 |
| 版本交付 | `doc/{version}/`（示例 [v0.1.0](../../v0.1.0/PRD.md)、[v0.2.0](../../v0.2.0/PRD.md)） | 本版本 PRD/TDD |

域级产品蓝图（如 Growth）见 [apps/prototype/product-wiki/growth](../../../apps/prototype/product-wiki/growth/README.md)，**不**使用 `doc/growth/` 等独立 PRD/TDD 目录。

## 写作规范

- [PRD-guide.md](./PRD-guide.md)
- [TDD-guide.md](./TDD-guide.md)
- [ProductWiki-guide.md](./ProductWiki-guide.md)

## 维护原则

- PRD 引用 ProductWiki，不复制全局业务段落
- TDD 引用 TechnicalWiki，不复制全局分层/代码模板全文
- 版本迭代：在 `doc/{version}/` 写 PRD/TDD → 代码 → 功能入库后回写 Wiki
