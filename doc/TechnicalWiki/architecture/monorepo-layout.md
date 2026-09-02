# Monorepo 布局

## 根目录

```
true-north/
├── apps/
│   └── desktop/              # Electron 应用（唯一产品表面）
├── packages/
│   ├── business/             # vo、enum、web-service（含 request / electron-types）
│   ├── common/               # 通用工具
│   ├── common-web/           # Web 通用能力
│   ├── components/           # 可复用组件
│   ├── dev-lab/              # DEV Lab：采集器、协议、dock 与面板 UI
│   └── product-wiki/         # 产品 SSOT 数据
├── doc/
│   ├── TechnicalWiki/        # 技术 Wiki
│   └── {version}/            # 版本 TDD 等技术文件（如 v0.1.0/；不放 PRD）
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## apps/desktop

```
apps/desktop/src/
├── main/           # Electron 主进程
├── preload/        # preload 脚本
├── render/         # React 渲染进程（pages、router、components）
├── dev/            # DEV 薄入口（Lab.html；ProductWiki 由插件注入）
├── service/        # 本地业务与数据库
│   ├── db/         # TypeORM 数据源、BaseRepository
│   ├── growth/     # 个人成长域模块
│   ├── users/
│   └── common/
└── config/
```

Growth 模块目录（每个模块一套垂直切片）：

```
service/growth/{module}/
├── {module}.entity.ts
├── dto/
├── {module}.repository.ts
├── {module}.service.ts
├── {module}.route-controller.ts   # VO 边界 + IPC REST（唯一 Controller）
└── index.ts
```

模块：`goal`、`task`、`todo`、`habit`、`track-time` 等。不再维护 IPC 透传 `*.controller.ts`。

渲染层对应：`render/pages/growth/{module}/` 及 `render/pages/growth/components/`。

## packages/business

| 子包 | 职责 |
| --- | --- |
| `vo` | 前后端/IPC 边界类型（`@true-north/vo`） |
| `enum` | 业务枚举（`@true-north/enum`） |
| `web-service` | 渲染层调用封装（Service / Mapping / toast）+ HTTP Controller（路径对齐 route-controller） |

主进程装饰器在 `apps/desktop/src/service/decorators`（`@business/decorators`），桥接 `electron-ipc-restful`。

## 包管理

- 包管理器：pnpm，`workspace:*` 引用内部包
- 构建编排：Turbo

## 相关文档

- [overview.md](./overview.md)
- [development/workflow.md](../development/workflow.md)
