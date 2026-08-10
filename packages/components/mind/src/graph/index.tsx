import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Graph } from '@antv/x6';
import Hierarchy from '@antv/hierarchy';
import { useMindMapContext } from '../context';
import { MindMapGraphProvider, useMindMapGraphContext } from './context';
import {
  MindMapData,
  MindMapOptions,
  DEFAULT_MIND_MAP_OPTIONS,
  HierarchyResult,
  ENodeType,
} from '../types';
import { registerKeyboardShortcuts, setupMouseInteractions } from './helpers/interactions';
import { toggleNodeCollapse } from './helpers/nodeOperations';
import { initGraph } from './graph';
import { registerGraphNode } from './helpers';
import { graphEventEmitter } from './eventEmitter';

interface MindMapGraphProps {
  options?: Partial<MindMapOptions>;
  onChange?: (data: MindMapData | null) => void;
  onNodeClick?: (nodeId: string) => void;
  onGraphReady?: (graph: Graph) => void;
  MindMapNode?: React.ComponentType<any>;
}

/**
 * 内部MindMap组件
 * 使用MindMapContext中的状态和方法
 */
const InternalMindMapGraph: React.FC<MindMapGraphProps> = ({
  options = {},
  onChange,
  onNodeClick,
  onGraphReady,
  MindMapNode,
}) => {
  // 从业务context获取数据相关状态
  const {
    mindMapData,
    selectedNodeId,
    setSelectedNodeId,
    addChild,
    addSibling,
    deleteNode,
    containerRef,
  } = useMindMapContext();

  // 从画布context获取画布相关状态
  const { graph, setGraph, zoom, position, zoomIn, zoomOut, graphRef } = useMindMapGraphContext();
  const hostRef = useRef<HTMLDivElement>(null);

  const mergedOptions = { ...DEFAULT_MIND_MAP_OPTIONS, ...options };

  // 初始化图形
  useEffect(() => {
    if (!containerRef.current || !graphRef.current || !hostRef.current) return;

    let newGraph: Graph | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    const hostEl = hostRef.current;

    // 使用setTimeout延迟初始化，避免同步卸载问题
    const timerId = setTimeout(() => {
      if (!containerRef.current || !graphRef.current || !hostEl) return;

      const containerW = containerRef.current.clientWidth;
      const containerH = containerRef.current.clientHeight;
      const hostW = hostEl.clientWidth;
      const hostH = hostEl.clientHeight;
      const initW = hostW > 0 ? hostW : containerW;
      const initH = hostH > 0 ? hostH : containerH;

      newGraph = initGraph(
        graphRef.current,
        initW,
        initH
      );

      newGraph.zoomTo(zoom);

      // 设置图形实例
      setGraph(newGraph);

      // 如果提供了图形就纪回调，则调用它
      if (onGraphReady) {
        onGraphReady(newGraph);
      }

      // 注册节点点击事件
      newGraph.on('node:click', ({ node }) => {
        const nodeId = node.id.toString();

        // 清除所有节点的选中状态
        newGraph.getNodes().forEach(n => {
          n.setData({ ...n.getData(), isSelected: false });
        });

        // 设置当前节点为选中状态
        node.setData({ ...node.getData(), isSelected: true });

        setSelectedNodeId(nodeId);

        if (onNodeClick) {
          onNodeClick(nodeId);
        }
      });

      // 注册空白区域点击事件，取消选中
      newGraph.on('blank:click', () => {
        // 清除所有节点的选中状态
        newGraph.getNodes().forEach(n => {
          n.setData({ ...n.getData(), isSelected: false });
        });

        setSelectedNodeId(null);
      });

      // 只监听外层 host（布局尺寸），不监听 scroller/graph 内部，避免 autoResize 放大循环
      let lastSize = { width: 0, height: 0 };
      resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          if (entry && entry.contentRect && newGraph) {
            const { width, height } = entry.contentRect;
            if (
              width > 0 &&
              height > 0 &&
              (Math.abs(width - lastSize.width) > 1 ||
                Math.abs(height - lastSize.height) > 1)
            ) {
              lastSize = { width, height };
              newGraph.resize(width, height);
            }
          }
        }
      });

      resizeObserver.observe(hostEl);

      // 延迟发送graph实例，确保组件已完全渲染
      timeoutId = setTimeout(() => {
        if (newGraph) {
          graphEventEmitter.emitGraph(newGraph);
        }
      }, 300);
    }, 0);

    // 清理函数
    return () => {
      clearTimeout(timerId);
      if (timeoutId) clearTimeout(timeoutId);

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (newGraph) {
        // 确保在新的渲染周期处理卸载
        requestAnimationFrame(() => {
          try {
            newGraph.dispose();
          } catch (err) {
            console.error('Error disposing graph:', err);
          }
        });
      }
    };
  }, [
    mergedOptions.enableShortcuts,
    onNodeClick,
    onGraphReady,
    setGraph,
    setSelectedNodeId,
  ]);

  // 初始化图形
  useEffect(() => {
    registerGraphNode(MindMapNode);
  }, [MindMapNode]);

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
  }, [
    graph,
    mergedOptions.enableShortcuts,
    MindMapNode,
    addChild,
    addSibling,
    deleteNode,
    zoomIn,
    zoomOut,
  ]);

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
      const existingNodes = graph.getNodes();
      existingNodes.forEach(node => {
        const nodeId = node.id.toString();
        const isCollapsed = node.getAttrByPath('collapsed') || false;
        if (isCollapsed) {
          collapsedStates.set(nodeId, true);
        }
      });

      // 清空画布，避免渲染冲突
      graph.clearCells();

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
            data: {
              id: data.id,
              label: data.label,
              type: data.type,
              hasChildren: children && children.length > 0,
              isCollapsed: collapsedStates.has(data.id),
              isSelected: false, // 初始化选中状态为 false
            },
          });

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
                      data.type === ENodeType.topicChild
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
      setTimeout(() => {
        graph.resetCells(cells);
        graph.centerContent();
      }, 0);
    } catch (error) {
      console.error('Error rendering mind map:', error);
    }
  }, [graph, mindMapData, mergedOptions.direction, mergedOptions.hGap, mergedOptions.vGap]);

  useEffect(() => {
    // 如果有选中的节点，高亮它
    // if (selectedNodeId) {
    //   const selectedNode = graph.getCellById(selectedNodeId);
    //   if (selectedNode && selectedNode.isNode()) {
    //     graph.select(selectedNode);
    //   }
    // }
  }, [selectedNodeId]);

  // 当数据变化时重新渲染
  useEffect(() => {
    if (graph && mindMapData) {
      renderMindMap();
    }
  }, [graph, mindMapData, renderMindMap]);

  // 当数据变化时触发 onChange
  useEffect(() => {
    if (onChange) {
      onChange(mindMapData);
    }
  }, [mindMapData, onChange]);

  return (
    <div
      ref={hostRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        ref={graphRef}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

/**
 * 思维导图画布组件
 * 包装了MindMapGraphProvider和InternalMindMapGraph
 */
const MindMapGraph: React.FC<MindMapGraphProps> = props => {
  return (
    <MindMapGraphProvider>
      <InternalMindMapGraph {...props} />
    </MindMapGraphProvider>
  );
};

export default MindMapGraph;

// 导出事件发射器相关
export { GraphEventEmitter, graphEventEmitter } from './eventEmitter';
