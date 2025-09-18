# Graph 画布渲染层

## 概述

Graph 模块是思维导图组件的画布渲染层，基于 AntV X6 图形引擎实现。该模块专注于处理画布相关的状态管理、图形渲染、用户交互等功能，与业务逻辑层完全分离。

## 目录结构

```
graph/
├── context/                   # 画布状态管理
│   ├── index.tsx             # Context Provider 和 Hook
│   ├── hooks.ts              # 画布操作相关 hooks
│   └── README.md             # Context 使用说明
├── helpers/                   # 辅助功能模块
│   ├── index.ts              # 导出入口
│   ├── filters.tsx           # 滤镜注册
│   ├── shapes.tsx            # 节点和边的样式注册
│   ├── nodeOperations.ts     # 节点操作工具函数
│   └── interactions/         # 交互处理
│       ├── index.ts          # 交互模块导出
│       ├── graph.ts          # 图形交互
│       ├── keyboard.ts       # 键盘交互
│       └── mouse.ts          # 鼠标交互
├── config/                    # 配置文件
│   └── NodeStyle.ts          # 节点样式配置
├── eventEmitter.ts           # 事件发射器
├── graph.tsx                 # X6 图形初始化
└── index.tsx                 # 画布组件入口
```

## 核心模块

### 1. Context 状态管理 (`context/`)

#### MindMapGraphProvider

画布状态管理的核心，提供以下状态和方法：

**状态：**

- `graph`: X6 图形实例
- `zoom`: 当前缩放级别
- `position`: 画布位置
- `graphRef`: 画布 DOM 引用

**操作方法：**

- `centerContent()`: 居中显示内容
- `zoomIn()`: 放大画布
- `zoomOut()`: 缩小画布
- `fitToContent()`: 适应内容大小
- `resetView()`: 重置视图
- `handleToggleNodeCollapse()`: 切换节点折叠状态
- `handleUndo()`: 撤销操作
- `handleRedo()`: 重做操作
- `handleCopy()`: 复制节点
- `handlePaste()`: 粘贴节点

#### 使用示例

```tsx
import { MindMapGraphProvider, useMindMapGraphContext } from './context';

// 在组件中使用
function GraphComponent() {
  const { graph, zoomIn, zoomOut, centerContent } = useMindMapGraphContext();

  return (
    <div>
      <button onClick={zoomIn}>放大</button>
      <button onClick={zoomOut}>缩小</button>
      <button onClick={centerContent}>居中</button>
    </div>
  );
}

// 在父组件中提供 Context
function App() {
  return (
    <MindMapGraphProvider>
      <GraphComponent />
    </MindMapGraphProvider>
  );
}
```

### 2. 事件系统 (`eventEmitter.ts`)

基于 mitt 实现的类型安全事件系统，支持以下事件：

#### 事件类型

```typescript
enum GraphEventType {
  ZOOM_IN = 'zoomIn',
  ZOOM_OUT = 'zoomOut',
  CENTER_CONTENT = 'centerContent',
  FIT_TO_CONTENT = 'fitToContent',
  RESET_VIEW = 'resetView',
  TOGGLE_NODE_COLLAPSE = 'toggleNodeCollapse',
  UNDO = 'undo',
  REDO = 'redo',
  COPY = 'copy',
  PASTE = 'paste',
}
```

#### 使用示例

```typescript
import { graphEventEmitter } from './eventEmitter';

// 发射事件
graphEventEmitter.zoomIn();
graphEventEmitter.toggleNodeCollapse('node-id', true);

// 监听事件
const unsubscribe = graphEventEmitter.onZoomIn(() => {
  console.log('放大事件触发');
});

// 取消监听
unsubscribe();
```

### 3. 图形初始化 (`graph.tsx`)

负责创建和配置 X6 图形实例：

```typescript
export function initGraph(graphRef: HTMLDivElement, width: number, height: number) {
  const newGraph = new Graph({
    container: graphRef,
    width,
    height,
    background: { color: '#FAFCFF' },
    grid: { visible: true, type: 'doubleMesh' },
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      minScale: 0.5,
      maxScale: 3,
    },
  });

  // 注册滤镜和交互
  registerFilters(newGraph);
  setupInteractions(newGraph);

  return newGraph;
}
```

### 4. 辅助功能 (`helpers/`)

#### 节点操作 (`nodeOperations.ts`)

提供节点相关的操作函数：

```typescript
// 复制节点
export const copyNode = (graph: Graph, nodeId: string): Node | null => { ... }

// 粘贴节点
export const pasteNode = (graph: Graph): Node[] => { ... }

// 创建子节点
export const createChildNode = (graph: Graph, parentId: string, label: string): Node | null => { ... }

// 删除节点
export const removeNode = (graph: Graph, nodeId: string): void => { ... }

// 切换节点折叠状态
export const toggleNodeCollapse = (graph: Graph, nodeId: string, collapsed?: boolean): void => { ... }
```

#### 样式注册 (`shapes.tsx`)

注册自定义节点和边的样式：

```typescript
// 注册所有图形样式
export const registerGraphNode = (MindMapNode: React.ComponentType<any>) => {
  registerReactNodes(MindMapNode);
  registerMindMapConnector();
  registerMindMapEdge();
};
```

#### 交互处理 (`interactions/`)

- `keyboard.ts`: 键盘快捷键处理
- `mouse.ts`: 鼠标交互处理
- `graph.ts`: 图形级别的交互设置

## 使用指南

### 基础使用

```tsx
import { MindMapGraphProvider } from './context';
import { InternalMindMapGraph } from './index';

function MindMapContainer() {
  return (
    <MindMapGraphProvider>
      <InternalMindMapGraph
        options={{
          direction: 'H',
          hGap: 50,
          vGap: 25,
        }}
        onNodeClick={nodeId => console.log('节点点击:', nodeId)}
        onGraphReady={graph => console.log('画布就绪:', graph)}
      />
    </MindMapGraphProvider>
  );
}
```

### 自定义节点组件

```tsx
const CustomMindMapNode = ({ node, graph }) => {
  const data = node.getData();

  return (
    <div className="custom-node">
      <span>{data.label}</span>
      <button onClick={() => toggleNodeCollapse(graph, node.id)}>
        {data.collapsed ? '展开' : '折叠'}
      </button>
    </div>
  );
};

<InternalMindMapGraph MindMapNode={CustomMindMapNode} />;
```

### 扩展画布操作

```typescript
// 在 context/hooks.ts 中添加新操作
export const useGraphOperations = ({ graph, ... }) => {
  const customOperation = useCallback(() => {
    if (graph) {
      // 自定义操作逻辑
    }
  }, [graph]);

  return {
    // ... 现有操作
    customOperation,
  };
};
```

## 架构特点

### 1. 职责分离

- **Context**: 只管理画布相关状态
- **EventEmitter**: 处理跨组件通信
- **Helpers**: 提供纯函数工具
- **Graph**: 负责 X6 实例初始化

### 2. 类型安全

- 完整的 TypeScript 类型定义
- 事件系统的类型安全
- 严格的接口约束

### 3. 可扩展性

- 模块化设计，易于添加新功能
- 插件式的节点和边注册
- 灵活的事件系统

### 4. 性能优化

- 合理使用 useCallback 和 useMemo
- 事件监听的自动清理
- 画布大小变化的防抖处理

## 注意事项

1. **不要在此模块中处理业务逻辑**：画布层只负责渲染和交互
2. **保持状态的单向流动**：避免在画布层直接修改业务数据
3. **及时清理事件监听器**：防止内存泄漏
4. **合理使用事件系统**：避免过度使用全局事件
5. **注意 X6 实例的生命周期管理**：确保正确的创建和销毁

## 最佳实践

1. **使用 Context 获取画布状态**：避免 prop drilling
2. **通过事件系统进行组件通信**：保持组件解耦
3. **将复杂操作封装为 hooks**：提高代码复用性
4. **保持操作的原子性**：每个函数只做一件事
5. **添加适当的错误处理**：提高系统稳定性
