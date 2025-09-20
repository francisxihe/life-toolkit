import React, { useState } from 'react';
import { Button, Tooltip, Space, Switch } from '@arco-design/web-react';
import {
  IconPlus,
  IconZoomIn,
  IconZoomOut,
  IconFullscreen,
  IconExport,
  IconImport,
  IconUndo,
  IconRedo,
  IconDragDot,
  IconCopy,
  IconPaste,
  IconDelete,
  IconShrink,
} from '@arco-design/web-react/icon';
import { useMindMapContext } from '../context';
import { graphEventEmitter } from '../graph/eventEmitter';

interface MindMapToolbarProps {
  onFullscreen?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  className?: string;
}

// 工具按钮组件接口
interface ToolButtonProps {
  icon?: React.ReactNode;
  content: string;
  onClick: () => void;
  disabled?: boolean;
  status?: 'danger' | 'warning' | 'success' | 'default';
  size?: 'mini' | 'small' | 'default' | 'large';
  children?: React.ReactNode;
}

// 可复用的工具按钮组件
const ToolButton: React.FC<ToolButtonProps> = ({
  icon,
  content,
  onClick,
  disabled = false,
  status = 'default',
  size = 'default',
  children,
}) => (
  <Tooltip content={content}>
    <Button
      type="secondary"
      icon={icon}
      onClick={onClick}
      disabled={disabled}
      status={status}
      size={size}
    >
      {children}
    </Button>
  </Tooltip>
);

/**
 * 统一的思维导图工具栏组件
 * 支持完整模式和紧凑模式，提供所有思维导图操作功能
 */
const MindMapToolbar: React.FC<MindMapToolbarProps> = ({
  onFullscreen,
  onExport,
  onImport,
  className,
}) => {
  // 业务数据和操作
  const { selectedNodeId, addChild, addSibling, deleteNode, minimapVisible, setMinimapVisible } =
    useMindMapContext();

  // 添加子节点
  const handleAddChild = () => {
    if (!selectedNodeId) return;
    addChild(selectedNodeId, '新节点');
  };

  // 添加兄弟节点
  const handleAddSibling = () => {
    if (!selectedNodeId) return;
    addSibling(selectedNodeId, '新节点');
  };

  // 删除节点
  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    deleteNode(selectedNodeId);
  };

  // 全屏
  const handleFullscreen = () => {
    if (onFullscreen) {
      onFullscreen();
    } else {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      }
    }
  };

  // 导出
  const handleExport = () => {
    if (onExport) onExport();
  };

  // 撤销
  const handleUndo = () => {
    graphEventEmitter.undo();
  };

  // 重做
  const handleRedo = () => {
    graphEventEmitter.redo();
  };

  // 复制
  const handleCopy = () => {
    graphEventEmitter.copy(selectedNodeId || undefined);
  };

  // 粘贴
  const handlePaste = () => {
    graphEventEmitter.paste();
  };

  // 切换小地图显示
  const handleToggleMinimap = (checked: boolean) => {
    setMinimapVisible(checked);
  };

  // 共同的视图操作按钮组
  const ViewControls = ({
    size = 'default',
  }: {
    size?: 'mini' | 'small' | 'default' | 'large';
  }) => (
    <>
      <ToolButton
        icon={<IconZoomOut />}
        content="缩小 (Ctrl -)"
        onClick={() => graphEventEmitter.zoomOut()}
        size={size}
      />
      <ToolButton
        icon={<IconZoomIn />}
        content="放大 (Ctrl +)"
        onClick={() => graphEventEmitter.zoomIn()}
        size={size}
      />
      <ToolButton
        icon={<IconDragDot />}
        content="居中内容"
        onClick={() => graphEventEmitter.centerContent()}
        size={size}
      ></ToolButton>
    </>
  );

  // 小地图控件
  const MinimapControl = ({
    size = 'default',
  }: {
    size?: 'mini' | 'small' | 'default' | 'large';
  }) => {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span style={{ marginRight: '8px' }}>小地图</span>
        <Switch
          checked={minimapVisible}
          onChange={handleToggleMinimap}
          size={size === 'small' ? 'small' : 'default'}
        />
      </div>
    );
  };

  // 节点操作按钮组
  const NodeControls = () => (
    <>
      <ToolButton
        icon={<IconPlus />}
        content="添加子节点 (Tab)"
        onClick={handleAddChild}
        disabled={!selectedNodeId}
      />
      <ToolButton
        icon={<IconPlus />}
        content="添加兄弟节点 (Enter)"
        onClick={handleAddSibling}
        disabled={!selectedNodeId}
      />
      <ToolButton
        icon={<IconDelete />}
        content="删除节点 (Delete)"
        onClick={handleDeleteNode}
        disabled={!selectedNodeId}
        status="danger"
      />
    </>
  );

  // 编辑操作按钮组
  const EditControls = () => (
    <>
      <ToolButton icon={<IconUndo />} content="撤销 (Ctrl+Z)" onClick={handleUndo} />
      <ToolButton icon={<IconRedo />} content="重做 (Ctrl+Y)" onClick={handleRedo} />
      <ToolButton
        icon={<IconCopy />}
        content="复制 (Ctrl+C)"
        onClick={handleCopy}
        disabled={!selectedNodeId}
      />
      <ToolButton icon={<IconPaste />} content="粘贴 (Ctrl+V)" onClick={handlePaste} />
    </>
  );

  // 完整模式渲染
  return (
    <div className={`mind-map-toolbar p-2 bg-white border-b border-gray-200 ${className || ''}`}>
      {/* 操作节点 */}
      <NodeControls />

      {/* 编辑操作 */}
      <EditControls />

      {/* 视图操作 */}
      <ViewControls />

      {/* 其他功能 */}
      <MinimapControl />
      <ToolButton icon={<IconFullscreen />} content="全屏" onClick={handleFullscreen} />
      <ToolButton icon={<IconExport />} content="导出" onClick={handleExport} />
      {onImport && <ToolButton icon={<IconImport />} content="导入" onClick={onImport} />}
    </div>
  );
};

export default MindMapToolbar;
