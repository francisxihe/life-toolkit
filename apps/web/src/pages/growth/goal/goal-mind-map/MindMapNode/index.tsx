import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReactShape } from '@antv/x6-react-shape';
import { ENodeType } from '@life-toolkit/components-web-mind/src/types';
import { IconPlusCircle, IconMinusCircle } from '@arco-design/web-react/icon';
import GoalEditor from '../../../components/GoalDetail/GoalEditor';
import { openDrawer } from '@/layout/Drawer';
import styles from './style.module.less';

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

const MindMapNode: React.FC<CustomNodeProps> = ({
  node,
  isNodeCollapsed,
  toggleNodeCollapse,
  fetchGoalTree,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const nodeData = node.getData() as NodeData;
  const {
    id,
    label,
    type,
    hasChildren = false,
  } = nodeData || { id: '', label: 'Unknown', type: 'topic' as const };

  const updateCollapsedState = useCallback(() => {
    setIsCollapsed(isNodeCollapsed(id));
  }, [id, isNodeCollapsed]);

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
  const onClickCollapsedButton = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleNodeCollapse(graph, id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    // openDrawer({
    //   title: '编辑目标',
    //   width: 800,
    //   content: (props) => {
    //     return (
    //       <GoalEditor
    //         goalId={id}
    //         onClose={props.onClose}
    //         afterSubmit={async () => {
    //           fetchGoalTree();
    //         }}
    //       />
    //     );
    //   },
    // });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    openDrawer({
      title: '编辑目标',
      width: 800,
      content: (props) => {
        return (
          <GoalEditor
            goalId={id}
            onClose={props.onClose}
            afterSubmit={async () => {
              fetchGoalTree();
            }}
          />
        );
      },
    });
  };

  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(nodeRef.current.clientWidth, nodeRef.current.clientHeight);
    setTimeout(() => {
      if (nodeRef.current) {
        node.setSize(nodeRef.current.clientWidth, nodeRef.current.clientHeight);
      }
    }, 1000);
  }, [nodeRef.current]);

  return (
    <div
      ref={nodeRef}
      className={styles['mind-map-node']}
      style={getNodeStyle()}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <span className={styles['mind-map-node-label']}>{label}</span>

      {/* 折叠/展开指示器 */}
      {hasChildren && (
        <div
          className={styles['mind-map-node-collapsed-button']}
          style={{
            color: type === ENodeType.topic ? '#4E86E4' : '#69B1FF',
          }}
          onClick={onClickCollapsedButton}
        >
          {isCollapsed ? (
            <IconPlusCircle
              style={{
                fontSize: '18px',
                position: 'absolute',
              }}
            />
          ) : (
            <IconMinusCircle
              style={{ fontSize: '18px', position: 'absolute' }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MindMapNode;
