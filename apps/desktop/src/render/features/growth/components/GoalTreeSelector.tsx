import { TreeSelect } from '@sue/design-web-react';
import { useEffect, useState } from 'react';
import { GoalService } from '@true-north/web-service';
import type { GoalVo } from '@true-north/vo';

interface GoalTreeSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  /** 需要排除的目标ID（例如当前编辑的目标本身） */
  excludeId?: string;
}

interface TreeNode {
  key: string;
  title: string;
  value: string;
  children?: TreeNode[];
  disabled?: boolean;
}

export default function GoalTreeSelector(props: GoalTreeSelectorProps) {
  const {
    value,
    onChange,
    placeholder = '请选择父级目标',
    allowClear = true,
    disabled = false,
    excludeId,
  } = props;

  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  useEffect(() => {
    fetchGoalTree();
  }, [excludeId]);

  const fetchGoalTree = async () => {
    setLoading(true);
    try {
      const data = await GoalService.getTree({});

      if (data) {
        const blockedIds = collectDescendantIds(data, excludeId);
        const tree = convertToTreeNodes(data, blockedIds, excludeId);
        setTreeData(tree);
      }
    } catch (error) {
      console.error('获取目标树失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 将 GoalVo 转换为 TreeSelect 所需的 TreeNode 格式
  const collectDescendantIds = (goals: GoalVo[], targetId?: string): Set<string> => {
    if (!targetId) return new Set();
    for (const goal of goals) {
      if (goal.id === targetId) {
        const ids = new Set<string>();
        const collect = (node: GoalVo) => {
          ids.add(node.id);
          node.children?.forEach(collect);
        };
        collect(goal);
        return ids;
      }
      const nested = collectDescendantIds(goal.children || [], targetId);
      if (nested.size) return nested;
    }
    return new Set();
  };

  const convertToTreeNodes = (
    goals: GoalVo[],
    blockedIds: Set<string>,
    excludeId?: string,
  ): TreeNode[] => {
    return goals
      .filter((goal) => goal.id && goal.id !== excludeId) // 过滤掉无效节点和当前编辑的目标
      .map((goal) => {
        const node: TreeNode = {
          key: goal.id,
          title: goal.name,
          value: goal.id,
          // 当前目标的所有后代不能作为新的父级，避免形成循环关系。
          disabled: blockedIds.has(goal.id),
        };

        // 递归处理子目标
        if (goal.children && goal.children.length > 0) {
          node.children = convertToTreeNodes(goal.children, blockedIds, excludeId);
        }

        return node;
      });
  };

  return (
    <TreeSelect
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      treeData={treeData}
      loading={loading}
      allowClear={allowClear}
      disabled={disabled}
      showSearch
      filterTreeNode={(inputValue, treeNode) => {
        return String(treeNode.title ?? '').toLowerCase().includes(inputValue.toLowerCase());
      }}
      listHeight={200}
    />
  );
}
