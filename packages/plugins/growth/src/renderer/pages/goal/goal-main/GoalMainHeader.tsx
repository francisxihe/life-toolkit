import React, { useEffect } from 'react';
import {
  Modal,
  message,
  Tag,
  Dropdown,
  Button,
  Breadcrumb,
  Flex,
} from '@sue/design-web-react';
import { Check, ChevronRight, Ellipsis, Pencil, Trash2, X } from 'lucide-react';

import { GoalController, GoalService } from '@true-north/web-service';
import { useGoalContext } from '../context';
import { useGoalDetail } from '../../components/goal-detail';
import { GoalStatus } from '@true-north/enum';
import styles from './style.module.less';

const STATUS_CONFIG = {
  [GoalStatus.TODO]: {
    label: '待开始',
    color: 'gray',
  },
  [GoalStatus.DOING]: {
    label: '进行中',
    color: 'blue',
  },
  [GoalStatus.DONE]: {
    label: '已完成',
    color: 'green',
  },
  [GoalStatus.ABANDONED]: {
    label: '已放弃',
    color: 'red',
  },
};

const GoalMainHeader: React.FC = () => {
  const {
    selectedGoal,
    fetchGoalDetail,
    refreshData,
    selectedGoalId,
    setSelectedGoalId,
  } = useGoalContext();
  const { openEditDrawer } = useGoalDetail();

  const buildBreadcrumbPath = () => {
    if (!selectedGoal) return [];

    const path = [];
    let current = selectedGoal;

    while (current) {
      path.unshift({
        id: current.id,
        name: current.name,
        goal: current,
      });
      current = current.parent;
    }

    return path;
  };

  const breadcrumbPath = buildBreadcrumbPath();

  useEffect(() => {
    if (selectedGoalId) {
      fetchGoalDetail(selectedGoalId);
    }
  }, [selectedGoalId]);

  const handleEdit = () => {
    if (!selectedGoal) return;
    openEditDrawer({
      title: '编辑目标',
      contentProps: {
        goalId: selectedGoal.id,
        afterSubmit: async () => {
          await refreshData();
        },
      },
    });
  };

  const handleComplete = async () => {
    if (!selectedGoal) return;

    Modal.confirm({
      title: '确定标记目标为完成吗？',
      content: '完成后可通过“恢复”重新激活目标。',
      onOk: async () => {
        try {
          const done = await GoalService.markDone(selectedGoal.id);
          if (!done) return;
          message.success('目标已标记为完成');
          await refreshData();
        } catch (error) {
          console.error('标记完成失败:', error);
          message.error('标记完成失败');
        }
      },
    });
  };

  const handleRestore = async () => {
    if (!selectedGoal) return;
    try {
      const restored = await GoalService.restore(selectedGoal.id);
      if (!restored) return;
      message.success('目标已恢复');
      await refreshData();
    } catch (error) {
      console.error('恢复目标失败:', error);
      message.error('恢复目标失败');
    }
  };

  const handleAbandon = () => {
    if (!selectedGoal) return;

    Modal.confirm({
      title: '确定放弃目标吗？',
      content: '放弃后可以重新激活，是否继续？',
      onOk: async () => {
        try {
          const abandoned = await GoalService.abandon(selectedGoal.id);
          if (!abandoned) return;
          message.success('目标已放弃');
          await refreshData();
        } catch (error) {
          console.error('放弃失败:', error);
          message.error('放弃失败');
        }
      },
    });
  };

  const handleDelete = () => {
    if (!selectedGoal) return;

    Modal.confirm({
      title: '确定删除吗？',
      content: '删除前会检查子目标和关联行动；存在关联内容时不会删除。',
      onOk: async () => {
        try {
          await GoalController.delete(selectedGoal.id);
          message.success('删除成功');
          setSelectedGoalId(null);
          await refreshData();
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      },
    });
  };

  const canAbandon =
    selectedGoal &&
    (selectedGoal.status === GoalStatus.TODO ||
      selectedGoal.status === GoalStatus.DOING);

  const menuItems = [
    {
      key: 'edit',
      label: '编辑',
      icon: <Pencil size={16} />,
      onClick: handleEdit,
    },
    ...(canAbandon
      ? [
          {
            key: 'abandon',
            label: '放弃',
            icon: <X size={16} />,
            onClick: handleAbandon,
          },
        ]
      : []),
    {
      key: 'delete',
      label: '删除',
      icon: <Trash2 size={16} />,
      danger: true,
      className: styles.dangerAction,
      onClick: handleDelete,
    },
  ];

  return (
    <Flex
      container="fixed"
      className={styles.header}
      justify="space-between"
      align="center"
    >
      <Flex container="fill" className={styles.breadcrumb} align="center">
        <Breadcrumb
          styles={{
            item: {
              fontSize: 16,
            },
          }}
          separator={<ChevronRight size={16} />}
          items={breadcrumbPath.map((item, index) => ({
            key: item.id,
            title: item.name,
            onClick: () => {
              if (index < breadcrumbPath.length - 1) {
                setSelectedGoalId(item.id);
              }
            },
          }))}
        />
      </Flex>

      <Flex container="fixed" align="center" gap={8} className={styles.actions}>
        {selectedGoal && (
          <Tag color={STATUS_CONFIG[selectedGoal.status]?.color}>
            {STATUS_CONFIG[selectedGoal.status]?.label}
          </Tag>
        )}

        <Dropdown
          trigger={['click']}
          placement="bottomRight"
          menu={{ items: menuItems }}
        >
          <Button
            type="text"
            icon={<Ellipsis size={16} />}
            aria-label="目标更多操作"
          />
        </Dropdown>

        {selectedGoal &&
          (selectedGoal.status === GoalStatus.TODO ||
            selectedGoal.status === GoalStatus.DOING) && (
            <Button
              type="primary"
              icon={<Check size={16} />}
              onClick={handleComplete}
            >
              标记完成
            </Button>
          )}

        {selectedGoal &&
          (selectedGoal.status === GoalStatus.DONE ||
            selectedGoal.status === GoalStatus.ABANDONED) && (
            <Button type="primary" onClick={handleRestore}>
              恢复目标
            </Button>
          )}
      </Flex>
    </Flex>
  );
};

export default GoalMainHeader;
