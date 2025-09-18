import { Graph, Node, Edge } from '@antv/x6';
import { MindMapData } from '../../types';

/**
 * 节点操作工具函数
 * 用于提供节点复制、粘贴、删除等操作
 */

/**
 * 存储节点折叠状态的Map
 */
const collapsedNodesMap = new Map<string, boolean>();

/**
 * 复制节点及其子节点
 * @param graph 图形实例
 * @param nodeId 要复制的节点ID
 * @returns 复制后的节点
 */
export const copyNode = (graph: Graph, nodeId: string): Node | null => {
  const node = graph.getCellById(nodeId);
  if (!node || !node.isNode()) return null;

  // 复制节点
  graph.copy([node]);
  return node as Node;
};

/**
 * 粘贴节点
 * @param graph 图形实例
 * @param parentId 父节点ID，如果提供则作为子节点粘贴
 * @returns 粘贴的节点数组
 */
export const pasteNode = (graph: Graph): Node[] => {
  if (graph.isClipboardEmpty()) return [];

  // 粘贴节点
  const cells = graph.paste({ offset: 20 });
  const nodes = cells.filter(cell => cell.isNode()) as Node[];

  // 选中粘贴的节点
  graph.cleanSelection();
  graph.select(nodes);

  return nodes;
};

/**
 * 创建子节点
 * @param graph 图形实例
 * @param parentId 父节点ID
 * @param label 节点标签
 * @returns 创建的节点
 */
export const createChildNode = (
  graph: Graph,
  parentId: string,
  label: string,
  data: Partial<MindMapData> = {}
): Node | null => {
  const parent = graph.getCellById(parentId);
  if (!parent || !parent.isNode()) return null;

  // 创建子节点
  const childNode = graph.createNode({
    ...data,
    label,
  });

  // 创建连接线
  graph.createEdge({
    source: { cell: parentId },
    target: { cell: childNode.id },
    shape: 'mindmap-edge',
  });

  return childNode;
};

/**
 * 删除节点及其连接
 * @param graph 图形实例
 * @param nodeId 要删除的节点ID
 */
export const removeNode = (graph: Graph, nodeId: string): void => {
  const node = graph.getCellById(nodeId);
  if (!node) return;

  // 获取与该节点相连的边
  const connectedEdges = graph.getConnectedEdges(node);

  // 删除节点和连接的边
  graph.removeCells([node, ...connectedEdges]);
};

/**
 * 更新节点标签
 * @param graph 图形实例
 * @param nodeId 节点ID
 * @param label 新标签
 */
export const updateNodeLabel = (graph: Graph, nodeId: string, label: string): void => {
  const node = graph.getCellById(nodeId);
  if (!node || !node.isNode()) return;

  // 更新节点标签
  node.setAttrByPath('label/text', label);
};

/**
 * 高亮显示节点
 * @param graph 图形实例
 * @param nodeId 要高亮的节点ID
 */
export const highlightNode = (graph: Graph, nodeId: string): void => {
  // 清除当前选择
  graph.cleanSelection();

  // 选中指定节点
  const node = graph.getCellById(nodeId);
  if (node) {
    graph.select(node);
  }
};

/**
 * 获取节点数据
 * @param graph 图形实例
 * @param nodeId 节点ID
 * @returns 节点数据
 */
export const getNodeData = (graph: Graph, nodeId: string): any => {
  const node = graph.getCellById(nodeId);
  if (!node || !node.isNode()) return null;

  return node.getData();
};

/**
 * 设置节点数据
 * @param graph 图形实例
 * @param nodeId 节点ID
 * @param data 要设置的数据
 */
export const setNodeData = (graph: Graph, nodeId: string, data: any): void => {
  const node = graph.getCellById(nodeId);
  if (!node || !node.isNode()) return;
};

/**
 * 获取节点的所有子节点（直接和间接的）
 * @param graph 图形实例
 * @param nodeId 节点ID
 * @returns 所有子节点数组
 */
export const getAllChildNodes = (graph: Graph, nodeId: string): Node[] => {
  const childNodes: Node[] = [];
  const visited = new Set<string>();

  const collectChildren = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);

    // 获取直接连接的边
    const outgoingEdges = graph.getOutgoingEdges(id) || [];

    // 遍历所有出边对应的目标节点
    for (const edge of outgoingEdges) {
      const targetId = edge.getTargetCellId();
      if (targetId) {
        const targetNode = graph.getCellById(targetId);
        if (targetNode && targetNode.isNode()) {
          childNodes.push(targetNode as Node);
          // 继续递归收集该节点的子节点
          collectChildren(targetId.toString());
        }
      }
    }
  };

  collectChildren(nodeId);
  return childNodes;
};

/**
 * 获取节点的直接子节点
 * @param graph 图形实例
 * @param nodeId 节点ID
 * @returns 直接子节点数组
 */
export const getDirectChildNodes = (graph: Graph, nodeId: string): Node[] => {
  const childNodes: Node[] = [];

  // 获取直接连接的边
  const outgoingEdges = graph.getOutgoingEdges(nodeId) || [];

  // 遍历所有出边对应的目标节点
  for (const edge of outgoingEdges) {
    const targetId = edge.getTargetCellId();
    if (targetId) {
      const targetNode = graph.getCellById(targetId);
      if (targetNode && targetNode.isNode()) {
        childNodes.push(targetNode as Node);
      }
    }
  }

  return childNodes;
};

/**
 * 切换节点的折叠/展开状态
 * @param graph 图形实例
 * @param nodeId 节点ID
 * @param collapsed 可选的指定状态，如果不提供则切换当前状态
 * @returns 当前折叠状态
 */
export const toggleNodeCollapse = (graph: Graph, nodeId: string, collapsed?: boolean): boolean => {
  // 获取当前折叠状态
  const isCollapsed = collapsedNodesMap.get(nodeId) || false;

  // 如果提供了指定状态，则使用指定的，否则切换
  const newCollapsed = collapsed !== undefined ? collapsed : !isCollapsed;

  // 更新状态
  collapsedNodesMap.set(nodeId, newCollapsed);

  // 获取所有子节点
  const childNodes = getAllChildNodes(graph, nodeId);

  // 获取与这些节点相关的所有边
  const relatedEdges: Edge[] = [];

  childNodes.forEach(node => {
    // 获取所有相连的边
    const edges = graph.getConnectedEdges(node) || [];
    edges.forEach(edge => {
      if (!relatedEdges.includes(edge)) {
        relatedEdges.push(edge);
      }
    });
  });

  // 设置所有子节点及边的可见性
  if (newCollapsed) {
    // 折叠：隐藏所有子节点及边
    childNodes.forEach(node => node.hide());
    relatedEdges.forEach(edge => edge.hide());

    // 更新折叠指示器
    const node = graph.getCellById(nodeId);
    if (node && node.isNode()) {
      node.setAttrByPath('collapsedIndicator/visibility', 'visible');
      node.setAttrByPath('collapsedIndicatorText/visibility', 'visible');
      node.setAttrByPath('expandedIndicator/visibility', 'hidden');
      node.setAttrByPath('expandedIndicatorText/visibility', 'hidden');
    }
  } else {
    // 展开：显示所有子节点及边
    childNodes.forEach(node => node.show());
    relatedEdges.forEach(edge => edge.show());

    // 更新折叠指示器
    const node = graph.getCellById(nodeId);
    if (node && node.isNode()) {
      node.setAttrByPath('collapsedIndicator/visibility', 'hidden');
      node.setAttrByPath('collapsedIndicatorText/visibility', 'hidden');
      node.setAttrByPath('expandedIndicator/visibility', 'visible');
      node.setAttrByPath('expandedIndicatorText/visibility', 'visible');
    }

    // 检查是否还有已折叠的子节点
    childNodes.forEach(childNode => {
      const childId = childNode.id.toString();
      if (collapsedNodesMap.get(childId)) {
        // 如果子节点已经被标记为折叠，递归处理
        toggleNodeCollapse(graph, childId, true);
      }
    });
  }

  return newCollapsed;
};

/**
 * 检查节点是否有子节点
 * @param graph 图形实例
 * @param nodeId 节点ID
 * @returns 是否有子节点
 */
export const hasChildNodes = (graph: Graph, nodeId: string): boolean => {
  const outgoingEdges = graph.getOutgoingEdges(nodeId) || [];
  return outgoingEdges.length > 0;
};

/**
 * 获取节点的折叠状态
 * @param nodeId 节点ID
 * @returns 是否折叠
 */
export const isNodeCollapsed = (nodeId: string): boolean => {
  return collapsedNodesMap.get(nodeId) || false;
};
