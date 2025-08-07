import { Graph } from '@antv/x6';

/**
 * 设置鼠标交互
 * @param graph X6 Graph 实例
 */
export const setupMouseInteractions = (graph: Graph) => {
  // 双击编辑节点
  graph.on('node:dblclick', ({ node }) => {
    const nodeData = node.getData();
    const content = nodeData?.label || '';
    const newContent = prompt('请输入节点内容:', content);
    if (newContent !== null) {
      node.setData({ ...nodeData, label: newContent });
    }
  });
};
