import { useState, useRef, useMemo, ReactNode, RefObject } from 'react';
import { Graph } from '@antv/x6';
import { useGraphOperations } from './hooks';
import { GraphEventEmitter } from '../eventEmitter';
import { createInjectState } from '@life-toolkit/common-web-utils';

export const [MindMapGraphProvider, useMindMapGraphContext] = createInjectState<{
  PropsType: {
    children: ReactNode;
  };
  ContextType: {
    // 画布状态
    graph: Graph | null;
    zoom: number;
    position: { x: number; y: number };

    // Refs
    graphRef: RefObject<HTMLDivElement>;

    // 事件发射器
    eventEmitter: GraphEventEmitter;

    // 设置方法
    setGraph: (graph: Graph | null) => void;
    setZoom: (zoom: number) => void;
    setPosition: (position: { x: number; y: number }) => void;

    // 画布操作方法
    centerContent: () => void;
    zoomIn: () => void;
    zoomOut: () => void;
    fitToContent: () => void;
    resetView: () => void;
    toggleNodeCollapse: (nodeId: string, collapsed?: boolean) => void;
  };
}>(({ children }) => {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [zoom, setZoom] = useState<number>(0.8);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const graphRef = useRef<HTMLDivElement>(null);

  // 创建事件发射器实例
  const eventEmitter = useMemo(() => new GraphEventEmitter(), []);

  // 使用图形操作hooks
  const graphOperations = useGraphOperations({
    graph,
    zoom,
    setZoom,
    position,
    setPosition,
    eventEmitter,
  });

  return {
    graph,
    zoom,
    position,
    graphRef,
    eventEmitter,
    setGraph,
    setZoom,
    setPosition,
    ...graphOperations,
  };
});
