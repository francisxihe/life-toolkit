import mitt, { Emitter } from 'mitt';

/**
 * 图形操作事件类型
 */
export enum GraphEventType {
  ZOOM_IN = 'zoomIn',
  ZOOM_OUT = 'zoomOut',
  CENTER_CONTENT = 'centerContent',
  SET_ZOOM = 'setZoom',
  SET_POSITION = 'setPosition',
  FIT_TO_CONTENT = 'fitToContent',
  RESET_VIEW = 'resetView',
  TOGGLE_NODE_COLLAPSE = 'toggleNodeCollapse',
  UNDO = 'undo',
  REDO = 'redo',
  COPY = 'copy',
  PASTE = 'paste',
  EMIT_GRAPH = 'emitGraph',
}

/**
 * 事件数据接口
 */
export interface GraphEventData extends Record<string | symbol, any> {
  [GraphEventType.ZOOM_IN]: void;
  [GraphEventType.ZOOM_OUT]: void;
  [GraphEventType.CENTER_CONTENT]: void;
  [GraphEventType.SET_ZOOM]: { zoom: number };
  [GraphEventType.SET_POSITION]: { x: number; y: number };
  [GraphEventType.FIT_TO_CONTENT]: void;
  [GraphEventType.RESET_VIEW]: void;
  [GraphEventType.TOGGLE_NODE_COLLAPSE]: { nodeId: string; collapsed?: boolean };
  [GraphEventType.UNDO]: void;
  [GraphEventType.REDO]: void;
  [GraphEventType.COPY]: { nodeId?: string };
  [GraphEventType.PASTE]: void;
  [GraphEventType.EMIT_GRAPH]: { graph: any };
}

/**
 * 图形操作事件发射器
 */
class GraphEventEmitter {
  private emitter: Emitter<GraphEventData>;

  constructor() {
    this.emitter = mitt<GraphEventData>();
  }
  /**
   * 发射缩放事件
   */
  zoomIn(): void {
    this.emitter.emit(GraphEventType.ZOOM_IN, undefined);
  }

  /**
   * 发射缩小事件
   */
  zoomOut(): void {
    this.emitter.emit(GraphEventType.ZOOM_OUT, undefined);
  }

  /**
   * 发射居中内容事件
   */
  centerContent(): void {
    this.emitter.emit(GraphEventType.CENTER_CONTENT, undefined);
  }

  /**
   * 发射设置缩放比例事件
   */
  setZoom(zoom: number): void {
    this.emitter.emit(GraphEventType.SET_ZOOM, { zoom });
  }

  /**
   * 发射设置位置事件
   */
  setPosition(x: number, y: number): void {
    this.emitter.emit(GraphEventType.SET_POSITION, { x, y });
  }

  /**
   * 发射适应内容事件
   */
  fitToContent(): void {
    this.emitter.emit(GraphEventType.FIT_TO_CONTENT, undefined);
  }

  /**
   * 发射重置视图事件
   */
  resetView(): void {
    this.emitter.emit(GraphEventType.RESET_VIEW, undefined);
  }

  /**
   * 发射切换节点折叠状态事件
   */
  toggleNodeCollapse(nodeId: string, collapsed?: boolean): void {
    this.emitter.emit(GraphEventType.TOGGLE_NODE_COLLAPSE, { nodeId, collapsed });
  }

  /**
   * 发射撤销事件
   */
  undo(): void {
    this.emitter.emit(GraphEventType.UNDO, undefined);
  }

  /**
   * 发射重做事件
   */
  redo(): void {
    this.emitter.emit(GraphEventType.REDO, undefined);
  }

  /**
   * 发射复制事件
   */
  copy(nodeId?: string): void {
    this.emitter.emit(GraphEventType.COPY, { nodeId });
  }

  /**
   * 发射粘贴事件
   */
  paste(): void {
    this.emitter.emit(GraphEventType.PASTE, undefined);
  }

  /**
   * 发射graph实例事件
   */
  emitGraph(graph: any): void {
    this.emitter.emit(GraphEventType.EMIT_GRAPH, { graph });
  }

  /**
   * 监听事件的类型安全方法
   */
  onZoomIn(listener: () => void): () => void {
    this.emitter.on(GraphEventType.ZOOM_IN, listener);
    return () => this.emitter.off(GraphEventType.ZOOM_IN, listener);
  }

  onZoomOut(listener: () => void): () => void {
    this.emitter.on(GraphEventType.ZOOM_OUT, listener);
    return () => this.emitter.off(GraphEventType.ZOOM_OUT, listener);
  }

  onCenterContent(listener: () => void): () => void {
    this.emitter.on(GraphEventType.CENTER_CONTENT, listener);
    return () => this.emitter.off(GraphEventType.CENTER_CONTENT, listener);
  }

  onSetZoom(listener: (data: { zoom: number }) => void): () => void {
    this.emitter.on(GraphEventType.SET_ZOOM, listener);
    return () => this.emitter.off(GraphEventType.SET_ZOOM, listener);
  }

  onSetPosition(listener: (data: { x: number; y: number }) => void): () => void {
    this.emitter.on(GraphEventType.SET_POSITION, listener);
    return () => this.emitter.off(GraphEventType.SET_POSITION, listener);
  }

  onFitToContent(listener: () => void): () => void {
    this.emitter.on(GraphEventType.FIT_TO_CONTENT, listener);
    return () => this.emitter.off(GraphEventType.FIT_TO_CONTENT, listener);
  }

  onResetView(listener: () => void): () => void {
    this.emitter.on(GraphEventType.RESET_VIEW, listener);
    return () => this.emitter.off(GraphEventType.RESET_VIEW, listener);
  }

  onToggleNodeCollapse(
    listener: (data: { nodeId: string; collapsed?: boolean }) => void
  ): () => void {
    this.emitter.on(GraphEventType.TOGGLE_NODE_COLLAPSE, listener);
    return () => this.emitter.off(GraphEventType.TOGGLE_NODE_COLLAPSE, listener);
  }

  onUndo(listener: () => void): () => void {
    this.emitter.on(GraphEventType.UNDO, listener);
    return () => this.emitter.off(GraphEventType.UNDO, listener);
  }

  onRedo(listener: () => void): () => void {
    this.emitter.on(GraphEventType.REDO, listener);
    return () => this.emitter.off(GraphEventType.REDO, listener);
  }

  onCopy(listener: (data: { nodeId?: string }) => void): () => void {
    this.emitter.on(GraphEventType.COPY, listener);
    return () => this.emitter.off(GraphEventType.COPY, listener);
  }

  onPaste(listener: () => void): () => void {
    this.emitter.on(GraphEventType.PASTE, listener);
    return () => this.emitter.off(GraphEventType.PASTE, listener);
  }

  onEmitGraph(listener: (data: { graph: any }) => void): () => void {
    this.emitter.on(GraphEventType.EMIT_GRAPH, listener);
    return () => this.emitter.off(GraphEventType.EMIT_GRAPH, listener);
  }

  /**
   * 移除事件监听器的类型安全方法
   */
  offZoomIn(listener: () => void): void {
    this.emitter.off(GraphEventType.ZOOM_IN, listener);
  }

  offZoomOut(listener: () => void): void {
    this.emitter.off(GraphEventType.ZOOM_OUT, listener);
  }

  offCenterContent(listener: () => void): void {
    this.emitter.off(GraphEventType.CENTER_CONTENT, listener);
  }

  offSetZoom(listener: (data: { zoom: number }) => void): void {
    this.emitter.off(GraphEventType.SET_ZOOM, listener);
  }

  offSetPosition(listener: (data: { x: number; y: number }) => void): void {
    this.emitter.off(GraphEventType.SET_POSITION, listener);
  }

  offFitToContent(listener: () => void): void {
    this.emitter.off(GraphEventType.FIT_TO_CONTENT, listener);
  }

  offResetView(listener: () => void): void {
    this.emitter.off(GraphEventType.RESET_VIEW, listener);
  }

  offToggleNodeCollapse(listener: (data: { nodeId: string; collapsed?: boolean }) => void): void {
    this.emitter.off(GraphEventType.TOGGLE_NODE_COLLAPSE, listener);
  }

  offUndo(listener: () => void): void {
    this.emitter.off(GraphEventType.UNDO, listener);
  }

  offRedo(listener: () => void): void {
    this.emitter.off(GraphEventType.REDO, listener);
  }

  offCopy(listener: (data: { nodeId?: string }) => void): void {
    this.emitter.off(GraphEventType.COPY, listener);
  }

  offPaste(listener: () => void): void {
    this.emitter.off(GraphEventType.PASTE, listener);
  }

  offEmitGraph(listener: (data: { graph: any }) => void): void {
    this.emitter.off(GraphEventType.EMIT_GRAPH, listener);
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.emitter.all.clear();
  }
}

// 创建全局事件发射器实例
export const graphEventEmitter = new GraphEventEmitter();

// 导出类
export { GraphEventEmitter };
