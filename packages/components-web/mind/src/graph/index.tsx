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

  const mergedOptions = { ...DEFAULT_MIND_MAP_OPTIONS, ...options };

  // 初始化图形
  useEffect(() => {
    if (!containerRef.current || !graphRef.current) return;

    const newGraph = initGraph(
      graphRef.current,
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );

    newGraph.zoomTo(zoom);

    // 设置图形实例
    setGraph(newGraph);

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

    setTimeout(() => {
      graphEventEmitter.emitGraph(newGraph);
    }, 1000);

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
            data: {
              id: data.id,
              label: data.label,
              type: data.type,
              hasChildren: children && children.length > 0,
              isCollapsed: collapsedStates.has(data.id),
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
      console.log(`Created ${cells.length} cells`);
      setTimeout(() => {
        graph.resetCells(cells);
      }, 0);

      // 居中内容
      graph.centerContent();
      console.log('Mind map rendered successfully');
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
      ref={graphRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
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
