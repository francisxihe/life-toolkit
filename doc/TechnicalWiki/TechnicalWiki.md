# True North TechnicalWiki

> 本文件作为 True North 的技术全局入口：Monorepo 布局、Desktop 分层、文档树约定、开发流程与分层代码规范。产品定位与业务规则见 [ProductWiki](../../packages/product-wiki/wiki/global/spec.json)。

---

## 一、概述

True North 采用 **Monorepo**（pnpm workspace + Turbo），当前交付形态为 **Electron 桌面应用**（`apps/desktop`），业务数据本地持久化（TypeORM + SQLite），共享类型与枚举位于 `packages/business`。

Growth 等业务域的产品级约束不在本文重复，参见 [ProductWiki · 全局业务规则](../../packages/product-wiki/wiki/global/spec.json)。

---

## 二、导航

### 架构

| 文档 | 说明 |
| --- | --- |
| [architecture/overview.md](./architecture/overview.md) | 技术栈与分层总览 |
| [architecture/monorepo-layout.md](./architecture/monorepo-layout.md) | 仓库目录与包职责 |
| [architecture/desktop-layers.md](./architecture/desktop-layers.md) | main / preload / render / service |
| [architecture/data-flow.md](./architecture/data-flow.md) | VO ↔ DTO ↔ Entity 与 IPC 数据流 |

### 文档规范

| 文档 | 说明 |
| --- | --- |
| [documentation/doc-tree.md](./documentation/doc-tree.md) | PRD / TDD / README 目录约定 |
| [documentation/PRD-guide.md](./documentation/PRD-guide.md) | 产品需求文档写作规范 |
| [documentation/TDD-guide.md](./documentation/TDD-guide.md) | 技术设计文档写作规范 |
| [documentation/ProductWiki-guide.md](./documentation/ProductWiki-guide.md) | ProductWiki 写作规范 |
| [growth/README.md](./growth/README.md) | Growth 技术基线、路由与产品表面 / 实现缺口 |
| [ai/README.md](./ai/README.md) | AI 平台域（设计基线）：Settings、Runner、Capability、目标拆解与聊天预留 |

### 开发规范

| 文档 | 说明 |
| --- | --- |
| [development/workflow.md](./development/workflow.md) | Desktop 端到端开发流程 |
| [development/entity.md](./development/entity.md) | Entity 规范 |
| [development/vo.md](./development/vo.md) | VO 规范 |
| [development/service.md](./development/service.md) | Service 规范 |
| [development/dto/README.md](./development/dto/README.md) | DTO 总览 |
| [development/repository/README.md](./development/repository/README.md) | Repository 总览 |
| [development/controller/README.md](./development/controller/README.md) | RouteController 总览 |

---

## 三、与 ProductWiki / 交付文档的关系

| 文档类型 | 职责 | 引用关系 |
| --- | --- | --- |
| **ProductWiki** | 产品架构、业务模型、设计规范 | PRD 引用，不复制全文 |
| **TechnicalWiki** | 工程架构、代码分层、实现规范 | TDD 引用，不复制全文 |
| **PRD.md** | 单次需求/版本的功能与交互 | 业务规则 → ProductWiki |
| **TDD.md** | 本版本技术设计与 API/数据模型 | 实现规范 → TechnicalWiki |

变更流程（版本迭代）：PRD/TDD（本版本差异）→ 实现代码 → Wiki（功能入库，沉淀全局）。

对本仓库项目文档的新增、修改、删除、移动，Agent 应遵循项目 skill：`TrueNorth文档说明`（`.cursor/skills/TrueNorth文档说明/`）。

---

## 四、顶层文档地图

| 路径 | 用途 |
| --- | --- |
| [packages/product-wiki/wiki/global/spec.json](../../packages/product-wiki/wiki/global/spec.json) | 产品全局 SSOT |
| [doc/TechnicalWiki/TechnicalWiki.md](./TechnicalWiki.md) | 技术全局 SSOT |
| `doc/{version}/`（如 [v0.1.0](../v0.1.0/)、[v0.2.0](../v0.2.0/)） | 本版本 PRD/TDD（唯一交付落点） |

---

## 五、版本记录

```yaml
changelog:
  - version: 'v1.0'
    date: '2026-07-24'
    highlights:
      - '自 .cursor/rules 迁移建立 TechnicalWiki'
      - '架构描述对齐 apps/desktop 现状'
```

---

> TechnicalWiki 是工程实现的唯一事实来源。与 ProductWiki 冲突时：业务语义以 ProductWiki 为准，代码路径与分层以 TechnicalWiki 为准。
