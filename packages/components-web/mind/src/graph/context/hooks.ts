import { useCallback, useEffect } from 'react';
import { Graph } from '@antv/x6';
import { GraphEventEmitter } from '../eventEmitter';
import { toggleNodeCollapse } from '../helpers/nodeOperations';

interface UseGraphOperationsParams {
  graph: Graph | null;
  zoom: number;
  setZoom: (zoom: number) => void;
  position: { x: number; y: number };
  setPosition: (position: { x: number; y: number }) => void;
  eventEmitter: GraphEventEmitter;
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
  eventEmitter,
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

  // 监听事件发射器
  useEffect(() => {
    if (!eventEmitter) return;

    const handleZoomIn = () => zoomIn();
    const handleZoomOut = () => zoomOut();
    const handleCenterContent = () => centerContent();
    const handleSetZoom = ({ zoom: newZoom }: { zoom: number }) => {
      setZoom(newZoom);
      if (graph) {
        graph.zoom(newZoom);
      }
    };
    const handleSetPosition = ({ x, y }: { x: number; y: number }) => {
      setPosition({ x, y });
      if (graph) {
        graph.translate(x, y);
      }
    };
    const handleFitToContent = () => fitToContent();
    const handleResetView = () => resetView();
    const handleToggleNodeCollapseEvent = ({
      nodeId,
      collapsed,
    }: {
      nodeId: string;
      collapsed?: boolean;
    }) => {
      handleToggleNodeCollapse(nodeId, collapsed);
    };
    const handleUndoEvent = () => handleUndo();
    const handleRedoEvent = () => handleRedo();
    const handleCopyEvent = ({ nodeId }: { nodeId?: string }) => handleCopy(nodeId);
    const handlePasteEvent = () => handlePaste();

    // 注册事件监听器并获取清理函数
    const unsubscribeZoomIn = eventEmitter.onZoomIn(handleZoomIn);
    const unsubscribeZoomOut = eventEmitter.onZoomOut(handleZoomOut);
    const unsubscribeCenterContent = eventEmitter.onCenterContent(handleCenterContent);
    const unsubscribeSetZoom = eventEmitter.onSetZoom(handleSetZoom);
    const unsubscribeSetPosition = eventEmitter.onSetPosition(handleSetPosition);
    const unsubscribeFitToContent = eventEmitter.onFitToContent(handleFitToContent);
    const unsubscribeResetView = eventEmitter.onResetView(handleResetView);
    const unsubscribeToggleNodeCollapse = eventEmitter.onToggleNodeCollapse(
      handleToggleNodeCollapseEvent
    );
    const unsubscribeUndo = eventEmitter.onUndo(handleUndoEvent);
    const unsubscribeRedo = eventEmitter.onRedo(handleRedoEvent);
    const unsubscribeCopy = eventEmitter.onCopy(handleCopyEvent);
    const unsubscribePaste = eventEmitter.onPaste(handlePasteEvent);

    // 清理函数
    return () => {
      unsubscribeZoomIn();
      unsubscribeZoomOut();
      unsubscribeCenterContent();
      unsubscribeSetZoom();
      unsubscribeSetPosition();
      unsubscribeFitToContent();
      unsubscribeResetView();
      unsubscribeToggleNodeCollapse();
      unsubscribeUndo();
      unsubscribeRedo();
      unsubscribeCopy();
      unsubscribePaste();
    };
  }, [
    eventEmitter,
    zoomIn,
    zoomOut,
    centerContent,
    setZoom,
    setPosition,
    fitToContent,
    resetView,
    handleToggleNodeCollapse,
    handleUndo,
    handleRedo,
    handleCopy,
    handlePaste,
    graph,
  ]);

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
