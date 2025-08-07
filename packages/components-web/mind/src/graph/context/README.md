# MindMap Context 模块

本目录包含思维导图的状态管理相关代码，按照职责单一原则进行了模块化拆分。

## 文件结构

```
context/
├── index.ts              # 统一导出入口
├── types.ts              # 类型定义
├── utils.ts              # 工具函数
├── hooks.ts              # 自定义 Hooks
├── MindMapContext.tsx    # 核心 Context 组件
└── README.md             # 说明文档
```

## 模块说明

### types.ts
定义了 MindMap 相关的 TypeScript 类型：
- `MindMapContextType`: Context 的类型定义
- `MindMapProviderProps`: Provider 组件的属性类型

### utils.ts
包含工具函数：
- `generateId()`: 生成唯一节点 ID
- `findNode()`: 在思维导图数据中查找指定节点
- `findParentNode()`: 查找指定节点的父节点
- `cloneMindMapData()`: 深拷贝思维导图数据

### hooks.ts
包含自定义 Hooks：
- `useNodeOperations()`: 节点操作相关的 Hook（增删改查）
- `useGraphOperations()`: 图形操作相关的 Hook（缩放、居中等）

### MindMapContext.tsx
核心 Context 组件：
- `MindMapProvider`: Context Provider 组件
- `useMindMapContext()`: 使用 Context 的自定义 Hook

### index.ts
统一导出入口，方便其他模块导入使用。

## 使用方式

```typescript
// 导入 Context 和 Hook
import { MindMapProvider, useMindMapContext } from '../context';

// 导入类型
import type { MindMapContextType } from '../context';

// 导入工具函数
import { generateId, findNode } from '../context';
```

## 设计原则

1. **职责单一**: 每个文件只负责特定的功能
2. **模块化**: 便于维护和测试
3. **类型安全**: 完整的 TypeScript 类型定义
4. **可复用**: 工具函数和 Hooks 可以独立使用