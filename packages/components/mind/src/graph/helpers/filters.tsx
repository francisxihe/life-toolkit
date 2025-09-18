import { Graph, Path } from '@antv/x6';

/**
 * 注册滤镜
 * @param graph X6 Graph 实例
 */
export const registerFilters = (graph: Graph) => {
  // 不再需要手动注册滤镜，直接使用CSS样式
  // 滤镜已经在节点定义时转换为 CSS drop-shadow
};
