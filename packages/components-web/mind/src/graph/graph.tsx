import { Graph } from '@antv/x6';
import { registerFilters } from './helpers';
import { setupInteractions } from './helpers/interactions';

export function initGraph(graphRef: HTMLDivElement, width: number, height: number) {
  const newGraph = new Graph({
    container: graphRef,
    width,
    height,
    background: {
      color: '#FAFCFF',
    },
    grid: {
      visible: true,
      type: 'doubleMesh',
      args: [
        {
          color: '#f0f2f5',
          thickness: 1,
        },
        {
          color: '#e6e9ed',
          thickness: 1,
          factor: 5,
        },
      ],
    },
    mousewheel: {
      enabled: true,
      zoomAtMousePosition: true,
      minScale: 0.5,
      maxScale: 3,
    },
    connecting: {
      connectionPoint: 'anchor',
    },
  });

  // 注册必要的滤镜
  registerFilters(newGraph);

  // 设置交互能力
  setupInteractions(newGraph);

  return newGraph;
}
