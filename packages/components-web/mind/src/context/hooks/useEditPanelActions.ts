import { useCallback } from 'react';
import { useEditPanelContext } from '../EditPanelContext';

/**
 * 封装 EditPanel 相关的操作，提供便捷的 API
 */
export const useEditPanelActions = () => {
  const editPanelContext = useEditPanelContext();

  const showPanel = useCallback((type: string, data?: any) => {
    editPanelContext.showPanel(type, data);
  }, [editPanelContext]);

  const hidePanel = useCallback(() => {
    editPanelContext.hidePanel();
  }, [editPanelContext]);

  const togglePanel = useCallback((type: string, data?: any) => {
    editPanelContext.togglePanel(type, data);
  }, [editPanelContext]);

  const updatePanelData = useCallback((data: any) => {
    editPanelContext.updatePanelData(data);
  }, [editPanelContext]);

  // 便捷方法 - 常用面板类型
  const showNodeEditPanel = useCallback((nodeData: any) => {
    showPanel('node-edit', nodeData);
  }, [showPanel]);

  const showThemePanel = useCallback(() => {
    showPanel('theme');
  }, [showPanel]);

  const showExportPanel = useCallback(() => {
    showPanel('export');
  }, [showPanel]);

  const showImportPanel = useCallback(() => {
    showPanel('import');
  }, [showPanel]);

  const showSettingsPanel = useCallback(() => {
    showPanel('settings');
  }, [showPanel]);

  // 检查面板状态
  const isPanelOpen = useCallback((type?: string) => {
    if (type) {
      return editPanelContext.editPanel.isShow && editPanelContext.editPanel.type === type;
    }
    return editPanelContext.editPanel.isShow;
  }, [editPanelContext.editPanel]);

  return {
    editPanel: editPanelContext.editPanel,
    showPanel,
    hidePanel,
    togglePanel,
    updatePanelData,
    // 便捷方法
    showNodeEditPanel,
    showThemePanel,
    showExportPanel,
    showImportPanel,
    showSettingsPanel,
    isPanelOpen
  };
};