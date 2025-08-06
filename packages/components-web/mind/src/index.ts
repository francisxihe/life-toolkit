import { MindMapData, MindMapOptions } from './types';
import EnhancedMindMap from './components/EnhancedMindMap';
import { MindMapDataConverter, createGoalConverter } from './utils/dataConverters';
import { registerMindMapComponents } from './styles';
import * as nodeOperations from './utils/nodeOperations';
import * as exportUtils from './utils/export';

// 注册组件
registerMindMapComponents();

// 组件导出
export { default as EnhancedMindMap } from './components/EnhancedMindMap';
export { default as MindMapToolbar } from './components/MindMapToolbar';
export { default as NodeEditor } from './components/NodeEditor';
export { ExportModal, ImportModal } from './components/ExportImportModals';
export { default as MiniMapContainer } from './components/MiniMap';

// 工具函数导出
export { 
  MindMapDataConverter,
  createGoalConverter,
} from './utils/dataConverters';

export * as nodeOperations from './utils/nodeOperations';
export * as exportUtils from './utils/export';

// 类型导出
export type { MindMapData, MindMapOptions } from './types';