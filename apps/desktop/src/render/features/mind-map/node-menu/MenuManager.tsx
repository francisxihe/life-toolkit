import React, { useState, useCallback } from 'react';
import NodeMenu from './index';

interface MenuState {
  visible: boolean;
  nodeId: string;
  nodeType: string;
  position: { x: number; y: number };
}

interface MenuManagerProps {
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  onAddChild?: (nodeId: string) => void;
  onAddSibling?: (nodeId: string) => void;
  onCopy?: (nodeId: string) => void;
}

export interface MenuManagerRef {
  showMenu: (
    nodeId: string,
    nodeType: string,
    position: { x: number; y: number },
  ) => void;
  hideMenu: () => void;
}

const MenuManager = React.forwardRef<MenuManagerRef, MenuManagerProps>(
  ({ onEdit, onDelete, onAddChild, onAddSibling, onCopy }, ref) => {
    const [menuState, setMenuState] = useState<MenuState>({
      visible: false,
      nodeId: '',
      nodeType: '',
      position: { x: 0, y: 0 },
    });

    const showMenu = useCallback(
      (
        nodeId: string,
        nodeType: string,
        position: { x: number; y: number },
      ) => {
        setMenuState({
          visible: true,
          nodeId,
          nodeType,
          position,
        });
      },
      [],
    );

    const hideMenu = useCallback(() => {
      setMenuState((prev) => ({
        ...prev,
        visible: false,
      }));
    }, []);

    // 暴露方法给父组件
    React.useImperativeHandle(
      ref,
      () => ({
        showMenu,
        hideMenu,
      }),
      [showMenu, hideMenu],
    );

    return (
      <NodeMenu
        nodeId={menuState.nodeId}
        nodeType={menuState.nodeType}
        position={menuState.position}
        visible={menuState.visible}
        onClose={hideMenu}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddChild={onAddChild}
        onAddSibling={onAddSibling}
        onCopy={onCopy}
      />
    );
  },
);

MenuManager.displayName = 'MenuManager';

export default MenuManager;
