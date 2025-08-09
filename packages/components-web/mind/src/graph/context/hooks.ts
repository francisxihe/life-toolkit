import { useCallback } from 'react';
import { Graph } from '@antv/x6';
import { toggleNodeCollapse } from '../helpers/nodeOperations';

interface UseGraphOperationsParams {
  graph: Graph | null;
  zoom: number;
  setZoom: (zoom: number) => void;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
}

/**
 * 图形操作相关的hooks
 */
export const useGraphOperations = ({
  graph,
  zoom,
  setZoom,
  position,
  setPosition,
}: UseGraphOperationsParams) => {
  /**
   * 居中内容
   */
  const centerContent = useCallback(() => {
    if (graph) {
      graph.centerContent();
    }
  }, [graph]);

  /**
   * 放大
   */
  const zoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + 0.1, 2);
    setZoom(newZoom);

    if (graph) {
      graph.zoom(newZoom);
    }
  }, [zoom, graph, setZoom]);

  /**
   * 缩小
   */
  const zoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - 0.1, 0.5);
    setZoom(newZoom);

    if (graph) {
      graph.zoom(newZoom);
    }
  }, [zoom, graph, setZoom]);

  /**
   * 适应内容
   */
  const fitToContent = useCallback(() => {
    if (graph) {
      graph.zoomToFit({ padding: 20 });
      const currentZoom = graph.zoom();
      setZoom(currentZoom);
    }
  }, [graph, setZoom]);

  /**
   * 重置视图
   */
  const resetView = useCallback(() => {
    if (graph) {
      setZoom(0.8);
      setPosition({ x: 0, y: 0 });
      graph.zoom(0.8);
      graph.centerContent();
    }
  }, [graph, setZoom, setPosition]);

  /**
   * 切换节点折叠状态
   */
  const handleToggleNodeCollapse = useCallback(
    (nodeId: string, collapsed?: boolean) => {
      if (graph) {
        toggleNodeCollapse(graph, nodeId, collapsed);
      }
    },
    [graph]
  );

  /**
   * 撤销操作
   */
  const handleUndo = useCallback(() => {
    if (graph && graph.canUndo()) {
      graph.undo();
    }
  }, [graph]);

  /**
   * 重做操作
   */
  const handleRedo = useCallback(() => {
    if (graph && graph.canRedo()) {
      graph.redo();
    }
  }, [graph]);

  /**
   * 复制操作
   */
  const handleCopy = useCallback(
    (nodeId?: string) => {
      if (graph) {
        if (nodeId) {
          const cell = graph.getCellById(nodeId);
          if (cell) {
            graph.copy([cell]);
          }
        } else {
          const selectedCells = graph.getSelectedCells();
          if (selectedCells.length > 0) {
            graph.copy(selectedCells);
          }
        }
      }
    },
    [graph]
  );

  /**
   * 粘贴操作
   */
  const handlePaste = useCallback(() => {
    if (graph && !graph.isClipboardEmpty()) {
      const cells = graph.paste({ offset: 20 });
      graph.cleanSelection();
      graph.select(cells);
    }
  }, [graph]);

  return {
    centerContent,
    zoomIn,
    zoomOut,
    fitToContent,
    resetView,
    toggleNodeCollapse: handleToggleNodeCollapse,
    undo: handleUndo,
    redo: handleRedo,
    copy: handleCopy,
    paste: handlePaste,
  };
};
