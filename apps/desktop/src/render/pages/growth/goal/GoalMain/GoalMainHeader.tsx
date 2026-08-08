import React, { useEffect, useState } from 'react';
import { Modal, message, Tag, Dropdown, Menu, Button, Breadcrumb, Flex, CheckOutlined, CloseOutlined, DeleteOutlined, EditOutlined, EllipsisOutlined, RightOutlined } from '@sue/design-web-react';

import { GoalController, GoalService } from '@true-north/web-service';
import { useGoalContext } from '../context';
import { GoalStatus } from '@true-north/enum';
import styles from './style.module.less';
import GoalAiDecomposition from '../GoalAiDecomposition';

// 状态配置映射
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
  const [aiOpen, setAiOpen] = useState(false);
  const {
    selectedGoal,
    fetchGoalDetail,
    refreshData,
    selectedGoalId,
    setSelectedGoalId,
    isEditing,
    setIsEditing,
  } = useGoalContext();

  // 构建面包屑路径
  const buildBreadcrumbPath = () => {
    if (!selectedGoal) return [];

    const path = [];
    let current = selectedGoal;

    // 从当前目标向上追溯到根目标
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

  // 当选中的目标ID变化时，获取详情
  useEffect(() => {
    if (selectedGoalId) {
      fetchGoalDetail(selectedGoalId);
      setIsEditing(false); // 切换目标时退出编辑模式
    }
  }, [selectedGoalId]);

  // 编辑完成后的回调
  const handleEditComplete = async () => {
    setIsEditing(false);
    await refreshData();
  };

  // 标记完成
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

  // 放弃目标
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

  // 删除目标
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

  // 渲染操作菜单
  const renderActionMenu = () => (
    <Menu>
      <Menu.Item key="edit" onClick={() => setIsEditing(true)}>
        <EditOutlined /> 编辑
      </Menu.Item>
      {selectedGoal && (selectedGoal.status === GoalStatus.TODO || selectedGoal.status === GoalStatus.DOING) && (
        <Menu.Item key="abandon" onClick={handleAbandon}>
          <CloseOutlined /> 放弃
        </Menu.Item>
      )}
      <Menu.Item key="delete" onClick={handleDelete} className={styles.dangerAction}>
        <DeleteOutlined /> 删除
      </Menu.Item>
    </Menu>
  );

  return (
    <Flex
      container="fixed"
      className={styles.header}
      justify="space-between"
      align="center"
    >
      {/* 左侧：面包屑导航 */}
      <Flex container="fill" className={styles.breadcrumb} align="center">
        <Breadcrumb
          separator={<RightOutlined />}
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

      {/* 右侧：状态 Tag + 操作区 */}
      <Flex
        container="fixed"
        align="center"
        gap={8}
        className={styles.actions}
      >
        {selectedGoal && (
          <Button onClick={() => setAiOpen(true)}>AI 拆解</Button>
        )}
        {selectedGoal && (
          <Tag color={STATUS_CONFIG[selectedGoal.status]?.color}>
            {STATUS_CONFIG[selectedGoal.status]?.label}
          </Tag>
        )}

        <Dropdown
          popupRender={() => renderActionMenu()}
          placement="bottomRight"
        >
          <Button icon={<EllipsisOutlined />} />
        </Dropdown>

        {/* 主要状态操作 */}
        {selectedGoal && (selectedGoal.status === GoalStatus.TODO || selectedGoal.status === GoalStatus.DOING) && (
          <Button
            type="primary"
            size="default"
            status="success"
            icon={<CheckOutlined />}
            onClick={handleComplete}
          >
            已完成
          </Button>
        )}

        {selectedGoal && (selectedGoal.status === GoalStatus.DONE || selectedGoal.status === GoalStatus.ABANDONED) && (
          <Button type="primary" onClick={handleRestore}>
            恢复
          </Button>
        )}
      </Flex>
      <GoalAiDecomposition open={aiOpen} goal={selectedGoal} onClose={() => setAiOpen(false)} onSaved={refreshData} />
    </Flex>
  );
};

export default GoalMainHeader;
