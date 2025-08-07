import { Graph, Path } from '@antv/x6';
import MindMapNode from '../../features/MindMapNode';
import { register } from '@antv/x6-react-shape';
import { ENodeType } from '../../types';

/**
 * 注册所有思维导图相关的节点和边样式
 * 这个函数用于集中管理所有 X6 图形的样式定义
 */
export const registerMindMapComponents = () => {
  // 注册自定义React节点
  registerReactNodes();

  // 注册脑图连接器
  registerMindMapConnector();

  // 注册脑图边
  registerMindMapEdge();
};

/**
 * 注册React节点
 */
const registerReactNodes = () => {
  // 注册分支主题节点
  register({
    shape: ENodeType.topic,
    component: MindMapNode,
  });

  // 注册分支主题节点
  register({
    shape: ENodeType.topicBranch,
    component: MindMapNode,
  });

  // 注册分支主题节点
  register({
    shape: ENodeType.topicChild,
    component: MindMapNode,
  });
};

/**
 * 注册脑图连接器
 */
const registerMindMapConnector = () => {
  Graph.registerConnector(
    'mindmap',
    (sourcePoint, targetPoint, routerPoints, options) => {
      const midX = sourcePoint.x + 20;
      const midY = sourcePoint.y;
      const ctrX = (targetPoint.x - midX) / 2 + midX;
      const ctrY = targetPoint.y;
      const pathData = `
        M ${sourcePoint.x} ${sourcePoint.y}
        L ${midX} ${midY}
        C ${ctrX} ${midY} ${ctrX} ${ctrY} ${targetPoint.x} ${targetPoint.y}
      `;
      return options.raw ? Path.parse(pathData) : pathData;
    },
    true
  );
};

/**
 * 注册脑图边
 */
const registerMindMapEdge = () => {
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
          stroke: '#6BA5F7',
          strokeWidth: 1.5,
          strokeLinejoin: 'round',
          strokeLinecap: 'round',
        },
      },
      zIndex: 0,
    },
    true
  );
};
