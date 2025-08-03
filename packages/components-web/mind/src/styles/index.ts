import { Graph, Path } from '@antv/x6';

/**
 * 注册所有思维导图相关的节点和边样式
 * 这个函数用于集中管理所有 X6 图形的样式定义
 */
export const registerMindMapComponents = () => {
  // 注册中心主题节点
  registerTopicNode();
  
  // 注册分支主题节点
  registerBranchNode();
  
  // 注册子主题节点
  registerChildNode();
  
  // 注册脑图连接器
  registerMindMapConnector();
  
  // 注册脑图边
  registerMindMapEdge();
};

/**
 * 注册中心主题节点
 */
const registerTopicNode = () => {
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
          rx: 8,
          ry: 8,
          stroke: '#4E86E4',
          fill: '#E9F2FF',
          strokeWidth: 1.5,
          filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.1))',
        },
        label: {
          fontSize: 16,
          fontWeight: 600,
          fill: '#333333',
          textWrap: {
            width: -10,
            height: -10,
            ellipsis: true,
          },
        },
      },
    },
    true,
  );
};

/**
 * 注册分支主题节点
 */
const registerBranchNode = () => {
  Graph.registerNode(
    'topic-branch',
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
          stroke: '#69B1FF',
          fill: '#F1F8FF',
          strokeWidth: 1.5,
          filter: 'drop-shadow(0px 1.5px 2.5px rgba(0,0,0,0.08))',
        },
        label: {
          fontSize: 15,
          fontWeight: 500,
          fill: '#444444',
          textWrap: {
            width: -10,
            height: -8,
            ellipsis: true,
          },
        },
      },
    },
    true,
  );
};

/**
 * 注册子主题节点
 */
const registerChildNode = () => {
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
          rx: 6,
          ry: 6,
          fill: '#F8FBFF',
          strokeWidth: 1,
          stroke: '#A6C5F7',
          filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.08))',
        },
        label: {
          fontSize: 14,
          fill: '#555555',
          textVerticalAnchor: 'middle',
          textWrap: {
            width: -10,
            height: -6,
            ellipsis: true,
          },
        },
        line: {
          stroke: '#A6C5F7',
          strokeWidth: 1.5,
          d: 'M 0 15 L 60 15',
        },
      },
    },
    true,
  );
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
    true,
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
    true,
  );
};

/**
 * 注册滤镜
 * @param graph X6 Graph 实例
 */
export const registerFilters = (graph: Graph) => {
  // 不再需要手动注册滤镜，直接使用CSS样式
  // 滤镜已经在节点定义时转换为 CSS drop-shadow
};