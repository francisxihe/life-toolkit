import React, { useEffect, useState } from 'react';
import {
  Tree,
  Input,
  Button,
  Spin,
  Empty,
  Modal,
  message,
  Tag,
  Divider,
  Flex,
  EditableText,
  SearchOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@sue/design-web-react';
import ContextMenu from '@/components/ContextMenu';
import { GoalVo } from '@true-north/vo';
import { GoalStatus } from '@true-north/enum';
import { useGoalContext } from '../context';
import { useGoalDetail } from '../../components/GoalDetail';
import { GoalService } from '@true-north/web-service';
import styles from './style.module.less';

interface TreeNodeData {
  key: string;
  title: React.ReactNode;
  children?: TreeNodeData[];
  goalData: GoalVo;
  goalName: string; // 用于搜索的纯文本标题
  isLeaf?: boolean; // 是否为叶子节点
}

const GoalTreePanel: React.FC = ({}) => {
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

  // 初始化数据和监听筛选条件变化
  useEffect(() => {
    fetchGoalTree();
  }, [fetchGoalTree]);

  // 获取状态标签
  const getStatusTag = (status: GoalStatus) => {
    const statusConfig = {
      [GoalStatus.TODO]: { color: 'gray', text: '待开始' },
      [GoalStatus.DOING]: { color: 'blue', text: '进行中' },
      [GoalStatus.DONE]: { color: 'green', text: '已完成' },
      [GoalStatus.ABANDONED]: { color: 'red', text: '已放弃' },
    };

    const config = statusConfig[status];
    return (
      <Tag color={config.color} >
        {config.text}
      </Tag>
    );
  };

  // 转换目标数据为树形结构
  const convertToTreeData = (goals: GoalVo[]): TreeNodeData[] => {
    return goals.map((goal) => ({
      key: goal.id,
      isLeaf: !goal.hasChildren, // 根据 hasChildren 字段判断是否为叶子节点
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
            container="full"
            align="center"
            justify="space-between"
            className={styles['tree-node']}
          >
            <Flex container="fixed" className={styles.treeStatus}>
              {getStatusTag(goal.status)}
            </Flex>
            <Flex container="fill">
              <EditableText
                ellipsis={{ tooltip: true }}
                style={{ width: '100%' }}
              >
                {goal.name}
              </EditableText>
            </Flex>
          </Flex>
        </ContextMenu>
      ),
      goalData: goal,
      goalName: goal.name,
      children: goal.children ? convertToTreeData(goal.children) : undefined,
    }));
  };

  // 更新树形数据
  useEffect(() => {
    const converted = convertToTreeData(goalTree);
    setTreeData(converted);

    // 有筛选条件时自动展开所有节点
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

  // 处理节点选择
  const handleSelect = (selectedKeys: string[]) => {
    const goalId = selectedKeys[0] || null;
    setSelectedGoalId(goalId);
  };

  // 处理节点展开并懒加载
  const handleExpandWithLoad = async (expandedKeys: string[], info: any) => {
    setExpandedKeys(expandedKeys);

    // 如果是展开操作且节点没有子节点，则尝试加载
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

  // 递归查找节点
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

  // 懒加载子节点
  const loadData = async (treeNode: any) => {
    const goalId = treeNode.key;
    try {
      // 使用上下文中的 loadChildren 方法
      await loadChildren(goalId);
    } catch (error) {
      console.error('加载子节点失败:', error);
    }
  };

  // 创建子目标
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

  // 创建同级目标
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

  // 编辑目标
  const handleEdit = (goal: GoalVo) => {
    openEditDrawer({
      title: '编辑目标',
      contentProps: {
        goalId: goal.id,
        afterSubmit: refreshData,
      },
    });
  };

  // 复制目标
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

  // 删除目标
  const handleDelete = (goal: GoalVo) => {
    Modal.confirm({
      title: '确定删除吗？',
      content: '删除前会检查子目标和关联行动；存在关联内容时不会删除。',
      onOk: async () => {
        try {
          await GoalService.delete(goal.id);
          message.success('删除成功');
          refreshData();
          // 如果删除的是当前选中的目标，清空选择
          if (selectedGoalId === goal.id) {
            setSelectedGoalId(null);
          }
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 获取所有节点的 key
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
