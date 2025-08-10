import {
  MindMapData,
  MindMapNode,
  MindMapOptions,
  DEFAULT_MIND_MAP_OPTIONS,
  ENodeType,
} from '../types';

/**
 * 通用数据转换器
 * 用于将不同类型的数据转换为统一的思维导图数据格式
 */
export class MindMapDataConverter<T extends MindMapNode = MindMapNode> {
  private options: MindMapOptions;

  constructor(options?: Partial<MindMapOptions>) {
    this.options = { ...DEFAULT_MIND_MAP_OPTIONS, ...options };
  }

  /**
   * 将节点数据转换为思维导图数据
   * @param nodes 要转换的节点数据，可以是单个节点或节点数组
   * @returns 转换后的思维导图数据
   */
  convert(nodes: T | T[]): MindMapData | null {
    if (!nodes) {
      return null;
    }

    // 如果是数组且有多个节点，创建一个虚拟根节点
    if (Array.isArray(nodes)) {
      if (nodes.length === 0) {
        return null;
      }

      if (nodes.length === 1) {
        return this.convertSingleNode(nodes[0] as unknown as MindMapNode, ENodeType.topic);
      }

      return {
        id: 'root',
        type: ENodeType.topic,
        label: '根节点',
        width: this.options.rootWidth || DEFAULT_MIND_MAP_OPTIONS.rootWidth!,
        height: this.options.rootHeight || DEFAULT_MIND_MAP_OPTIONS.rootHeight!,
        children: nodes.map(node =>
          this.convertSingleNode(node as unknown as MindMapNode, ENodeType.topicBranch)
        ),
      };
    }

    // 单个节点直接转换
    return this.convertSingleNode(nodes as unknown as MindMapNode, ENodeType.topic);
  }

  /**
   * 转换单个节点
   * @param node 要转换的节点
   * @param type 节点类型
   * @param parent 父节点（如果有）
   * @returns 转换后的思维导图节点
   */
  private convertSingleNode(node: MindMapNode, type: ENodeType): MindMapData {
    // 根据节点类型确定尺寸
    let width = 0;
    let height = 0;

    switch (type) {
      case ENodeType.topic:
        width = this.options.rootWidth || DEFAULT_MIND_MAP_OPTIONS.rootWidth!;
        height = this.options.rootHeight || DEFAULT_MIND_MAP_OPTIONS.rootHeight!;
        break;
      case ENodeType.topicBranch:
        width = this.options.branchWidth || DEFAULT_MIND_MAP_OPTIONS.branchWidth!;
        height = this.options.branchHeight || DEFAULT_MIND_MAP_OPTIONS.branchHeight!;
        break;
      case ENodeType.topicChild:
        width = this.options.childWidth || DEFAULT_MIND_MAP_OPTIONS.childWidth!;
        height = this.options.childHeight || DEFAULT_MIND_MAP_OPTIONS.childHeight!;
        break;
    }

    // 创建思维导图节点
    const mindMapNode: MindMapData = {
      id: node.id.toString(),
      type,
      label: (node as any).name || '未命名节点',
      width,
      height,
    };

    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      mindMapNode.children = node.children.map((child: MindMapNode) =>
        this.convertSingleNode(child, type === ENodeType.topic ? ENodeType.topicBranch : ENodeType.topicChild)
      );
    }

    return mindMapNode;
  }
}

/**
 * 创建一个目标数据的转换器
 * 针对 GoalVo 类型的数据
 */
export const createGoalConverter = (options?: Partial<MindMapOptions>) => {
  return new MindMapDataConverter(options);
};

/**
 * 创建一个任务数据的转换器
 * 这只是一个示例，你可以根据需要创建不同类型的转换器
 */
export const createTaskConverter = (options?: Partial<MindMapOptions>) => {
  return new MindMapDataConverter({
    ...options,
    rootWidth: 180,
    rootHeight: 60,
    branchWidth: 140,
    branchHeight: 50,
    childWidth: 100,
    childHeight: 40,
  });
};
