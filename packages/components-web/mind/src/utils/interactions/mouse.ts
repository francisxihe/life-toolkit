import { Graph } from '@antv/x6';
import { hasChildNodes, toggleNodeCollapse, isNodeCollapsed } from '../nodeOperations';

/**
 * 设置鼠标交互
 * @param graph X6 Graph 实例
 */
export const setupMouseInteractions = (graph: Graph) => {
  // 双击编辑节点
  graph.on('node:dblclick', ({ node }) => {
    const content = node.attr('label/text') as string;
    const newContent = prompt('请输入节点内容:', content);
    if (newContent !== null) {
      node.attr('label/text', newContent);
    }
  });

  // 点击折叠/展开指示器
  graph.on('node:mousedown', ({ e, node, x, y }) => {
    const nodeId = node.id.toString();
    
    // 只有当节点有子节点时才处理点击事件
    if (!hasChildNodes(graph, nodeId)) {
      return;
    }

    // 获取节点的边界框和位置信息
    const bbox = node.getBBox();
    const nodeView = node.view;
    
    // 计算点击位置相对于节点的坐标
    const relativeX = x - bbox.x;
    const relativeY = y - bbox.y;
    
    // 检查是否点击了折叠/展开指示器区域
    // 指示器位于节点右侧，距离右边缘约10px，半径约4-6px
    const indicatorX = bbox.width + 10; // 指示器的X位置
    const indicatorY = bbox.height / 2; // 指示器的Y位置（节点中心）
    const indicatorRadius = 8; // 点击区域半径（稍大一些便于点击）
    
    // 计算点击位置到指示器中心的距离
    const distance = Math.sqrt(
      Math.pow(relativeX - indicatorX, 2) + 
      Math.pow(relativeY - indicatorY, 2)
    );
    
    // 如果点击在指示器区域内，则切换折叠状态
    if (distance <= indicatorRadius) {
      console.log('Clicked on collapse/expand indicator for node:', nodeId);
      toggleNodeCollapse(graph, nodeId);
      e.stopPropagation();
    }
  });

  // 当鼠标移入节点时，如果有子节点，显示折叠/展开指示器
  graph.on('node:mouseenter', ({ node }) => {
    const nodeId = node.id.toString();

    // 只在有子节点的情况下显示指示器
    if (hasChildNodes(graph, nodeId)) {
      const collapsed = isNodeCollapsed(nodeId);

      // 显示对应的折叠/展开指示器
      if (collapsed) {
        node.setAttrByPath('collapsedIndicator/visibility', 'visible');
        node.setAttrByPath('collapsedIndicatorText/visibility', 'visible');
        node.setAttrByPath('expandedIndicator/visibility', 'hidden');
        node.setAttrByPath('expandedIndicatorText/visibility', 'hidden');
      } else {
        node.setAttrByPath('expandedIndicator/visibility', 'visible');
        node.setAttrByPath('expandedIndicatorText/visibility', 'visible');
        node.setAttrByPath('collapsedIndicator/visibility', 'hidden');
        node.setAttrByPath('collapsedIndicatorText/visibility', 'hidden');
      }
    }
  });

  // 当鼠标移出节点时，隐藏折叠/展开指示器
  graph.on('node:mouseleave', ({ node }) => {
    const nodeId = node.id.toString();

    // 隐藏所有指示器，除非节点当前已折叠
    const collapsed = isNodeCollapsed(nodeId);

    if (!collapsed) {
      node.setAttrByPath('expandedIndicator/visibility', 'hidden');
      node.setAttrByPath('expandedIndicatorText/visibility', 'hidden');
      node.setAttrByPath('collapsedIndicator/visibility', 'hidden');
      node.setAttrByPath('collapsedIndicatorText/visibility', 'hidden');
    }
  });

  // 节点选择
  graph.on('node:selected', ({ node }) => {
    node.attr('body/strokeWidth', 2);
  });

  // 节点取消选择
  graph.on('node:unselected', ({ node }) => {
    node.attr('body/strokeWidth', 1.5);
  });
};
