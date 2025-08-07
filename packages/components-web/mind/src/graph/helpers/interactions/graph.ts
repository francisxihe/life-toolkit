import { Graph } from '@antv/x6';
import { Transform } from '@antv/x6-plugin-transform';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
import { Clipboard } from '@antv/x6-plugin-clipboard';
import { History } from '@antv/x6-plugin-history';
import { Snapline } from '@antv/x6-plugin-snapline';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { Export } from '@antv/x6-plugin-export';
import { Scroller } from '@antv/x6-plugin-scroller';

/**
 * 添加交互插件到图形
 * @param graph X6 Graph 实例
 * @param container DOM容器
 */
export const setupInteractions = (graph: Graph, container?: HTMLElement) => {
  // 选择插件
  graph.use(
    new Selection({
      multiple: true,
      rubberband: false, // 禁用框选功能，防止与画布移动冲突
      movable: true,
      showNodeSelectionBox: true,
      showEdgeSelectionBox: false,
      strict: false, // 允许点击空白处取消选择
    })
  );

  // 键盘插件
  graph.use(
    new Keyboard({
      global: true,
      enabled: true,
    })
  );

  // 变换插件 - 支持拖拽、缩放等
  graph.use(
    new Transform({
      resizing: {
        enabled: false,
      },
      rotating: {
        enabled: false,
      },
    })
  );

  // 剪贴板插件
  graph.use(
    new Clipboard({
      enabled: true,
    })
  );

  // 历史记录插件
  graph.use(
    new History({
      enabled: true,
      beforeAddCommand: (event, args) => {
        // 可以在这里过滤一些不需要记录的操作
        return true;
      },
    })
  );

  // 对齐线插件
  graph.use(
    new Snapline({
      enabled: true,
      sharp: true,
    })
  );

  // 滚动画布插件
  graph.use(
    new Scroller({
      enabled: true,
      pannable: true,
      pageVisible: false,
      autoResize: true,
      padding: 50,
    })
  );

  // 导出功能插件
  graph.use(new Export());

  // 设置画布交互
  graph.on('blank:click', () => {
    graph.cleanSelection();
  });

  // 允许通过滚轮缩放
  graph.on('mousewheel', e => {
    if (e.originalEvent?.ctrlKey || e.originalEvent?.metaKey) {
      const delta = e.originalEvent.deltaY;
      if (delta > 0) {
        graph.zoom(-0.1);
      } else {
        graph.zoom(0.1);
      }
      e.originalEvent.preventDefault();
    }
  });
};
