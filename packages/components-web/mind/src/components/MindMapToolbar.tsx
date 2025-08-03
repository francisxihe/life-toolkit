import React from 'react';
import { Button, Tooltip, Space } from '@arco-design/web-react';
import { 
  IconPlus, 
  IconMinus, 
  IconZoomIn, 
  IconZoomOut, 
  IconFullscreen,
  IconExport,
  IconImport
} from '@arco-design/web-react/icon';
import { useMindMap } from '../context/MindMapContext';

interface MindMapToolbarProps {
  onFullscreen?: () => void;
  onExport?: () => void;
  onImport?: () => void;
}

/**
 * 思维导图工具栏组件
 * 提供添加、删除、缩放等操作按钮
 */
const MindMapToolbar: React.FC<MindMapToolbarProps> = ({
  onFullscreen,
  onExport,
  onImport
}) => {
  const { 
    graph, 
    selectedNodeId, 
    addChild, 
    addSibling, 
    deleteNode,
    zoomIn,
    zoomOut,
    centerContent
  } = useMindMap();

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

  // 放大
  const handleZoomIn = () => {
    zoomIn();
  };

  // 缩小
  const handleZoomOut = () => {
    zoomOut();
  };

  // 居中内容
  const handleCenterContent = () => {
    centerContent();
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

  return (
    <div className="mind-map-toolbar p-2 bg-white border-b border-gray-200">
      <Space>
        <Tooltip content="添加子节点 (Tab)">
          <Button 
            type="secondary"
            icon={<IconPlus />}
            onClick={handleAddChild}
            disabled={!selectedNodeId}
          />
        </Tooltip>
        
        <Tooltip content="添加兄弟节点 (Enter)">
          <Button 
            type="secondary"
            icon={<IconPlus />}
            onClick={handleAddSibling}
            disabled={!selectedNodeId}
          />
        </Tooltip>
        
        <Tooltip content="删除节点 (Delete)">
          <Button 
            type="secondary" 
            status="danger"
            icon={<IconMinus />}
            onClick={handleDeleteNode}
            disabled={!selectedNodeId}
          />
        </Tooltip>
        
        <div className="h-5 w-px bg-gray-300 mx-1"></div>
        
        <Tooltip content="放大 (Ctrl +)">
          <Button 
            type="secondary"
            icon={<IconZoomIn />}
            onClick={handleZoomIn}
          />
        </Tooltip>
        
        <Tooltip content="缩小 (Ctrl -)">
          <Button 
            type="secondary"
            icon={<IconZoomOut />}
            onClick={handleZoomOut}
          />
        </Tooltip>
        
        <Tooltip content="居中内容">
          <Button 
            type="secondary"
            onClick={handleCenterContent}
          >
            居中
          </Button>
        </Tooltip>
        
        <div className="h-5 w-px bg-gray-300 mx-1"></div>
        
        <Tooltip content="全屏">
          <Button 
            type="secondary"
            icon={<IconFullscreen />}
            onClick={handleFullscreen}
          />
        </Tooltip>
        
        {onExport && (
          <Tooltip content="导出">
            <Button 
              type="secondary"
              icon={<IconExport />}
              onClick={onExport}
            />
          </Tooltip>
        )}
        
        {onImport && (
          <Tooltip content="导入">
            <Button 
              type="secondary"
              icon={<IconImport />}
              onClick={onImport}
            />
          </Tooltip>
        )}
      </Space>
    </div>
  );
};

export default MindMapToolbar;