export enum ENodeType {
  topic = 'topic',
  topicBranch = 'topic-branch',
  topicChild = 'topic-child',
}

/**
 * 思维导图节点类型
 */
export interface MindMapData {
  id: string;
  type: ENodeType;
  label: string;
  width: number;
  height: number;
  children?: MindMapData[];
}

/**
 * 思维导图层次结构结果
 */
export interface HierarchyResult {
  id: string;
  x: number;
  y: number;
  data: MindMapData;
  children?: HierarchyResult[];
}

/**
 * 通用数据节点接口
 * 用于支持不同类型的数据转换为思维导图数据
 */
export interface MindMapNode<T = any> {
  id: string | number;
  name: string;
  children?: MindMapNode<T>[];
  [key: string]: any;
}

/**
 * 思维导图配置选项
 */
export interface MindMapOptions {
  direction?: 'H' | 'V'; // 水平或垂直布局
  theme?: string; // 主题名称
  rootWidth?: number; // 根节点宽度
  rootHeight?: number; // 根节点高度
  branchWidth?: number; // 分支节点宽度
  branchHeight?: number; // 分支节点高度
  childWidth?: number; // 子节点宽度
  childHeight?: number; // 子节点高度
  hGap?: number; // 水平间距
  vGap?: number; // 垂直间距
  editable?: boolean; // 是否可编辑
  readOnly?: boolean; // 是否只读
  centerOnResize?: boolean; // 调整大小时是否居中
  enableShortcuts?: boolean; // 是否启用快捷键
}

/**
 * 默认思维导图配置
 */
export const DEFAULT_MIND_MAP_OPTIONS: MindMapOptions = {
  direction: 'H',
  theme: 'default',
  rootWidth: 160,
  rootHeight: 50,
  branchWidth: 120,
  branchHeight: 40,
  childWidth: 80,
  childHeight: 30,
  hGap: 50,
  vGap: 25,
  editable: true,
  readOnly: false,
  centerOnResize: true,
  enableShortcuts: true,
};
