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
| [plugin-platform.md](./plugin-platform.md) | 一等插件目录、契约与宿主组装 |
| [architecture/overview.md](./architecture/overview.md) | 技术栈与分层总览 |
| [architecture/monorepo-layout.md](./architecture/monorepo-layout.md) | 仓库目录与包职责 |
| [architecture/desktop-layers.md](./architecture/desktop-layers.md) | main / preload / render / service |
| [architecture/data-flow.md](./architecture/data-flow.md) | VO ↔ DTO ↔ Entity 与 IPC 数据流 |

### 文档规范

| 文档 | 说明 |
| --- | --- |
| [documentation/doc-tree.md](./documentation/doc-tree.md) | TDD / 版本目录约定 |
| [documentation/PRD-guide.md](./documentation/PRD-guide.md) | 产品需求概述（落点 ProductWiki） |
| [documentation/TDD-guide.md](./documentation/TDD-guide.md) | 技术设计文档写作规范 |
| `@ylib/product-server` `WIKI.md` | ProductWiki 编写规范 |
| [growth/README.md](./growth/README.md) | Growth 技术基线；原成长聚合页已并入 Home |
| [activity/README.md](./activity/README.md) | 活动卡索引与跨领域采纳事务 |
| [expense/README.md](./expense/README.md) | 记账 SQLite 持久化 |
| [purchase/README.md](./purchase/README.md) | 家庭采购（替换 ERP 演示） |
| [library/README.md](./library/README.md) | 本地网页 Markdown 收藏索引 |
| [ai/README.md](./ai/README.md) | AI 平台域：Capability、收集箱、拆解与 capture workspace |

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
| **ProductWiki** | 产品架构、业务模型、设计规范 | 事实来源；写法见 product-server |
| **TechnicalWiki** | 工程架构、代码分层、实现规范 | TDD 引用，不复制全文 |
| **TDD.md** | 本版本技术设计与 API/数据模型 | 实现规范 → TechnicalWiki |

变更流程（版本迭代）：ProductWiki（`spec.json` + `changelog.json`）→ TDD（本版本实现）→ 代码 → TechnicalWiki（功能确认后回写）。

对本仓库项目文档的新增、修改、删除、移动，Agent 应遵循项目 skill：`TrueNorth文档说明`（`.cursor/skills/TrueNorth文档说明/`）。

---

## 四、顶层文档地图

| 路径 | 用途 |
| --- | --- |
| [packages/product-wiki/wiki/global/spec.json](../../packages/product-wiki/wiki/global/spec.json) | 产品全局 SSOT |
| [doc/TechnicalWiki/TechnicalWiki.md](./TechnicalWiki.md) | 技术全局 SSOT |
| `doc/{version}/`（如 [v0.1.0 TDD](../v0.1.0/TDD.md)、[v0.2.0 TDD](../v0.2.0/TDD.md)） | 本版本 TDD（可再放其它技术文件，不放 PRD） |

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
