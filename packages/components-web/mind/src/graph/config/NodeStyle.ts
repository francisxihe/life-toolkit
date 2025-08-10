import { ENodeType } from '../../types';

// 只控制画布上的节点大小，不控制节点内部内容大小，画布节点和内部节点一定程度上是脱钩的，这是目前antd-x6的限制
export const nodeStyle: Record<ENodeType, { width: number; height: number }> = {
  [ENodeType.topic]: {
    width: 200,
    height: 40,
  },
  [ENodeType.topicBranch]: {
    width: 200,
    height: 40,
  },
  [ENodeType.topicChild]: {
    width: 200,
    height: 40,
  },
};
