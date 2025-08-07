import React, { useState, useEffect } from 'react';
import { ReactShape } from '@antv/x6-react-shape';
import { isNodeCollapsed, toggleNodeCollapse } from '../graph/helpers/nodeOperations';
import { ENodeType } from '../types';
import { IconPlusCircle, IconMinusCircle } from '@arco-design/web-react/icon';

interface CustomNodeProps {
  node?: ReactShape; // X6 React Shape 自动注入的 node 属性
  [key: string]: any; // 允许其他 props
}

interface NodeData {
  id: string;
  label: string;
  type: ENodeType;
  hasChildren?: boolean;
  isCollapsed?: boolean;
}

const MindMapNode: React.FC<CustomNodeProps> = ({ node, ...otherProps }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 获取图形实例
  const graph = node?.model?.graph;

  if (!node) {
    console.warn('MindMapNode: node not found in props', { node, otherProps });
    return (
      <div style={{ padding: '8px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}>
        Node not found
      </div>
    );
  }

  const nodeData = node.getData() as NodeData;
  const {
    id,
    label,
    type,
    hasChildren = false,
  } = nodeData || { id: '', label: 'Unknown', type: 'topic' as const };

  // 监听节点折叠状态变化
  useEffect(() => {
    const updateCollapsedState = () => {
      setIsCollapsed(isNodeCollapsed(id));
    };

    // 初始化状态
    updateCollapsedState();

    // 监听图的变化事件
    if (graph) {
      graph.on('node:change:*', updateCollapsedState);
      return () => {
        graph.off('node:change:*', updateCollapsedState);
      };
    }
  }, [id, graph]);

  // 根据节点类型获取样式
  const getNodeStyle = () => {
    switch (type) {
      case ENodeType.topic:
        return {
          backgroundColor: '#E9F2FF',
          border: '1.5px solid #4E86E4',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '16px',
          fontWeight: '500',
          color: '#333333',
          boxShadow: '0px 2px 3px rgba(0,0,0,0.1)',
        };
      case ENodeType.topicBranch:
        return {
          backgroundColor: '#F1F8FF',
          border: '1.5px solid #69B1FF',
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '15px',
          fontWeight: '400',
          color: '#444444',
          boxShadow: '0px 1.5px 2.5px rgba(0,0,0,0.08)',
        };
      case ENodeType.topicChild:
        return {
          backgroundColor: '#F9FCFF',
          border: '1px solid #91D5FF',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '14px',
          fontWeight: '400',
          color: '#555555',
          boxShadow: '0px 1px 2px rgba(0,0,0,0.06)',
        };
      default:
        return {};
    }
  };

  // 处理折叠/展开点击
  const handleIndicatorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeCollapse(graph, id);
  };

  return (
    <div
      style={{
        position: 'relative',
        minWidth: '100%',
        height: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        ...getNodeStyle(),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span>{label}</span>

      {/* 折叠/展开指示器 */}
      {hasChildren && (
        <div
          style={{
            position: 'absolute',
            right: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '15px',
            height: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: type === ENodeType.topic ? '#4E86E4' : '#69B1FF',
            userSelect: 'none',
            backgroundColor: 'white',
            borderRadius: '50%',
            overflow: 'hidden',
          }}
          onClick={handleIndicatorClick}
        >
          {isCollapsed ? (
            <IconPlusCircle
              style={{
                fontSize: '18px',
                position: 'absolute',
              }}
            />
          ) : (
            <IconMinusCircle style={{ fontSize: '18px', position: 'absolute' }} />
          )}
        </div>
      )}
    </div>
  );
};

export default MindMapNode;
