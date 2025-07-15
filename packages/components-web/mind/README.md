# @life-toolkit/components-web-mind

一个基于 React 的交互式思维导图组件，提供丰富的编辑功能和现代化的用户界面。

## 🌟 特性

- 🎨 **现代化 UI** - 基于 Emotion 的样式系统，支持主题切换
- 🖱️ **交互式操作** - 支持拖拽、缩放、平移等交互操作
- ✏️ **实时编辑** - 支持节点内容的实时编辑和格式化
- 🌳 **树形结构** - 支持无限层级的节点结构
- 📝 **Markdown 支持** - 节点内容支持 Markdown 语法
- 🎯 **节点管理** - 添加、删除、移动节点等完整操作
- 📱 **响应式设计** - 适配不同屏幕尺寸
- 🔄 **撤销重做** - 完整的历史记录管理
- 🎨 **样式定制** - 支持节点样式自定义

## 📦 安装

```bash
pnpm add @life-toolkit/components-web-mind
```

## 🚀 快速开始

### 基础使用

```tsx
import React from 'react';
import { Provider, Main, ThemeProvider } from '@life-toolkit/components-web-mind';

function App() {
  return (
    <Provider>
      <ThemeProvider>
        <Main />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
```

### 使用 Hook 进行操作

```tsx
import React from 'react';
import { Provider, Main, ThemeProvider, useMindmap } from '@life-toolkit/components-web-mind';

function MindmapController() {
  const {
    addChild,
    addSibling,
    deleteNode,
    selectNode,
    changeText,
    setMindmap
  } = useMindmap();

  const handleAddChild = () => {
    addChild('root'); // 为根节点添加子节点
  };

  return (
    <div>
      <button onClick={handleAddChild}>添加子节点</button>
      <Main />
    </div>
  );
}

function App() {
  return (
    <Provider>
      <ThemeProvider>
        <MindmapController />
      </ThemeProvider>
    </Provider>
  );
}
```

## 📚 API 文档

### 组件

#### `<Provider>`

思维导图的上下文提供者，必须包装在最外层。

```tsx
<Provider>
  {/* 你的应用内容 */}
</Provider>
```

#### `<ThemeProvider>`

主题提供者，管理思维导图的主题样式。

```tsx
<ThemeProvider>
  {/* 你的应用内容 */}
</ThemeProvider>
```

#### `<Main>`

主要的思维导图组件，包含画布和编辑面板。

```tsx
<Main />
```

### Hooks

#### `useMindmap()`

主要的思维导图操作 Hook。

**返回值：**

```tsx
interface MindmapHookReturn {
  // 切换子节点显示/隐藏
  toggleChildren: (node_id: string, bool: boolean) => void;
  
  // 添加子节点
  addChild: (node_id: string) => void;
  
  // 添加兄弟节点
  addSibling: (node_id: string, parent_id: string) => void;
  
  // 移动节点
  moveNode: (node_id: string, target_id: string, parent_id: string, is_sibling: boolean) => void;
  
  // 编辑节点
  editNode: (node_id: string) => void;
  
  // 修改节点文本
  changeText: (node_id: string, text: string) => void;
  
  // 编辑节点信息
  editNodeInfo: (node_id: string, info: MindmapNode['info']) => void;
  
  // 选择节点
  selectNode: (node_id: string, select_by_click?: boolean) => void;
  
  // 删除节点
  deleteNode: (node_id: string, parent_id: string) => void;
  
  // 清除节点状态
  clearNodeStatus: () => void;
  
  // 设置思维导图数据
  setMindmap: (mindmap: MindmapNode, is_new_map?: boolean) => void;
}
```

#### `useHistory()`

历史记录管理 Hook。

```tsx
const { undo, redo, canUndo, canRedo } = useHistory();
```

#### `useTheme()`

主题管理 Hook。

```tsx
const { theme, setTheme, toggleTheme } = useTheme();
```

#### `useZoom()`

缩放控制 Hook。

```tsx
const { zoom, zoomIn, zoomOut, resetZoom } = useZoom();
```

#### `useMove()`

画布移动 Hook。

```tsx
const { position, moveCanvas, resetPosition } = useMove();
```

#### `useEditPanel()`

编辑面板控制 Hook。

```tsx
const { showPanel, hidePanel, panelData } = useEditPanel();
```

## 🎯 数据结构

### MindmapNode

```tsx
interface MindmapNode {
  id: string;                    // 节点唯一标识
  text: string;                  // 节点文本内容
  showChildren: boolean;         // 是否显示子节点
  children: MindmapNode[];       // 子节点数组
  style?: {                      // 节点样式
    color?: string;              // 文字颜色
    backgroundColor?: string;    // 背景颜色
    fontSize?: number;           // 字体大小
  };
  position?: {                   // 节点位置
    x: number;
    y: number;
  };
  info?: {                       // 节点附加信息
    description?: string;        // 描述
    tags?: string[];            // 标签
    priority?: number;          // 优先级
    [key: string]: any;         // 其他自定义属性
  };
}
```

## 🎨 样式定制

### 主题切换

```tsx
import { useTheme } from '@life-toolkit/components-web-mind';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button onClick={toggleTheme}>
      当前主题: {theme === 'light' ? '浅色' : '深色'}
    </button>
  );
}
```

### 自定义节点样式

```tsx
const customNode: MindmapNode = {
  id: 'custom',
  text: '自定义节点',
  showChildren: true,
  children: [],
  style: {
    color: '#ffffff',
    backgroundColor: '#ff6b6b',
    fontSize: 16
  }
};
```

## 🔧 高级用法

### 自定义思维导图数据

```tsx
import { useMindmap } from '@life-toolkit/components-web-mind';

function CustomMindmap() {
  const { setMindmap } = useMindmap();
  
  const customData: MindmapNode = {
    id: 'root',
    text: '我的项目',
    showChildren: true,
    children: [
      {
        id: 'frontend',
        text: '前端开发',
        showChildren: true,
        children: [
          { id: 'react', text: 'React', showChildren: true, children: [] },
          { id: 'vue', text: 'Vue', showChildren: true, children: [] }
        ]
      },
      {
        id: 'backend',
        text: '后端开发',
        showChildren: true,
        children: [
          { id: 'nodejs', text: 'Node.js', showChildren: true, children: [] },
          { id: 'python', text: 'Python', showChildren: true, children: [] }
        ]
      }
    ]
  };
  
  React.useEffect(() => {
    setMindmap(customData, true);
  }, []);
  
  return <Main />;
}
```

### 节点事件处理

```tsx
function MindmapWithEvents() {
  const { selectNode, editNode, deleteNode } = useMindmap();
  
  const handleNodeClick = (nodeId: string) => {
    selectNode(nodeId, true);
  };
  
  const handleNodeDoubleClick = (nodeId: string) => {
    editNode(nodeId);
  };
  
  const handleNodeDelete = (nodeId: string, parentId: string) => {
    if (window.confirm('确定要删除这个节点吗？')) {
      deleteNode(nodeId, parentId);
    }
  };
  
  return <Main />;
}
```

## 📱 响应式支持

组件内置响应式设计，自动适配不同屏幕尺寸：

- **桌面端**: 完整功能，支持所有交互操作
- **平板端**: 优化触摸操作，调整按钮大小
- **移动端**: 简化界面，保留核心功能

## 🛠️ 开发

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

### 构建

```bash
# 构建生产版本
pnpm build

# 类型检查
pnpm type-check
```

## 🧪 测试

```bash
# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看本文档的 API 说明
2. 在 GitHub 上提交 Issue
3. 联系开发团队

## 🔄 更新日志

### v0.2.0
- 添加主题切换功能
- 优化节点编辑体验
- 改进响应式设计
- 修复已知问题

### v0.1.0
- 初始版本发布
- 基础思维导图功能
- 节点增删改查
- 拖拽和缩放支持 