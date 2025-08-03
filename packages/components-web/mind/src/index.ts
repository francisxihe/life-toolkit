import { MindMapData, MindMapOptions } from './types';
import EnhancedMindMap from './components/EnhancedMindMap';
import { MindMapDataConverter, createGoalConverter } from './utils/dataConverters';
import { registerMindMapComponents } from './styles';

// 初始化注册思维导图组件
registerMindMapComponents();

export { 
  EnhancedMindMap,
  MindMapDataConverter,
  createGoalConverter
};

// 导出类型定义
export type { 
  MindMapData, 
  MindMapOptions 
};