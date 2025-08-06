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

  // 如果提供了容器，创建小地图
  if (container) {
    const minimapContainer = document.createElement('div');
    minimapContainer.className = 'x6-graph-minimap';
    minimapContainer.style.position = 'absolute';
    minimapContainer.style.right = '20px';
    minimapContainer.style.bottom = '20px';
    minimapContainer.style.width = '150px';
    minimapContainer.style.height = '120px';
    minimapContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    minimapContainer.style.border = '1px solid #ddd';
    minimapContainer.style.borderRadius = '4px';
    minimapContainer.style.zIndex = '999';
    minimapContainer.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.15)';
    container.appendChild(minimapContainer);

    graph.use(
      new MiniMap({
        container: minimapContainer,
        width: 150,
        height: 120,
        padding: 10,
      })
    );
  }

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

  // 允许手动根据鼠标移动画布
  // 注意：这里的处理已由 Panning 插件接管，此代码仅作为备选方案
//   graph.on('blank:mousedown', e => {
//     if (!e.originalEvent) return;

//     // 防止框选行为
//     e.e.stopPropagation();

//     // 如果 Panning 插件已启用，让它处理拖拽
//     // if (graph.isPluginEnabled('panning')) return;

//     // 保存初始坐标
//     const x = e.originalEvent.clientX;
//     const y = e.originalEvent.clientY;
//     let lastX = x;
//     let lastY = y;

//     // 移动处理函数
//     const moveHandler = (moveEvent: MouseEvent) => {
//       // 计算增量位移
//       const dx = moveEvent.clientX - lastX;
//       const dy = moveEvent.clientY - lastY;

//       // 更新上次坐标
//       lastX = moveEvent.clientX;
//       lastY = moveEvent.clientY;

//       // 移动画布
//       graph.translate(dx, dy);
//     };

//     // 释放处理函数
//     const upHandler = () => {
//       document.removeEventListener('mousemove', moveHandler);
//       document.removeEventListener('mouseup', upHandler);
//     };

//     // 添加事件监听
//     document.addEventListener('mousemove', moveHandler);
//     document.addEventListener('mouseup', upHandler);
//   });
};
