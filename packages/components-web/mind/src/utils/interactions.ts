import { Graph } from '@antv/x6';
import { Transform } from '@antv/x6-plugin-transform';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { History } from '@antv/x6-plugin-history';

/**
 * 添加交互插件到图形
 * @param graph X6 Graph 实例
 */
export const setupInteractions = (graph: Graph) => {
  // 选择插件
  graph.use(new Selection({
    multiple: true,
    rubberband: true,
    showNodeSelectionBox: true,
    showEdgeSelectionBox: false,
  }));

  // 键盘插件
  graph.use(new Keyboard({
    global: true,
  }));

  // 变换插件 - 支持拖拽、缩放等
  graph.use(
    new Transform({
      resizing: {
        enabled: false,
      },
      rotating: {
        enabled: false,
      },
    }),
  );

  // 剪贴板插件
  graph.use(new Clipboard({
    enabled: true,
  }));

  // 历史记录插件
  graph.use(new History({
    enabled: true,
    beforeAddCommand: (event, args) => {
      // 可以在这里过滤一些不需要记录的操作
      return true;
    },
  }));
};

/**
 * 注册键盘快捷键
 * @param graph X6 Graph 实例
 * @param handlers 操作函数
 */
export const registerKeyboardShortcuts = (graph: Graph, handlers: {
  addChild: (nodeId: string, label: string) => void;
  addSibling: (nodeId: string, label: string) => void;
  deleteNode: (nodeId: string) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}) => {
  const { addChild, addSibling, deleteNode, zoomIn, zoomOut } = handlers;

  // Tab键 - 添加子节点
  graph.bindKey('tab', (e) => {
    e.preventDefault();
    const cells = graph.getSelectedCells();
    if (cells.length === 1 && cells[0].isNode()) {
      const nodeId = cells[0].id.toString();
      addChild(nodeId, '新节点');
    }
  });

  // Enter键 - 添加兄弟节点
  graph.bindKey('enter', (e) => {
    e.preventDefault();
    const cells = graph.getSelectedCells();
    if (cells.length === 1 && cells[0].isNode()) {
      const nodeId = cells[0].id.toString();
      addSibling(nodeId, '新节点');
    }
  });

  // Delete键 - 删除节点
  graph.bindKey(['delete', 'backspace'], (e) => {
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

  // 节点选择
  graph.on('node:selected', ({ node }) => {
    node.attr('body/strokeWidth', 2);
  });

  // 节点取消选择
  graph.on('node:unselected', ({ node }) => {
    node.attr('body/strokeWidth', 1.5);
  });
};