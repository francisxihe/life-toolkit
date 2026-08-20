# Desktop 进程与目录分层

## 进程模型

```mermaid
sequenceDiagram
  participant R as render
  participant P as preload
  participant M as main
  participant RC as RouteController

  R->>P: electronAPI REST invoke
  P->>M: ipcRenderer channel REST
  M->>RC: electron-ipc-restful 路由匹配
  RC-->>M: VO 响应
  M-->>P: 标准响应包装
  P-->>R: Promise data
```

| 目录 | 运行环境 | 职责 |
| --- | --- | --- |
| `src/main` | Node（主进程） | 创建窗口、`initIpcRouter` 注册 route-controller |
| `src/preload` | 隔离上下文 | 向 `window.electronAPI` 暴露 REST 风格 API |
| `src/render` | Chromium | React UI、路由、模块 Context |
| `src/service` | Node（主进程侧） | TypeORM、业务 Service、**RouteController（IPC 入口）** |

## render 层约定

- 页面：`render/pages/{domain}/`，Growth 在 `render/pages/growth/`
- 路由：`render/router/`
- 模块状态：使用 `createInjectState`（`render/utils/createInjectState.tsx`），每功能块独立 Provider + hook
- 样式：CSS Modules（`*.module.less`）+ Tailwind，与 `@sue/design-web-react`（前缀 `sue`）配合。按单元素视觉声明条数分流：≤3 优先 Tailwind；3–5 有定制或较长用 Modules，否则 Tailwind；>5 用 Modules。计数不含 `Flex` / `Row` / `Col` 布局 props。页面壳层优先使用 `Flex`（`container="full|fixed|fill"`）。`fixed` 不自动撑满交叉轴：列父加 `w-full`，行父加 `h-full`（对齐已移除的 `FlexibleContainer.Fixed`）。UI 落地细则见项目 skill「框架规范 · React UI规范」
- UI 组件：布局/表单/反馈直接用 `@sue/design-web-react` 公开 API；图标优先 design-web 的 `*Outlined`/`*Filled`，缺省再用 `@ant-design/icons`。禁止再引入 Arco 风格 compat（已移除的 `Typography`/`Icon*`/`Grid`/`Result`/`Steps`/`List` 等 shim）。业务一等能力（`SiteIcon`、`RepeatSelector`、`ContextMenu`）放在 `@/components`；HTTP 错误提示直接用 design-web 的 `message`
- 数据调用：优先 `@true-north/web-service`（Service + Controller + request）→ preload REST
- Electron 桥类型：`@true-north/web-service/electron-types`（preload `import type`；render side-effect import 激活 `Window.electronAPI`）

示例（Context 形态）：

```typescript
export const [GoalDetailProvider, useGoalDetailContext] = createInjectState<{
  PropsType: { children: React.ReactNode };
  ContextType: {
    loading: boolean;
    // ...
  };
}>(() => {
  // 状态与请求编排
});
```

## service 层约定

- 数据库：`service/db/`（`AppDataSource`、SQLite）
- 装饰器：`@business/decorators`（桥接 `electron-ipc-restful`，并保留 description 等元数据）
- **单个模块 IPC/VO 入口**：`*.route-controller.ts`（不再另设 `*.controller.ts` 透传层）
- 注册：`src/main/ipc-handlers.ts` 将各模块 RouteController **Class** 交给 `registerIpcHandlers`（构造器默认注入模块 service 单例）

## 前端页面模块（Growth）

```
render/pages/
├── growth/
│   ├── goal/
│   ├── task/
│   ├── todo/
│   ├── habit/
│   └── components/     # 跨模块详情、列表等
├── expense/
├── dashboard/
├── timer/
└── ...
```

业务规则与模块产品说明见 [ProductWiki · Growth](../../../apps/prototype/product-wiki/growth/README.md)。

## 相关文档

- [data-flow.md](./data-flow.md)
- [development/controller/controller-desktop.md](../development/controller/controller-desktop.md)
