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
/>
```

## API 参考

### MindMap Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `data` | `MindMapData` | - | 思维导图数据 |
| `onChange` | `(data: MindMapData) => void` | - | 数据变化回调 |
| `options` | `Partial<MindMapOptions>` | `{}` | 配置选项 |
| `onNodeClick` | `(nodeId: string) => void` | - | 节点点击回调 |
| `onGraphReady` | `(graph: Graph) => void` | - | 画布就绪回调 |
| `showToolbar` | `boolean` | `true` | 是否显示工具栏 |
| `MindMapNode` | `React.ComponentType<any>` | - | 自定义节点组件 |

### MindMapOptions

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `direction` | `'H' \| 'V'` | `'H'` | 布局方向（水平/垂直） |
| `hGap` | `number` | `50` | 水平间距 |
| `vGap` | `number` | `25` | 垂直间距 |
| `enableShortcuts` | `boolean` | `true` | 是否启用快捷键 |
| `centerOnResize` | `boolean` | `true` | 窗口大小变化时是否居中 |

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Tab` | 添加子节点 |
| `Enter` | 添加兄弟节点 |
| `Delete` / `Backspace` | 删除节点 |
| `Space` | 折叠/展开节点 |
| `Ctrl/Cmd + =` | 放大 |
| `Ctrl/Cmd + -` | 缩小 |
| `Ctrl/Cmd + 0` | 重置视图 |
| `Ctrl/Cmd + Z` | 撤销 |
| `Ctrl/Cmd + Y` | 重做 |
| `Ctrl/Cmd + C` | 复制 |
| `Ctrl/Cmd + V` | 粘贴 |

## 数据结构

### MindMapData

```typescript
interface MindMapData {
  id: string;                    // 节点唯一标识
  label: string;                 // 节点显示文本
  width: number;                 // 节点宽度
  height: number;                // 节点高度
  type: ENodeType;              // 节点类型
  collapsed?: boolean;           // 是否折叠
  children?: MindMapData[];      // 子节点数组
  [key: string]: any;           // 其他自定义属性
}
```

### 节点类型

```typescript
enum ENodeType {
  topic = 'topic',              // 主题节点
  topicBranch = 'topicBranch',  // 分支节点
  topicChild = 'topicChild',    // 子节点
}
```

## 事件系统

组件内部使用事件系统进行跨模块通信，支持以下事件：

### 画布操作事件

```typescript
// 缩放操作
graphEventEmitter.zoomIn();     // 放大
graphEventEmitter.zoomOut();    // 缩小
graphEventEmitter.resetView();  // 重置视图

// 内容操作
graphEventEmitter.centerContent();   // 居中内容
graphEventEmitter.fitToContent();    // 适应内容

// 节点操作
graphEventEmitter.toggleNodeCollapse(nodeId, collapsed);
graphEventEmitter.copy(nodeId);
graphEventEmitter.paste();
```

### 监听事件

```typescript
// 监听缩放事件
const unsubscribe = graphEventEmitter.onZoomIn(() => {
  console.log('画布放大');
});

// 取消监听
unsubscribe();
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

### 自定义节点样式

```tsx
// 创建自定义节点组件
const CustomNode = ({ node, graph, isNodeCollapsed, toggleNodeCollapse }) => {
  const data = node.getData();
  
  return (
    <div className={`mind-node ${data.type}`}>
      <div className="node-content">
        {data.label}
      </div>
      {data.children?.length > 0 && (
        <button 
          onClick={() => toggleNodeCollapse(graph, node.id)}
          className="collapse-btn"
        >
          {isNodeCollapsed(graph, node.id) ? '+' : '-'}
        </button>
      )}
    </div>
  );
};

// 使用自定义节点
<MindMap
  data={data}
  onChange={setData}
  MindMapNode={CustomNode}
/>
```

## 最佳实践

1. **单一职责**: 每个Context只负责特定领域的状态管理
2. **数据流向**: 保持单向数据流，避免循环依赖
3. **类型安全**: 充分利用TypeScript的类型系统
4. **性能优化**: 合理使用useMemo和useCallback避免不必要的重渲染
5. **错误处理**: 在关键操作中添加错误边界和异常处理

## 完整示例

### 基础思维导图应用

```tsx
import React, { useState } from 'react';
import { MindMap } from '@/components/mind';
import type { MindMapData } from '@/components/mind/types';

const initialData: MindMapData = {
  id: 'root',
  label: '中心主题',
  width: 120,
  height: 40,
  type: 'topic',
  children: [
    {
      id: 'branch1',
      label: '分支1',
      width: 80,
      height: 32,
      type: 'topicBranch',
      children: [
        {
          id: 'child1',
          label: '子节点1',
          width: 70,
          height: 28,
          type: 'topicChild',
        },
      ],
    },
  ],
};

function MindMapApp() {
  const [data, setData] = useState<MindMapData>(initialData);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    console.log('选中节点:', nodeId);
  };

  const handleDataChange = (newData: MindMapData) => {
    setData(newData);
    console.log('数据更新:', newData);
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <MindMap
        data={data}
        onChange={handleDataChange}
        onNodeClick={handleNodeClick}
        options={{
          direction: 'H',
          hGap: 60,
          vGap: 30,
          enableShortcuts: true,
          centerOnResize: true,
        }}
        showToolbar={true}
      />
      
      {selectedNode && (
        <div className="selected-info">
          当前选中节点: {selectedNode}
        </div>
      )}
    </div>
  );
}

export default MindMapApp;
```

### 带有自定义工具栏的高级示例

```tsx
import React, { useState, useRef } from 'react';
import { MindMap } from '@/components/mind';
import { graphEventEmitter } from '@/components/mind/graph/eventEmitter';
import type { MindMapData } from '@/components/mind/types';
import type { Graph } from '@antv/x6';

function AdvancedMindMapApp() {
  const [data, setData] = useState<MindMapData>(initialData);
  const graphRef = useRef<Graph | null>(null);

  const handleGraphReady = (graph: Graph) => {
    graphRef.current = graph;
    console.log('画布就绪:', graph);
  };

  const handleExport = () => {
    if (graphRef.current) {
      // 导出为图片
      graphRef.current.toPNG((dataUri: string) => {
        const link = document.createElement('a');
        link.download = 'mindmap.png';
        link.href = dataUri;
        link.click();
      });
    }
  };

  const customToolbar = (
    <div className="custom-toolbar">
      <button onClick={() => graphEventEmitter.zoomIn()}>放大</button>
      <button onClick={() => graphEventEmitter.zoomOut()}>缩小</button>
      <button onClick={() => graphEventEmitter.centerContent()}>居中</button>
      <button onClick={() => graphEventEmitter.fitToContent()}>适应</button>
      <button onClick={() => graphEventEmitter.resetView()}>重置</button>
      <button onClick={handleExport}>导出</button>
    </div>
  );

  return (
    <div className="advanced-mindmap">
      {customToolbar}
      <div style={{ width: '100%', height: '500px' }}>
        <MindMap
          data={data}
          onChange={setData}
          onGraphReady={handleGraphReady}
          showToolbar={false} // 使用自定义工具栏
        />
      </div>
    </div>
  );
}
```

## 故障排除

### 常见问题

#### 1. 画布不显示或显示异常

**可能原因：**
- 容器尺寸为0或未设置
- 数据格式不正确
- 缺少必要的CSS样式

**解决方案：**
```tsx
// 确保容器有明确的尺寸
<div style={{ width: '100%', height: '600px' }}>
  <MindMap data={data} onChange={setData} />
</div>

// 检查数据格式
const validData = {
  id: 'root',
  label: '根节点',
  width: 100,
  height: 40,
  type: 'topic',
  children: [], // 确保children是数组
};
```

#### 2. 快捷键不生效

**可能原因：**
- `enableShortcuts` 设置为 false
- 焦点不在画布上
- 与其他组件的快捷键冲突

**解决方案：**
```tsx
<MindMap
  data={data}
  onChange={setData}
  options={{ enableShortcuts: true }} // 确保启用快捷键
/>
```

#### 3. 节点点击事件不触发

**可能原因：**
- 节点被其他元素遮挡
- 事件冒泡被阻止
- 自定义节点组件未正确处理事件

**解决方案：**
```tsx
// 确保提供点击回调
<MindMap
  data={data}
  onChange={setData}
  onNodeClick={(nodeId) => console.log('点击节点:', nodeId)}
/>
```

#### 4. 性能问题

**可能原因：**
- 节点数量过多
- 频繁的数据更新
- 未优化的重渲染

**解决方案：**
```tsx
// 使用 useMemo 优化数据处理
const processedData = useMemo(() => {
  return processLargeData(rawData);
}, [rawData]);

// 使用 useCallback 优化回调函数
const handleNodeClick = useCallback((nodeId: string) => {
  setSelectedNode(nodeId);
}, []);
```

### 调试技巧

1. **启用开发模式日志**
```tsx
// 在开发环境中启用详细日志
if (process.env.NODE_ENV === 'development') {
  console.log('MindMap data:', data);
}
```

2. **检查图形实例状态**
```tsx
const handleGraphReady = (graph: Graph) => {
  console.log('Graph nodes:', graph.getNodes().length);
  console.log('Graph edges:', graph.getEdges().length);
};
```

3. **监听事件系统**
```tsx
// 监听所有画布事件
graphEventEmitter.onZoomIn(() => console.log('Zoom in triggered'));
graphEventEmitter.onZoomOut(() => console.log('Zoom out triggered'));
```

## 注意事项

- 不要在业务Context中直接操作画布
- 不要在画布Context中处理业务逻辑
- 保持接口的一致性和向后兼容性
- 及时更新类型定义以保持代码的类型安全
- 确保容器有明确的尺寸设置
- 在组件卸载时正确清理事件监听器
- 避免在渲染过程中直接修改数据结构