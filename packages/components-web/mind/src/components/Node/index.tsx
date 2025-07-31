import React, { useEffect, useRef } from 'react';
import { useNodeActions } from '../../context';
import { MindmapNode } from '../../types';
import * as refer from '../../statics/refer';
import Toolbar from './subComponents/Toolbar';
import InputDiv from './subComponents/InputDiv';

interface NodeProps {
  node: MindmapNode;
  parent?: MindmapNode;
  on_left?: boolean;
  node_refs: Set<React.RefObject<HTMLDivElement>>;
}

const Node: React.FC<NodeProps> = ({ node, parent, on_left, node_refs }) => {
  const self = useRef<HTMLDivElement>(null);
  const { nodeStatus, selectNode, editNode } = useNodeActions();

  const handleMouseDown = () => {
    selectNode(node.id, true);
  };

  const handleDoubleClick = () => {
    editNode(node.id);
  };

  const handleMouseEnter = () => {
    // 暂时移除hover状态的处理，因为它不在当前的action types中
  };

  useEffect(() => {
    if (!self.current) return;
    node_refs.add(self);
    return () => {
      node_refs.delete(self);
    };
  }, [node_refs]);

  useEffect(() => {
    if (!parent || !self.current) return;
    self.current.dataset.tag = on_left ? refer.LEFT_NODE : refer.RIGHT_NODE;
  }, [parent, on_left]);

  const style = node.style || {};

  return (
    <div
      ref={self}
      id={node.id}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
      style={{
        ...style,
        position: 'relative',
        backgroundColor: style.backgroundColor || '#ffffff',
        borderRadius: style.borderRadius || '5px',
        padding: style.padding || '5px 10px',
        cursor: 'pointer',
        userSelect: 'none',
        border: nodeStatus.cur_select === node.id ? '2px solid #1890ff' : 'none',
      }}
    >
      {nodeStatus.cur_edit === node.id ? (
        <InputDiv node_id={node.id}>{node.text || ''}</InputDiv>
      ) : (
        <>
          <div>{node.text || ''}</div>
          {nodeStatus.cur_select === node.id && parent && (
            <Toolbar node={node} parent={parent} layer={1} />
          )}
        </>
      )}
    </div>
  );
};

export default Node;

