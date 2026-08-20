import { ExportOutlined, FullscreenOutlined, ImportOutlined, RedoOutlined, ShrinkOutlined, SnippetsOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { Button, Tooltip, Space, Switch, CopyOutlined, DeleteOutlined, HolderOutlined, PlusOutlined, UndoOutlined, ZoomInOutlined, ZoomOutOutlined } from '@sue/design-web-react';

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
      type="default"
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
  const { selectedNodeId, minimapVisible, setMinimapVisible } = useMindMapContext();

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
        icon={<ZoomOutOutlined />}
        content="缩小 (Ctrl -)"
        onClick={() => graphEventEmitter.zoomOut()}
        size={size}
      />
      <ToolButton
        icon={<ZoomInOutlined />}
        content="放大 (Ctrl +)"
        onClick={() => graphEventEmitter.zoomIn()}
        size={size}
      />
      <ToolButton
        icon={<HolderOutlined />}
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

  // 编辑操作按钮组
  const EditControls = () => (
    <>
      <ToolButton icon={<UndoOutlined />} content="撤销 (Ctrl+Z)" onClick={handleUndo} />
      <ToolButton icon={<RedoOutlined />} content="重做 (Ctrl+Y)" onClick={handleRedo} />
      <ToolButton
        icon={<CopyOutlined />}
        content="复制 (Ctrl+C)"
        onClick={handleCopy}
        disabled={!selectedNodeId}
      />
      <ToolButton icon={<SnippetsOutlined />} content="粘贴 (Ctrl+V)" onClick={handlePaste} />
    </>
  );

  // 完整模式渲染
  return (
    <div className={`mind-map-toolbar p-2 bg-white border-b border-gray-200 ${className || ''}`}>
      {/* 编辑操作 */}
      <EditControls />

      {/* 视图操作 */}
      <ViewControls />

      {/* 其他功能 */}
      <MinimapControl />
      <ToolButton icon={<FullscreenOutlined />} content="全屏" onClick={handleFullscreen} />
      <ToolButton icon={<ExportOutlined />} content="导出" onClick={handleExport} />
      {onImport && <ToolButton icon={<ImportOutlined />} content="导入" onClick={onImport} />}
    </div>
  );
};

export default MindMapToolbar;
