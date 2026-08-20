import React, { useEffect, useState } from 'react';
import {
  Tree,
  Spin,
  Empty,
  Modal,
  message,
  Flex,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@sue/design-web-react';
import dayjs from 'dayjs';
import ContextMenu from '@/components/ContextMenu';
import { GoalVo } from '@true-north/vo';
import { useGoalContext } from '../context';
import { useGoalDetail } from '../../components/GoalDetail';
import { GoalService } from '@true-north/web-service';
import styles from './style.module.less';

interface TreeNodeData {
  key: string;
  title: React.ReactNode;
  children?: TreeNodeData[];
  goalData: GoalVo;
  goalName: string;
  isLeaf?: boolean;
}

function formatTimeRange(goal: GoalVo) {
  const start = goal.startAt ? dayjs(goal.startAt).format('YYYY-MM-DD') : '未设置';
  const end = goal.endAt ? dayjs(goal.endAt).format('YYYY-MM-DD') : '未设置';
  return `${start} 至 ${end}`;
}

const GoalTreePanel: React.FC = () => {
  const {
    loading,
    goalTree,
    fetchGoalTree,
    refreshData,
    selectedGoalId,
    setSelectedGoalId,
    searchValue,
    filters,
    loadChildren,
  } = useGoalContext();
  const { openCreateDrawer, openEditDrawer } = useGoalDetail();
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<TreeNodeData[]>([]);

  useEffect(() => {
    fetchGoalTree();
  }, [fetchGoalTree]);

  const handleAddChild = (parentGoal: GoalVo) => {
    openCreateDrawer({
      title: '新增子目标',
      contentProps: {
        initialFormData: {
          parentId: parentGoal.id,
        },
        afterSubmit: refreshData,
      },
    });
  };

  const handleAddSibling = async (currentGoal: GoalVo) => {
    openCreateDrawer({
      title: '新增同级目标',
      contentProps: {
        initialFormData: {
          parentId: currentGoal.parentId,
        },
        afterSubmit: refreshData,
      },
    });
  };

  const handleEdit = (goal: GoalVo) => {
    openEditDrawer({
      title: '编辑目标',
      contentProps: {
        goalId: goal.id,
        afterSubmit: refreshData,
      },
    });
  };

  const handleCopy = async (goal: GoalVo) => {
    openCreateDrawer({
      title: '复制目标',
      contentProps: {
        initialFormData: {
          name: `${goal.name} - 副本`,
          description: goal.description,
          type: goal.type,
          importance: goal.importance,
          difficulty: goal.difficulty,
          parentId: goal.parentId,
          planTimeRange: [undefined, undefined],
        },
        afterSubmit: refreshData,
      },
    });
  };

  const handleDelete = (goal: GoalVo) => {
    Modal.confirm({
      title: '确定删除吗？',
      content: '删除前会检查子目标和关联行动；存在关联内容时不会删除。',
      onOk: async () => {
        try {
          await GoalService.delete(goal.id);
          message.success('删除成功');
          refreshData();
          if (selectedGoalId === goal.id) {
            setSelectedGoalId(null);
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const convertToTreeData = (goals: GoalVo[]): TreeNodeData[] => {
    return goals.map((goal) => ({
      key: goal.id,
      isLeaf: !goal.hasChildren,
      title: (
        <ContextMenu
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
          items={[
            {
              key: 'edit',
              label: '编辑',
              icon: <EditOutlined />,
              onClick: () => handleEdit(goal),
            },
            {
              key: 'addChild',
              label: '添加子目标',
              icon: <PlusOutlined />,
              onClick: () => handleAddChild(goal),
            },
            {
              key: 'addSibling',
              label: '添加同级目标',
              icon: <PlusOutlined />,
              onClick: () => handleAddSibling(goal),
            },
            {
              key: 'copy',
              label: '复制',
              icon: <CopyOutlined />,
              onClick: () => handleCopy(goal),
            },
            {
              key: 'divider',
              label: '',
              divider: true,
            },
            {
              key: 'delete',
              label: '删除',
              icon: <DeleteOutlined />,
              onClick: () => handleDelete(goal),
            },
          ]}
        >
          <Flex
            vertical
            container="full"
            justify="center"
            className={styles.treeNode}
          >
            <span className={styles.treeGoalLabel}>{goal.name}</span>
            <small className={styles.treeTimeRange}>
              {formatTimeRange(goal)}
            </small>
          </Flex>
        </ContextMenu>
      ),
      goalData: goal,
      goalName: goal.name,
      children: goal.children ? convertToTreeData(goal.children) : undefined,
    }));
  };

  useEffect(() => {
    const converted = convertToTreeData(goalTree);
    setTreeData(converted);

    if (
      searchValue ||
      Object.values(filters).some(
        (value) => value !== undefined && value !== null,
      )
    ) {
      const getAllKeys = (data: TreeNodeData[]): string[] => {
        const keys: string[] = [];
        data.forEach((node) => {
          keys.push(node.key);
          if (node.children) {
            keys.push(...getAllKeys(node.children));
          }
        });
        return keys;
      };
      setExpandedKeys(getAllKeys(converted));
    }
  }, [goalTree, searchValue, filters]);

  const handleSelect = (selectedKeys: string[]) => {
    const goalId = selectedKeys[0] || null;
    setSelectedGoalId(goalId);
  };

  const findNodeByKey = (
    node: TreeNodeData,
    key: string,
  ): TreeNodeData | null => {
    if (node.key === key) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const found = findNodeByKey(child, key);
        if (found) return found;
      }
    }
    return null;
  };

  const loadData = async (treeNode: any) => {
    const goalId = treeNode.key;
    try {
      await loadChildren(goalId);
    } catch (error) {
      console.error('加载子节点失败:', error);
    }
  };

  const handleExpandWithLoad = async (nextExpandedKeys: string[], info: any) => {
    setExpandedKeys(nextExpandedKeys);

    if (info.expanded && info.node) {
      const nodeKey = info.node.key;
      const nodeData = treeData.find((node) => findNodeByKey(node, nodeKey));

      if (
        nodeData &&
        (!nodeData.children || nodeData.children.length === 0) &&
        !nodeData.isLeaf
      ) {
        await loadData({ key: nodeKey });
      }
    }
  };

  return (
    <Spin spinning={loading} className={styles.treeLoading}>
      {treeData.length > 0 ? (
        <Tree
          treeData={treeData}
          selectedKeys={selectedGoalId ? [selectedGoalId] : []}
          expandedKeys={expandedKeys}
          onSelect={handleSelect}
          onExpand={handleExpandWithLoad}
          showLine
          blockNode
          className={styles.goalTree}
        />
      ) : (
        <Empty description="暂无目标数据" />
      )}
    </Spin>
  );
};

export default GoalTreePanel;
