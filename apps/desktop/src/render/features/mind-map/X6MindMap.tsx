import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoalVo } from '@true-north/vo';
import {
  MindMap,
  createGoalConverter,
  MindMapData,
} from '@true-north/components-mind/src/index';
import MindMapNode from './mind-map-node';
import MenuManager, { MenuManagerRef } from './node-menu/MenuManager';
import { useGoalMindMapContext } from './context';
import {
  handleAddChild,
  handleAddSibling,
  handleCopyNode,
  handleDeleteNode,
  handleEditNode,
} from './helpers';
import styles from './style.module.less';

interface X6MindMapProps {
  goalTree: GoalVo[];
  onNodeClick?: (nodeId: string) => void;
  showToolbar?: boolean;
}

const X6MindMap: React.FC<X6MindMapProps> = ({
  goalTree,
  onNodeClick,
  showToolbar = true,
}) => {
  const { fetchGoalTree } = useGoalMindMapContext();
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuManagerRef = useRef<MenuManagerRef>(null);
  const fetchGoalTreeRef = useRef(fetchGoalTree);
  const onShowMenuRef = useRef<
    | ((
        nodeId: string,
        nodeType: string,
        position: { x: number; y: number },
      ) => void)
    | null
  >(null);

  fetchGoalTreeRef.current = fetchGoalTree;

  useEffect(() => {
    if (goalTree && goalTree.length > 0) {
      const converter = createGoalConverter();
      setMindMapData(converter.convert(goalTree));
    } else {
      setMindMapData(null);
    }
  }, [goalTree]);

  const handleShowMenu = useCallback(
    (
      nodeId: string,
      nodeType: string,
      position: { x: number; y: number },
    ) => {
      menuManagerRef.current?.showMenu(nodeId, nodeType, position);
    },
    [],
  );

  onShowMenuRef.current = handleShowMenu;

  const BoundNode = useMemo(() => {
    return function Node(props: any) {
      return (
        <MindMapNode
          {...props}
          fetchGoalTree={() => fetchGoalTreeRef.current()}
          onShowMenu={(
            nodeId: string,
            nodeType: string,
            position: { x: number; y: number },
          ) => onShowMenuRef.current?.(nodeId, nodeType, position)}
        />
      );
    };
  }, []);

  return (
    <div ref={containerRef} className={styles.mapHost}>
      {mindMapData ? (
        <MindMap
          data={mindMapData}
          options={{
            editable: false,
            enableShortcuts: true,
            centerOnResize: false,
            hGap: 50,
            vGap: 25,
          }}
          showToolbar={showToolbar}
          onNodeClick={onNodeClick}
          MindMapNode={BoundNode}
        />
      ) : (
        <div className={styles.empty}>暂无目标数据</div>
      )}

      <MenuManager
        ref={menuManagerRef}
        onEdit={async (nodeId: string) => {
          await handleEditNode(nodeId);
          fetchGoalTree();
        }}
        onDelete={async (nodeId: string) => {
          await handleDeleteNode(nodeId);
          fetchGoalTree();
        }}
        onAddChild={async (nodeId: string) => {
          await handleAddChild(nodeId);
          fetchGoalTree();
        }}
        onAddSibling={async (nodeId: string) => {
          await handleAddSibling(nodeId);
          fetchGoalTree();
        }}
        onCopy={async (nodeId: string) => {
          await handleCopyNode(nodeId);
          fetchGoalTree();
        }}
      />
    </div>
  );
};

export default X6MindMap;
