import React, { useEffect, useRef, useState } from 'react';
import { Graph, Cell, Node, Path } from '@antv/x6';
import { Keyboard } from '@antv/x6-plugin-keyboard';
import { Selection } from '@antv/x6-plugin-selection';
import Hierarchy from '@antv/hierarchy';
import { GoalVo } from '@life-toolkit/vo/growth';
import { openDrawer } from '@/layout/Drawer';
import GoalEditor from '../../components/GoalDetail/GoalEditor';

interface X6MindMapProps {
  goalTree: GoalVo[];
  onNodeClick?: (nodeId: string) => void;
}

interface MindMapData {
  id: string;
  type: 'topic' | 'topic-branch' | 'topic-child';
  label: string;
  width: number;
  height: number;
  children?: MindMapData[];
}

interface HierarchyResult {
  id: string;
  x: number;
  y: number;
  data: MindMapData;
  children?: HierarchyResult[];
}

// 注册中心主题或分支主题节点
Graph.registerNode(
  'topic',
  {
    inherit: 'rect',
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'text',
        selector: 'label',
      },
    ],
    attrs: {
      body: {
        rx: 6,
        ry: 6,
        stroke: '#5F95FF',
        fill: '#EFF4FF',
        strokeWidth: 1,
      },
      label: {
        fontSize: 14,
        fill: '#262626',
      },
    },
  },
  true,
);

// 注册子主题节点
Graph.registerNode(
  'topic-child',
  {
    inherit: 'rect',
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'text',
        selector: 'label',
      },
      {
        tagName: 'path',
        selector: 'line',
      },
    ],
    attrs: {
      body: {
        fill: '#ffffff',
        strokeWidth: 0,
        stroke: '#5F95FF',
      },
      label: {
        fontSize: 14,
        fill: '#262626',
        textVerticalAnchor: 'bottom',
      },
      line: {
        stroke: '#5F95FF',
        strokeWidth: 2,
        d: 'M 0 15 L 60 15',
      },
    },
  },
  true,
);

// 注册脑图连接器
Graph.registerConnector(
  'mindmap',
  (sourcePoint, targetPoint, routerPoints, options) => {
    const midX = sourcePoint.x + 10;
    const midY = sourcePoint.y;
    const ctrX = (targetPoint.x - midX) / 5 + midX;
    const ctrY = targetPoint.y;
    const pathData = `
     M ${sourcePoint.x} ${sourcePoint.y}
     L ${midX} ${midY}
     Q ${ctrX} ${ctrY} ${targetPoint.x} ${targetPoint.y}
    `;
    return options.raw ? Path.parse(pathData) : pathData;
  },
  true,
);

// 注册脑图边
Graph.registerEdge(
  'mindmap-edge',
  {
    inherit: 'edge',
    connector: {
      name: 'mindmap',
    },
    attrs: {
      line: {
        targetMarker: '',
        stroke: '#A2B1C3',
        strokeWidth: 2,
      },
    },
    zIndex: 0,
  },
  true,
);

// 样式将在 style.less 中定义

const X6MindMap: React.FC<X6MindMapProps> = ({ goalTree, onNodeClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [mindmapData, setMindmapData] = useState<MindMapData | null>(null);

  // 将目标树转换为脑图数据
  const convertGoalTreeToMindmapData = (goals: GoalVo[]): MindMapData | null => {
    if (!goals.length) return null;
    
    // 如果有多个根节点，创建一个虚拟根节点
    if (goals.length > 1) {
      return {
        id: 'root',
        type: 'topic',
        label: '目标总览',
        width: 160,
        height: 50,
        children: goals.map(goal => convertSingleGoal(goal, 'topic-branch'))
      };
    }
    
    return convertSingleGoal(goals[0], 'topic');
  };
  
  const convertSingleGoal = (goal: GoalVo, type: 'topic' | 'topic-branch' | 'topic-child'): MindMapData => {
    const width = type === 'topic' ? 160 : type === 'topic-branch' ? 120 : 80;
    const height = type === 'topic' ? 50 : type === 'topic-branch' ? 40 : 30;
    
    return {
      id: goal.id?.toString() || `goal-${Date.now()}`,
      type,
      label: goal.name || '未命名目标',
      width,
      height,
      children: goal.children?.map(child => 
        convertSingleGoal(child, type === 'topic' ? 'topic-branch' : 'topic-child')
      ),
    };
  };

  // 初始化图形
  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      background: {
        color: '#F2F7FA',
      },
      grid: {
        visible: true,
        type: 'doubleMesh',
        args: [
          {
            color: '#eee',
            thickness: 1,
          },
          {
            color: '#ddd',
            thickness: 1,
            factor: 4,
          },
        ],
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: 0.5,
        maxScale: 3,
      },
      connecting: {
        connectionPoint: 'anchor',
      },
    });

    // 使用插件
    graph.use(new Selection());
    graph.use(new Keyboard());

    // 注册节点点击事件
    graph.on('node:click', ({ node }) => {
      const nodeId = node.id;
      onNodeClick?.(nodeId);
      
      // 打开目标编辑器
      openDrawer({
        title: '编辑目标',
        width: 800,
        content: (props) => {
          return (
            <GoalEditor
              goalId={nodeId}
              onClose={props.onClose}
            />
          );
        },
      });
    });

    graphRef.current = graph;

    // 监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && graphRef.current) {
        graphRef.current.resize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
      graph.dispose();
    };
  }, [onNodeClick]);

  // 转换目标数据
  useEffect(() => {
    const data = convertGoalTreeToMindmapData(goalTree);
    setMindmapData(data);
  }, [goalTree]);

  // 渲染脑图
  const render = () => {
    if (!graphRef.current || !mindmapData) return;

    const result: HierarchyResult = Hierarchy.mindmap(mindmapData, {
      direction: 'H',
      getHeight(d: MindMapData) {
        return d.height;
      },
      getWidth(d: MindMapData) {
        return d.width;
      },
      getHGap() {
        return 40;
      },
      getVGap() {
        return 20;
      },
      getSide: () => {
        return 'right';
      },
    });

    const cells: Cell[] = [];
    const traverse = (hierarchyItem: HierarchyResult) => {
      if (hierarchyItem) {
        const { data, children } = hierarchyItem;
        cells.push(
          graphRef.current!.createNode({
            id: data.id,
            shape: data.type === 'topic-child' ? 'topic-child' : 'topic',
            x: hierarchyItem.x,
            y: hierarchyItem.y,
            width: data.width,
            height: data.height,
            label: data.label,
            type: data.type,
          }),
        );
        if (children) {
          children.forEach((item: HierarchyResult) => {
            const { id, data } = item;
            cells.push(
              graphRef.current!.createEdge({
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
              }),
            );
            traverse(item);
          });
        }
      }
    };
    traverse(result);
    graphRef.current.resetCells(cells);
    graphRef.current.centerContent();
  };

  // 当数据变化时重新渲染
  useEffect(() => {
    if (mindmapData) {
      render();
    }
  }, [mindmapData]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[600px] border border-gray-200 rounded-lg bg-white"
      style={{ minHeight: '600px' }}
    />
  );
};

export default X6MindMap;