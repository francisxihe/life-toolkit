# 目标脑图组件

基于 AntV X6 实现的目标脑图可视化组件，用于展示和编辑目标层级结构。

## 功能特性

- 🎯 目标层级可视化展示
- 🖱️ 支持节点点击编辑
- 🎨 根据层级自动着色
- 📱 响应式布局
- 🔄 支持数据刷新
- 🖼️ 支持全屏查看

## 技术栈

- **AntV X6**: 图编辑引擎
- **React**: UI 框架
- **TypeScript**: 类型支持
- **Arco Design**: UI 组件库

## 组件结构

```
goal-mind-map/
├── index.tsx          # 主组件入口
├── X6MindMap.tsx      # X6 脑图实现
├── style.less         # 样式文件
└── README.md          # 文档
```

## 使用方式

```tsx
import GoalMindMap from './goal-mind-map';

<GoalMindMap className="custom-class" />
```

## 重构说明

本次重构将原有的自定义脑图实现替换为基于 AntV X6 的专业图编辑引擎：

### 主要改进

1. **更强的可扩展性**: X6 提供丰富的图形编辑能力
2. **更好的性能**: 专业的图形渲染引擎
3. **更丰富的交互**: 支持拖拽、缩放、选择等操作
4. **更好的维护性**: 基于成熟的开源方案

### 技术变更

- 重新设计了节点布局算法
- 优化了样式和交互体验

## 🎨 组件概述

目标脑图组件是一个基于 SVG 的可视化工具，用于展示目标层次结构。采用简洁现代的设计风格，支持不同状态和重要性的目标显示。

## ✨ 主要功能

### 1. 数据可视化
- **树状结构**: 以脑图形式展示目标的层次关系
- **SVG 渲染**: 使用 SVG 技术实现高质量矢量图形
- **自动布局**: 智能计算节点位置，避免重叠

### 2. 状态标识
根据目标状态显示不同的颜色：
- **待办** (TODO): 蓝紫色 (`#667eea`)
- **进行中** (IN_PROGRESS): 绿色 (`#11998e`)
- **已完成** (DONE): 灰色 (`#bdc3c7`)
- **已放弃** (ABANDONED): 红色 (`#ff6b6b`)

### 3. 重要性标识
- **边框颜色**: 根据重要性级别调整边框颜色
- **边框宽度**: 重要性越高，边框越粗
- **视觉层次**: 通过颜色和线条粗细体现优先级

### 4. 交互功能
- **悬停效果**: 鼠标悬停时节点高亮
- **响应式设计**: 支持不同屏幕尺寸
- **全屏模式**: 支持全屏查看脑图
- **刷新功能**: 一键刷新数据

## 🔧 技术实现

### 核心技术
- **React + TypeScript**: 组件开发框架
- **SVG**: 矢量图形渲染
- **Arco Design**: UI 组件库
- **递归算法**: 树状数据处理

### 数据流程
```
目标数据 → 数据转换 → 布局计算 → SVG 渲染
```

### 组件结构
```typescript
interface MindMapNode {
  id: string;
  name: string;
  status: GoalStatus;
  importance?: number;
  children: MindMapNode[];
  x?: number;      // 布局后的 X 坐标
  y?: number;      // 布局后的 Y 坐标
  width?: number;  // 节点宽度
  height?: number; // 节点高度
}
```

## 🎯 布局算法

### 节点定位
1. **根节点居中**: 单根节点时居中显示
2. **多根节点**: 垂直排列多个根节点
3. **子节点**: 水平展开，垂直居中对齐
4. **间距控制**: 固定的水平和垂直间距

### 连接线绘制
- **贝塞尔曲线**: 使用三次贝塞尔曲线连接父子节点
- **起止点**: 从父节点右侧到子节点左侧
- **控制点**: 水平中点控制曲线弧度

## 📱 响应式设计

### 断点设置
- **桌面端**: 1200x600 默认视图
- **平板端**: 800x400 (768px 以下)
- **手机端**: 600x300 (480px 以下)

### 适配策略
- **视图框缩放**: 调整 SVG viewBox 适应屏幕
- **容器高度**: 根据屏幕尺寸调整容器高度
- **滚动支持**: 内容超出时支持滚动查看

## 🎨 视觉设计

### 节点样式
```typescript
// 节点基础样式
{
  width: 200px,
  height: 60px,
  borderRadius: 8px,
  fontSize: 'auto', // 根据文本长度自适应
  fontWeight: 600,
  color: 'white'
}
```

### 颜色方案
```css
/* 状态颜色 */
.status-todo { fill: #667eea; stroke: #764ba2; }
.status-in-progress { fill: #11998e; stroke: #38ef7d; }
.status-done { fill: #bdc3c7; stroke: #95a5a6; }
.status-abandoned { fill: #ff6b6b; stroke: #ee5a52; }

/* 连接线 */
.connection { stroke: #e5e6eb; stroke-width: 2; }
```

## 🚀 使用方法

### 基础用法
```tsx
import GoalMindMap from './goal-mind-map';

function App() {
  return (
    <div>
      <GoalMindMap className="custom-class" />
    </div>
  );
}
```

### 功能按钮
- **刷新按钮**: 重新获取最新目标数据
- **全屏按钮**: 切换全屏显示模式

## 📊 数据处理

### 数据获取
```typescript
const data = await GoalService.getGoalTree({
  status: GoalStatus.TODO // 只显示待办和进行中的目标
});
```

### 数据转换
- **递归处理**: 将目标树结构转换为脑图节点
- **状态映射**: 目标状态映射到视觉样式
- **重要性处理**: 重要性级别转换为边框样式

## 🔄 状态管理

### 组件状态
```typescript
const [loading, setLoading] = useState(false);
const [goalTree, setGoalTree] = useState<GoalVo[]>([]);
const [rawMindMapData, setRawMindMapData] = useState<MindMapNode[]>([]);
const [layoutedMindMapData, setLayoutedMindMapData] = useState<MindMapNode[]>([]);
```

### 生命周期
1. **组件挂载**: 自动获取目标数据
2. **数据更新**: 原始数据变化时重新计算布局
3. **布局完成**: 渲染 SVG 脑图

## 🐛 已知限制

1. **性能**: 大量节点时可能影响渲染性能
2. **布局**: 复杂树结构可能出现节点重叠
3. **文本**: 长文本会被截断显示

## 🔮 未来规划

1. **交互增强**: 添加节点点击、拖拽功能
2. **布局优化**: 改进布局算法，支持更复杂结构
3. **导出功能**: 支持导出为图片或 PDF
4. **主题定制**: 支持自定义颜色主题
5. **动画效果**: 添加节点展开/收起动画

## 📝 更新日志

### v3.0.0 (2024-01-XX)
- 重构为 SVG 实现
- 简化样式设计
- 优化布局算法
- 提升渲染性能

### v2.0.0 (2024-01-XX)
- 全面重构样式设计
- 添加渐变背景和玻璃态效果
- 实现多层级颜色系统

### v1.0.0 (2024-01-XX)
- 初始版本发布
- 实现基础的思维导图样式