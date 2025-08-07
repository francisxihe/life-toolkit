import { Graph } from '@antv/x6';

/**
 * 注册键盘快捷键
 * @param graph X6 Graph 实例
 * @param handlers 操作函数
 */
export const registerKeyboardShortcuts = (
  graph: Graph,
  handlers: {
    addChild: (nodeId: string, label: string) => void;
    addSibling: (nodeId: string, label: string) => void;
    deleteNode: (nodeId: string) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    toggleCollapse?: (nodeId: string) => void;
  }
) => {
  const { addChild, addSibling, deleteNode, zoomIn, zoomOut, toggleCollapse } = handlers;

  // 空格键 - 切换节点折叠/展开状态
  graph.bindKey('space', e => {
    e.preventDefault();
    const cells = graph.getSelectedCells();
    if (cells.length === 1 && cells[0].isNode() && toggleCollapse) {
      const nodeId = cells[0].id.toString();
      toggleCollapse(nodeId);
    }
    return false;
  });

  // Tab键 - 添加子节点
  graph.bindKey('tab', e => {
    e.preventDefault();
    const cells = graph.getSelectedCells();
    if (cells.length === 1 && cells[0].isNode()) {
      const nodeId = cells[0].id.toString();
      addChild(nodeId, '新节点');
    }
  });

  // Enter键 - 添加兄弟节点
  graph.bindKey('enter', e => {
    e.preventDefault();
    const cells = graph.getSelectedCells();
    if (cells.length === 1 && cells[0].isNode()) {
      const nodeId = cells[0].id.toString();
      addSibling(nodeId, '新节点');
    }
  });

  // Delete键 - 删除节点
  graph.bindKey(['delete', 'backspace'], e => {
    e.preventDefault();
    const cells = graph.getSelectedCells();
    if (cells.length > 0) {
      cells.forEach(cell => {
        if (cell.isNode()) {
          deleteNode(cell.id.toString());
        }
      });
    }
  });

  // Ctrl+Z - 撤销
  graph.bindKey(['ctrl+z', 'cmd+z'], () => {
    if (graph.canUndo()) {
      graph.undo();
    }
    return false;
  });

  // Ctrl+Y - 重做
  graph.bindKey(['ctrl+y', 'cmd+shift+z'], () => {
    if (graph.canRedo()) {
      graph.redo();
    }
    return false;
  });

  // Ctrl+C - 复制
  graph.bindKey(['ctrl+c', 'cmd+c'], () => {
    const cells = graph.getSelectedCells();
    if (cells.length > 0) {
      graph.copy(cells);
    }
    return false;
  });

  // Ctrl+V - 粘贴
  graph.bindKey(['ctrl+v', 'cmd+v'], () => {
    if (!graph.isClipboardEmpty()) {
      const cells = graph.paste({ offset: 20 });
      graph.cleanSelection();
      graph.select(cells);
    }
    return false;
  });

  // Ctrl+A - 全选
  graph.bindKey(['ctrl+a', 'cmd+a'], () => {
    const nodes = graph.getNodes();
    if (nodes.length > 0) {
      graph.select(nodes);
    }
    return false;
  });

  // Ctrl++ - 放大
  graph.bindKey(['ctrl+=', 'cmd+='], () => {
    zoomIn();
    return false;
  });

  // Ctrl+- - 缩小
  graph.bindKey(['ctrl+-', 'cmd+-'], () => {
    zoomOut();
    return false;
  });

  // Esc - 清除选择
  graph.bindKey('esc', () => {
    graph.cleanSelection();
    return false;
  });
};
