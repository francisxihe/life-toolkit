/**
 * 兼容性 hook，用于替代旧的 useMindmap
 * 这个 hook 组合了 useMindmapActions 和 useNodeActions 的功能
 * 以便外部代码仍然可以使用 useMindmap
 */
import { useMindmapActions } from './useMindmapActions';
import { useNodeActions } from './useNodeActions';
import { useHistoryActions } from './useHistoryActions';

export const useMindmap = () => {
  const mindmapActions = useMindmapActions();
  const nodeActions = useNodeActions();
  const historyActions = useHistoryActions();

  return {
    // 从 mindmapActions 中获取的属性和方法
    mindmap: mindmapActions.mindmap,
    toggleChildren: mindmapActions.toggleChildren,
    addChild: mindmapActions.addChild,
    addSibling: mindmapActions.addSibling,
    moveNode: mindmapActions.moveNode,
    changeText: mindmapActions.changeText,
    deleteNode: mindmapActions.deleteNode,
    expandAll: mindmapActions.expandAll,
    setMindmap: mindmapActions.setMindmap,
    
    // 从 nodeActions 中获取的属性和方法
    nodeStatus: nodeActions.nodeStatus,
    selectNode: nodeActions.selectNode,
    editNode: nodeActions.editNode,
    clearSelection: nodeActions.clearSelection,
    clearEdit: nodeActions.clearEdit,
    clearAll: nodeActions.clearAll,
    setNodeInfo: nodeActions.setNodeInfo,
    
    // 从 historyActions 中获取的属性和方法
    history: historyActions.history,
    undo: historyActions.undo,
    
    // 兼容旧的 API
    editNodeInfo: (nodeId: string, info: any) => {
      mindmapActions.changeText(nodeId, { info });
    },
    clearNodeStatus: nodeActions.clearAll
  };
};