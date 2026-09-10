import { CircleMinus, CirclePlus, Ellipsis } from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReactShape } from '@antv/x6-react-shape';
import { ENodeType } from '@true-north/components-mind/src/types';

import styles from './style.module.less';
import clsx from 'clsx';
import { handleEditNode } from '../helpers';

interface CustomNodeProps {
  node?: ReactShape; // X6 React Shape 自动注入的 node 属性
  onShowMenu?: (
    nodeId: string,
    nodeType: string,
    position: { x: number; y: number },
  ) => void;
  [key: string]: any; // 允许其他 props
}

interface NodeData {
  id: string;
  label: string;
  type: ENodeType;
  hasChildren?: boolean;
  isCollapsed?: boolean;
  isSelected?: boolean;
}

const prefixClassName = 'mind-map-node';

const getClassName = (type?: string) => {
  return styles[`${prefixClassName}${type || ''}`];
};

const MindMapNode: React.FC<CustomNodeProps> = ({
  node,
  isNodeCollapsed,
  toggleNodeCollapse,
  fetchGoalTree,
  onShowMenu,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentNodeData, setCurrentNodeData] = useState<NodeData | null>(null);

  // 获取图形实例
  const graph = node?.model?.graph;

  if (!node) {
    console.warn('MindMapNode: node not found in props', { node });
    return (
      <div
        style={{
          padding: '8px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
        }}
      >
        Node not found
      </div>
    );
  }

  const {
    id,
    label,
    type,
    hasChildren = false,
    isSelected = false,
  } = currentNodeData ||
    (node?.getData() as NodeData) || {
      id: '',
      label: 'Unknown',
      type: 'topic' as const,
    };

  const updateCollapsedState = useCallback(() => {
    setIsCollapsed(isNodeCollapsed(id));
  }, [id, isNodeCollapsed]);

  // 监听节点数据变化
  useEffect(() => {
    if (node) {
      const updateNodeData = () => {
        setCurrentNodeData(node.getData() as NodeData);
      };

      // 初始化节点数据
      updateNodeData();

      // 监听节点数据变化
      node.on('change:data', updateNodeData);

      return () => {
        node.off('change:data', updateNodeData);
      };
    }
  }, [node]);

  // 监听节点折叠状态变化
  useEffect(() => {
    // 初始化状态
    updateCollapsedState();

    // 监听图的变化事件
    if (graph) {
      graph.on('node:change:*', updateCollapsedState);
      return () => {
        graph.off('node:change:*', updateCollapsedState);
      };
    }
  }, [graph, updateCollapsedState]);

  // 处理折叠/展开点击
  const onClickCollapsedButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeCollapse(graph, id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 点击事件会被 X6 的 node:click 事件处理，这里不需要额外处理
  };

  const handleDoubleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    await handleEditNode(id);
    await fetchGoalTree();
  };

  // 处理菜单按钮点击
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!onShowMenu || !nodeRef.current) return;

    // 获取节点在页面中的位置
    const rect = nodeRef.current.getBoundingClientRect();
    const position = {
      x: rect.right + 8, // 菜单显示在节点右侧
      y: rect.top,
    };

    onShowMenu(id, type, position);
  };

  const nodeRef = useRef<HTMLDivElement>(null);
  const lastSizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const el = nodeRef.current;
    if (!el || !node) return;

    const applySize = () => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      if (
        width > 0 &&
        height > 0 &&
        (Math.abs(width - lastSizeRef.current.width) > 1 ||
          Math.abs(height - lastSizeRef.current.height) > 1)
      ) {
        lastSizeRef.current = { width, height };
        node.setSize(width, height);
      }
    };

    applySize();
  }, [node, label, type, isSelected]);

  return (
    <div
      ref={nodeRef}
      className={clsx(
        getClassName(),
        type === ENodeType.topic && getClassName(`-topic`),
        type === ENodeType.topicBranch && getClassName(`-topic-branch`),
        type === ENodeType.topicChild && getClassName(`-topic-child`),
        isSelected && getClassName(`--selected`),
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <span className={getClassName(`__label`)}>{label}</span>

      {/* 菜单按钮 */}
      <div
        className={getClassName(`__menu-button`)}
        onClick={handleMenuClick}
        title="更多操作"
      >
        <Ellipsis size={16} />
      </div>

      {/* 折叠/展开指示器 */}
      {hasChildren && (
        <div
          className={getClassName(`__collapsed-button`)}
          onClick={onClickCollapsedButton}
        >
          {isCollapsed ? (
            <CirclePlus
              size={18}
              style={{
                position: 'absolute',
              }}
            />
          ) : (
            <CircleMinus
              size={18}
              style={{ position: 'absolute' }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MindMapNode;
