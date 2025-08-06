import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Graph } from '@antv/x6';
import Hierarchy from '@antv/hierarchy';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { MindMapProvider, useMindMap } from '../context';
import { MindMapData, MindMapOptions, DEFAULT_MIND_MAP_OPTIONS, HierarchyResult } from '../types';
import { registerMindMapComponents, registerFilters } from '../styles';
import {
  setupInteractions,
  registerKeyboardShortcuts,
  setupMouseInteractions,
} from '../utils/interactions';
import MindMapToolbar from '../components/MindMapToolbar';
import NodeEditor from '../components/NodeEditor';
import { ExportModal, ImportModal } from '../components/ExportImportModals';
import { toggleNodeCollapse } from '../utils/nodeOperations';
import MiniMapContainer from './MiniMap';
import './style.css';

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
  } = useMindMap();

  const containerRef = useRef<HTMLDivElement>(null);
  const [nodeEditorVisible, setNodeEditorVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);

  const mergedOptions = { ...DEFAULT_MIND_MAP_OPTIONS, ...options };

  // 初始化图形
  useEffect(() => {
    if (!containerRef.current || !graphRef.current) return;

    const newGraph = new Graph({
      container: graphRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
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
        modifiers: mergedOptions.enableShortcuts ? 'ctrl' : null,
        minScale: 0.5,
        maxScale: 3,
      },
      connecting: {
        connectionPoint: 'anchor',
      },
    });

    newGraph.zoomTo(zoom);

    // 设置图形实例
    setGraph(newGraph);

    // 如果提供了图形就绪回调，则调用它
    if (onGraphReady) {
      onGraphReady(newGraph);
    }

    // 注册必要的滤镜
    registerFilters(newGraph);

    // 设置交互能力
    setupInteractions(newGraph, minimapVisible ? graphRef.current : undefined);

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

  // 注册键盘快捷键
  useEffect(() => {
    if (graph && mergedOptions.enableShortcuts) {
      const handlers = {
        addChild,
        addSibling,
        deleteNode,
        zoomIn,
        zoomOut,
        toggleCollapse: (nodeId: string) => {
          if (graph) {
            toggleNodeCollapse(graph, nodeId);
          }
        },
      };
      registerKeyboardShortcuts(graph, handlers);
    }
  }, [graph, mergedOptions.enableShortcuts, addChild, addSibling, deleteNode, zoomIn, zoomOut]);

  // 设置鼠标交互
  useEffect(() => {
    if (graph) {
      setupMouseInteractions(graph);
    }
  }, [graph]);

  // 渲染脑图
  const renderMindMap = useCallback(() => {
    if (!graph || !mindMapData) {
      console.log('Cannot render: graph or mindMapData is null', {
        graph,
        mindMapData,
      });
      return;
    }

    console.log('Rendering mind map with data:', mindMapData);

    try {
      // 保存当前的折叠状态
      const collapsedStates = new Map<string, boolean>();
      graph.getNodes().forEach(node => {
        const nodeId = node.id.toString();
        const isCollapsed = node.getAttrByPath('collapsed') || false;
        if (isCollapsed) {
          collapsedStates.set(nodeId, true);
        }
      });
      
      const result: HierarchyResult = Hierarchy.mindmap(mindMapData, {
        direction: mergedOptions.direction === 'V' ? 'V' : 'H',
        getHeight(d: MindMapData) {
          return d.height;
        },
        getWidth(d: MindMapData) {
          return d.width;
        },
        getHGap() {
          return mergedOptions.hGap || 50;
        },
        getVGap() {
          return mergedOptions.vGap || 25;
        },
        getSide: () => {
          return 'right';
        },
      });

      console.log('Hierarchy result:', result);

      const cells: any[] = [];
      const traverse = (hierarchyItem: HierarchyResult) => {
        if (hierarchyItem) {
          const { data, children } = hierarchyItem;
          const node = graph.createNode({
            id: data.id,
            shape: data.type,
            x: hierarchyItem.x,
            y: hierarchyItem.y,
            width: data.width,
            height: data.height,
            label: data.label,
            type: data.type,
          });
          
          // 恢复折叠状态
          if (collapsedStates.has(data.id)) {
            node.setAttrByPath('collapsed', true);
          }
          
          cells.push(node);

          if (children) {
            children.forEach((item: HierarchyResult) => {
              const { id, data } = item;
              cells.push(
                graph.createEdge({
                  shape: 'mindmap-edge',
                  source: {
                    cell: hierarchyItem.id,
                    anchor:
                      data.type === 'topic-child'
                        ? {
                            name: 'right',
                            args: {
                              dx: -16,
                            },
                          }
                        : {
                            name: 'center',
                            args: {
                              dx: '25%',
                            },
                          },
                  },
                  target: {
                    cell: id,
                    anchor: {
                      name: 'left',
                    },
                  },
                })
              );
              traverse(item);
            });
          }
        }
      };

      traverse(result);
      console.log(`Created ${cells.length} cells`);

      graph.resetCells(cells);

      // 如果有选中的节点，高亮它
      if (selectedNodeId) {
        const selectedNode = graph.getCellById(selectedNodeId);
        if (selectedNode && selectedNode.isNode()) {
          graph.select(selectedNode);
        }
      }

      // 居中内容
      graph.centerContent();
      console.log('Mind map rendered successfully');
    } catch (error) {
      console.error('Error rendering mind map:', error);
    }
  }, [graph, mindMapData, mergedOptions.direction, mergedOptions.hGap, mergedOptions.vGap, selectedNodeId]);

  // 当数据变化时重新渲染
  useEffect(() => {
    if (graph && mindMapData) {
      console.log('MindMap data or graph changed, rendering...');
      renderMindMap();
    }
  }, [
    graph,
    mindMapData,
    mergedOptions.direction,
    mergedOptions.hGap,
    mergedOptions.vGap,
    renderMindMap,
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
      <div
        ref={graphRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />

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
const EnhancedMindMap: React.FC<EnhancedMindMapProps> = props => {
  return (
    <MindMapProvider initialData={props.data}>
      <InternalMindMap {...props} />
    </MindMapProvider>
  );
};

export default EnhancedMindMap;
