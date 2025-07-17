import React from 'react';
import { css } from '@emotion/css';
import { useMindmapActions, useNodeActions, useEditPanelActions } from '../../../context';
import { handlePropagation } from '../../../methods/assistFunctions';
import ToolButton from '../../ToolButton';
import { MindmapNode } from '../../../types';

interface ToolbarProps {
  layer: number;
  node: MindmapNode;
  parent: MindmapNode;
}

const Toolbar: React.FC<ToolbarProps> = ({ layer, node, parent }) => {
  const { addChild, addSibling, deleteNode, toggleChildren } = useMindmapActions();
  const { selectNode, editNode } = useNodeActions();
  const { showPanel } = useEditPanelActions();

  const handleAddChild = () => {
    // 创建新节点
    const newNodeId = Date.now().toString() + Math.random().toString();
    const newNode = {
      id: newNodeId,
      text: '',
      showChildren: true,
      children: []
    };
    addChild(node.id, newNode);
  };

  const handleAddSibling = () => {
    // 创建新节点
    const newNodeId = Date.now().toString() + Math.random().toString();
    const newNode = {
      id: newNodeId,
      text: '',
      showChildren: true,
      children: []
    };
    addSibling(node.id, parent.id, newNode);
  };

  const handleDeleteNode = () => {
    deleteNode(node.id, parent.id);
  };

  const handleEditNode = () => {
    editNode(node.id);
  };

  const handleToggleChildren = () => {
    toggleChildren(node.id, { showChildren: !node.showChildren });
  };

  const handleAddInfo = () => {
    selectNode(node.id);
    showPanel('node-edit', { nodeId: node.id });
  };

  return (
    <div className={wrapper} onClick={handlePropagation}>
      <ToolButton icon={'git-commit'} onClick={handleAddChild}>
        添加子节点
      </ToolButton>
      <ToolButton icon={'git-fork'} onClick={handleAddSibling} disabled={layer < 1}>
        添加兄弟节点
      </ToolButton>
      <ToolButton icon={'delete'} onClick={handleDeleteNode} disabled={layer < 1}>
        删除
      </ToolButton>
      <ToolButton icon={'edit-pencil'} onClick={handleEditNode}>
        编辑
      </ToolButton>
      <ToolButton icon={'edit-pencil'} onClick={handleAddInfo}>
        添加备注
      </ToolButton>
      <ToolButton
        icon={'split-v'}
        onClick={handleToggleChildren}
        disabled={layer < 1 || node.children.length === 0}
      >
        显隐子节点
      </ToolButton>
    </div>
  );
};

export default Toolbar;

// CSS
const wrapper = css`
  display: flex;
  position: absolute;
  bottom: calc(100% + 5px);
  left: 0;
  background-color: #ffffff;
  width: max-content;
  height: 50px;
  padding: 0 8px;
  font-size: 20px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 5px 5px 10px #aaaaaa;
`;
