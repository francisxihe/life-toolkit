import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { EditPanel } from '../types';

const getDefaultEditPanel = (): EditPanel => ({
  isShow: false,
  type: '',
  data: null,
});

interface EditPanelContextType {
  editPanel: EditPanel;
  showPanel: (type: string, data?: any) => void;
  hidePanel: () => void;
  togglePanel: (type: string, data?: any) => void;
  updatePanelData: (data: any) => void;
}

const EditPanelContext = createContext<EditPanelContextType | null>(null);

interface EditPanelProviderProps {
  children: ReactNode;
  initialValue?: EditPanel;
}

export const EditPanelProvider: React.FC<EditPanelProviderProps> = ({ 
  children, 
  initialValue 
}) => {
  const [editPanel, setEditPanelState] = useState<EditPanel>(
    initialValue || getDefaultEditPanel()
  );

  const showPanel = useCallback((type: string, data?: any) => {
    setEditPanelState({
      isShow: true,
      type,
      data: data || null
    });
  }, []);

  const hidePanel = useCallback(() => {
    setEditPanelState(prev => ({
      ...prev,
      isShow: false
    }));
  }, []);

  const togglePanel = useCallback((type: string, data?: any) => {
    setEditPanelState(prev => {
      if (prev.isShow && prev.type === type) {
        return {
          ...prev,
          isShow: false
        };
      }
      return {
        isShow: true,
        type,
        data: data || null
      };
    });
  }, []);

  const updatePanelData = useCallback((data: any) => {
    setEditPanelState(prev => ({
      ...prev,
      data
    }));
  }, []);

  const value: EditPanelContextType = {
    editPanel,
    showPanel,
    hidePanel,
    togglePanel,
    updatePanelData
  };

  return (
    <EditPanelContext.Provider value={value}>
      {children}
    </EditPanelContext.Provider>
  );
};

export const useEditPanelContext = (): EditPanelContextType => {
  const context = useContext(EditPanelContext);
  if (!context) {
    throw new Error('useEditPanelContext must be used within a EditPanelProvider');
  }
  return context;
};