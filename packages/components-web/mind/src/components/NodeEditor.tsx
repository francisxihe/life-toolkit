import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button } from '@arco-design/web-react';
import { useMindMap } from '../context';

interface NodeEditorProps {
  visible: boolean;
  nodeId: string | null;
  onClose: () => void;
}

/**
 * 节点编辑器组件
 * 用于编辑、添加或删除节点
 */
const NodeEditor: React.FC<NodeEditorProps> = ({ visible, nodeId, onClose }) => {
  const { mindMapData, updateNode, addChild, addSibling, deleteNode } = useMindMap();
  const [nodeLabel, setNodeLabel] = useState('');
  const [isRootNode, setIsRootNode] = useState(false);
  const inputRef = useRef(null);

  // 当节点ID变化时更新状态
  useEffect(() => {
    if (!nodeId || !mindMapData) {
      setNodeLabel('');
      setIsRootNode(false);
      return;
    }

    // 查找节点
    const findNode = (data: any, id: string): any => {
      if (data.id === id) {
        return data;
      }
      
      if (data.children) {
        for (const child of data.children) {
          const found = findNode(child, id);
          if (found) {
            return found;
          }
        }
      }
      
      return null;
    };

    const node = findNode(mindMapData, nodeId);
    if (node) {
      setNodeLabel(node.label || '');
      setIsRootNode(node.id === mindMapData.id);
    }
  }, [nodeId, mindMapData]);

  // 对话框打开时聚焦输入框
  useEffect(() => {
    if (visible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  const handleSave = () => {
    if (!nodeId || !nodeLabel.trim()) return;
    
    updateNode(nodeId, nodeLabel.trim());
    onClose();
  };

  const handleAddChild = () => {
    if (!nodeId) return;
    
    addChild(nodeId, '新节点');
    onClose();
  };

  const handleAddSibling = () => {
    if (!nodeId || isRootNode) return;
    
    addSibling(nodeId, '新节点');
    onClose();
  };

  const handleDelete = () => {
    if (!nodeId || isRootNode) return;
    
    deleteNode(nodeId);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Modal
      title="编辑节点"
      visible={visible}
      onCancel={onClose}
      footer={null}
      autoFocus={false}
      maskClosable={true}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            节点内容
          </label>
          <Input
            ref={inputRef}
            value={nodeLabel}
            onChange={setNodeLabel}
            placeholder="请输入节点内容"
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 justify-end pt-4">
          <Button onClick={handleAddChild} type="secondary">
            添加子节点
          </Button>
          
          {!isRootNode && (
            <>
              <Button onClick={handleAddSibling} type="secondary">
                添加兄弟节点
              </Button>
              
              <Button onClick={handleDelete} type="secondary" status="danger">
                删除节点
              </Button>
            </>
          )}
          
          <Button onClick={handleSave} type="primary">
            保存
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default NodeEditor;