# @true-north/product-server

产品规格引擎与 DEV 检查器。本包自持规格形状、解析、导航和面板实现；Wiki **内容**由消费方注入，不放在本包内。

```bash
pnpm --filter @true-north/product-server test
```

## 职责

- 约束 `spec.json` / `changelog.json` 的形状（`src/spec.schema.json`、`src/changelog.schema.json`）
- 提供 ProductWiki 编写规范（[WIKI.md](./WIKI.md)）
- 把 `ProductRef` 解析成可渲染的文档（`createWikiRuntime`）
- 按路由和 DOM `data-product-ref` 选中当前讲解
- DEV 检查器面板：面包屑、左栏、正文、导出

Wiki **内容**由消费方撰写。不负责：desktop 路由表、生产 UI。

## 公开入口

```ts
import { ProductSurface, createWikiRuntime } from '@true-north/product-server';
import { bootstrapProductInspectorBridge } from '@true-north/product-server/inspector/bridge';
import { bootstrapProductInspectorPanel } from '@true-north/product-server/inspector/panel';
```

消费方提供 `ProductWikiData`（`specs` + `history`），宿主页面钉 `ProductSurface`，检查器进程用 `bootstrapProductInspectorPanel` 挂载面板。

## 规格模型

每份 spec 是一个节点。树**没有 `children` 字段**，靠 `parentId` 反向查找。

| 字段 | 作用 |
| --- | --- |
| `id` / `kind` / `title` | 节点身份。`kind` 为 `global` \| `domain` \| `module` |
| `parentId` | 父 spec 的 `id`。子模块 = 其它 spec 的 `parentId === 当前 id` |
| `views` | 页面级界面入口（路由、场景），`reference` 指向一篇文档 |
| `rules` | 业务规则，同样用 `reference` 指向文档 |
| `entities` | 产品对象与字段，检查器导航不当文档节点 |
| `references` | 真正的讲解正文 `{ id, title, body }`，右侧渲染的就是它 |

`productStatus === 'deprecated'` 的 view 不参与路由匹配，也不进左栏 / 面包屑下拉。

实现见 `childProductSpecs`（`src/export/format.ts`）和 `specNavViews`（`src/wiki-path.ts`）。

## 检查器导航

左栏和面包屑下拉共用同一套下钻规则（实现：`src/wiki-path.ts`、`src/inspector/panel/InspectorApp.tsx`）。

**下钻列表（不含「当前」）：**

1. 当前 spec 有子 spec → 列子模块（`parentId`）
2. 否则 → 列未废弃的 `views`（`view.name`，顺序与 spec 一致）
3. 两者都没有 → 不出现左栏

**左栏**

- 第一项是当前 spec（标「当前」）
- 有子模块时只列子模块，不列 views
- 叶子模块（无子 spec）有 views 时列 views；点 view 打开 `view.reference`
- 点「当前」截断到该 spec，右侧显示概述（`{id}.overview`，否则第一篇 reference）

**面包屑**

- 沿 `parentId` 走到当前 spec，再按焦点决定是否追加文档级
- **不展示** `kind === 'global'` 以及没有 `parentId` 的根（例如 “True North ProductWiki”）
- 当前若就是根，面包屑为空，只留导出
- **最后一级是叶子，没有下拉**
- 非最后一级的下拉 = 上面的下钻列表：有子 spec 列子模块，否则列 views
- 点中间 spec 标题：当前节点变成该 spec，路径截断到这一级
- 最后一级若命中某个 view，标题用 `view.name`

焦点：

- `reference`：页面路由或 Inspect 命中的文档，路径含最后一级文档
- `spec`：面包屑 / 左栏点到某一 spec，路径只到该 spec，右侧为概述

Inspect 若一次命中多条 ref，仅在仍停留在页面当前 spec 的文档焦点时，右侧显示 stack；不替代左栏。

导出 JSON 里的 `breadcrumb` 字符串数组来自 `productBreadcrumb`（模块 / 视图名），与面板路径不是同一套。

## 选中来源

面板不浏览文件系统。选中始终是 `ProductRef` 字符串：

- **页面**：`collectProductRefsForRoute` 匹配 `views[].desktopRoute`，否则回退到最长 `spec.route` 的概述
- **Inspect**：从点击元素沿 DOM 祖先收集 `data-product-ref`

## 验证

`src/__tests__/wiki-path.test.ts` 覆盖：省略 global、叶子无下拉、growth 下列子模块而非兄弟 domain、模块级下列未废弃 views。
