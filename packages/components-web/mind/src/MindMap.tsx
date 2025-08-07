import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Graph } from '@antv/x6';
import Hierarchy from '@antv/hierarchy';
import { MindMapProvider, useMindMapContext } from './context';
import {
  MindMapData,
  MindMapOptions,
  DEFAULT_MIND_MAP_OPTIONS,
  HierarchyResult,
  ENodeType,
} from './types';
import { registerMindMapComponents } from './graph/helpers';
import { registerKeyboardShortcuts, setupMouseInteractions } from './graph/helpers/interactions';
import MindMapToolbar from './features/MindMapToolbar';
import NodeEditor from './features/NodeEditor';
import { ExportModal, ImportModal } from './features/ExportImportModals';
import { toggleNodeCollapse } from './graph/helpers/nodeOperations';
import MiniMapContainer from './features/MiniMap';
import './style.css';
import { registerGraph } from './graph/graph';
import MindMapGraph from './graph';

// 注册所有思维导图相关组件
registerMindMapComponents();

interface EnhancedMindMapProps {
  data: MindMapData | null;
  options?: Partial<MindMapOptions>;
  onChange?: (data: MindMapData | null) => void;
  onNodeClick?: (nodeId: string) => void;
  showToolbar?: boolean;
  showInternalToolbar?: boolean;
  className?: string;
  onGraphReady?: (graph: Graph) => void;
  minimapVisible?: boolean;
  onFullscreen?: () => void;
  onExport?: () => void;
  onToggleMinimap?: (visible: boolean) => void;
}

/**
 * 内部MindMap组件
 * 使用MindMapContext中的状态和方法
 */
const InternalMindMap: React.FC<EnhancedMindMapProps> = ({
  options = {},
  onChange,
  onNodeClick,
  showToolbar = true,
  showInternalToolbar = false,
  className = '',
  onGraphReady,
  minimapVisible = false,
  onFullscreen,
  onExport,
  onToggleMinimap,
}) => {
  const {
    mindMapData,
    setMindMapData,
    setGraph,
    graph,
    selectedNodeId,
    setSelectedNodeId,
    zoom,
    position,
    addChild,
    addSibling,
    deleteNode,
    zoomIn,
    zoomOut,
    graphRef,
    containerRef,
  } = useMindMapContext();

  const [nodeEditorVisible, setNodeEditorVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);

  const mergedOptions = { ...DEFAULT_MIND_MAP_OPTIONS, ...options };

  // 初始化图形
  useEffect(() => {
    if (!containerRef.current || !graphRef.current) return;

    const newGraph = registerGraph(
      graphRef.current,
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );

    // 设置图形实例
    setGraph(newGraph);

    newGraph.zoomTo(zoom);

    // 如果提供了图形就绪回调，则调用它
    if (onGraphReady) {
      onGraphReady(newGraph);
    }

    // 注册节点点击事件
    newGraph.on('node:click', ({ node }) => {
      const nodeId = node.id.toString();
      setSelectedNodeId(nodeId);

      if (onNodeClick) {
        onNodeClick(nodeId);
      } else {
        // 默认行为：打开节点编辑器
        setNodeEditorVisible(true);
      }
    });

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry && entry.contentRect && graphRef.current && newGraph) {
          // 获取容器的当前尺寸
          const { width, height } = entry.contentRect;

          // 防止尺寸过小
          if (width > 200 && height > 200) {
            newGraph.resize(width, height);

            if (mergedOptions.centerOnResize) {
              newGraph.centerContent();
            }
          }
        }
      }
    });

    // 只监听容器自身
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current.parentElement!);
    }

    // 清理函数
    return () => {
      resizeObserver.disconnect();
      newGraph.dispose();
    };
  }, [
    mergedOptions.enableShortcuts,
    mergedOptions.centerOnResize,
    onNodeClick,
    onGraphReady,
    setGraph,
    setSelectedNodeId,
    minimapVisible,
  ]);

  // 当数据变化时触发 onChange
  useEffect(() => {
    if (onChange) {
      onChange(mindMapData);
    }
  }, [mindMapData, onChange]);

  // 当缩放和位置变化时应用
  useEffect(() => {
    if (graph) {
      graph.zoom(zoom);
      graph.translate(position.x, position.y);
    }
  }, [graph, zoom, position]);

  // 导入数据
  const handleImport = (data: MindMapData) => {
    setMindMapData(data);
  };

  return (
    <div
      ref={containerRef}
      className={`mind-map w-full h-full flex flex-col ${className}`}
      style={{ position: 'relative' }}
    >
      {showInternalToolbar && (
        <MindMapToolbar
          mode="compact"
          onFullscreen={onFullscreen}
          onExport={onExport}
          onToggleMinimap={onToggleMinimap}
        />
      )}
      {showToolbar && (
        <MindMapToolbar
          mode="full"
          onExport={() => setExportModalVisible(true)}
          onImport={() => setImportModalVisible(true)}
          onToggleMinimap={onToggleMinimap}
        />
      )}
      <MindMapGraph />

      {/* 节点编辑器 */}
      <NodeEditor
        visible={nodeEditorVisible}
        nodeId={selectedNodeId}
        onClose={() => setNodeEditorVisible(false)}
      />

      {/* 导出模态框 */}
      <ExportModal visible={exportModalVisible} onClose={() => setExportModalVisible(false)} />

      {/* 导入模态框 */}
      <ImportModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onImport={handleImport}
      />

      {<MiniMapContainer visible={minimapVisible} />}
    </div>
  );
};

/**
 * 增强型思维导图组件
 * 使用MindMapProvider提供上下文
 */
const MindMap: React.FC<EnhancedMindMapProps> = props => {
  return (
    <MindMapProvider initialData={props.data}>
      <InternalMindMap {...props} />
    </MindMapProvider>
  );
};

export default MindMap;
