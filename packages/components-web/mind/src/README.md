# Mind Map 组件架构说明

## 概述

本思维导图组件采用分层架构设计，将业务逻辑和画布操作进行了清晰的分离，提高了代码的可维护性和可扩展性。

## 架构设计

### 1. 分层结构

```
├── context/                    # 全局业务逻辑层
│   ├── MindMapContext.tsx     # 业务数据状态管理
│   ├── types.ts               # 业务相关类型定义
│   ├── hooks.ts               # 业务操作hooks
│   └── utils.ts               # 业务工具函数
│
├── graph/                      # 画布渲染层
│   ├── context/               # 画布状态管理
│   │   ├── MindMapContext.tsx # 画布状态管理
│   │   ├── types.ts           # 画布相关类型定义
│   │   ├── hooks.ts           # 画布操作hooks
│   │   └── utils.ts           # 画布工具函数
│   ├── helpers/               # 画布辅助功能
│   ├── graph.tsx              # X6图形配置
│   └── index.tsx              # 画布组件入口
│
├── features/                   # 功能组件层
│   ├── MindMapToolbar.tsx     # 工具栏组件
│   ├── NodeEditor.tsx         # 节点编辑器
│   ├── MiniMap.tsx            # 小地图组件
│   └── ExportImportModals.tsx # 导入导出模态框
│
├── types/                      # 公共类型定义
├── utils/                      # 公共工具函数
└── MindMap.tsx                 # 主组件入口
```

### 2. 职责分离

#### 全局Context (`context/`)
- **职责**: 管理思维导图的业务数据和业务逻辑
- **状态**: 
  - `mindMapData`: 思维导图数据
  - `selectedNodeId`: 当前选中的节点ID
- **操作**: 
  - `addChild`: 添加子节点
  - `addSibling`: 添加兄弟节点
  - `updateNode`: 更新节点
  - `deleteNode`: 删除节点

#### 画布Context (`graph/context/`)
- **职责**: 管理AntV X6画布相关的状态和操作
- **状态**: 
  - `graph`: X6图形实例
  - `zoom`: 缩放级别
  - `position`: 画布位置
  - `graphRef`: 画布DOM引用
  - `containerRef`: 容器DOM引用
- **操作**: 
  - `centerContent`: 居中内容
  - `zoomIn`: 放大
  - `zoomOut`: 缩小

### 3. 数据流

```
用户操作 → 业务Context → 数据更新 → 画布Context → 视图更新
```

1. **用户交互**: 用户通过工具栏、快捷键等方式触发操作
2. **业务处理**: 全局Context处理业务逻辑，更新数据状态
3. **画布同步**: 画布Context监听数据变化，更新视图
4. **视图渲染**: X6画布重新渲染思维导图

## 组件使用

### 基础使用

```tsx
import { MindMap } from '@/components/mind';

function App() {
  const [data, setData] = useState(initialData);

  return (
    <MindMap
      data={data}
      onChange={setData}
      showToolbar={true}
    />
  );
}
```

### 高级配置

```tsx
<MindMap
  data={data}
  onChange={setData}
  options={{
    direction: 'H',
    hGap: 50,
    vGap: 25,
    enableShortcuts: true,
    centerOnResize: true
  }}
  onNodeClick={(nodeId) => console.log('Node clicked:', nodeId)}
  onGraphReady={(graph) => console.log('Graph ready:', graph)}
  showToolbar={true}
  minimapVisible={false}
/>
```

## 扩展指南

### 添加新的业务操作

1. 在 `context/hooks.ts` 中添加新的操作函数
2. 在 `context/types.ts` 中更新接口定义
3. 在 `context/MindMapContext.tsx` 中导出新的操作

### 添加新的画布功能

1. 在 `graph/context/hooks.ts` 中添加新的画布操作
2. 在 `graph/context/types.ts` 中更新接口定义
3. 在 `graph/context/MindMapContext.tsx` 中导出新的操作

### 添加新的功能组件

1. 在 `features/` 目录下创建新组件
2. 使用相应的Context获取所需状态和操作
3. 在主组件中引入并使用

## 最佳实践

1. **单一职责**: 每个Context只负责特定领域的状态管理
2. **数据流向**: 保持单向数据流，避免循环依赖
3. **类型安全**: 充分利用TypeScript的类型系统
4. **性能优化**: 合理使用useMemo和useCallback避免不必要的重渲染
5. **错误处理**: 在关键操作中添加错误边界和异常处理

## 注意事项

- 不要在业务Context中直接操作画布
- 不要在画布Context中处理业务逻辑
- 保持接口的一致性和向后兼容性
- 及时更新类型定义以保持代码的类型安全