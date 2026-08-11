'use client';

import React, { useState } from 'react';
import { Tabs, Tag, Dropdown, Menu, Button, Modal, message, Flex, CheckOutlined, CloseOutlined, DeleteOutlined, EllipsisOutlined, Empty } from '@sue/design-web-react';
import dayjs from 'dayjs';

import { TaskVo } from '@true-north/vo';
import { TaskStatus } from '@true-north/enum';
import { TaskService } from '@true-north/web-service';
import { useTaskDetailContext } from './context';
import { useTodoDetail } from '../../components/TodoDetail';
import styles from './style.module.less';
import { useFocusTimer } from '../../focus-timer';
import { emitTaskChanged } from '../../events';

interface TaskMainProps {
  task: TaskVo;
  onDeleted?: () => void;
  onEdit: () => void;
}

// 状态配置映射
const STATUS_CONFIG = {
  [TaskStatus.TODO]: {
    label: '待办',
    color: 'gray',
  },
  [TaskStatus.DOING]: {
    label: '进行中',
    color: 'blue',
  },
  [TaskStatus.DONE]: {
    label: '已完成',
    color: 'green',
  },
  [TaskStatus.ABANDONED]: {
    label: '已放弃',
    color: 'red',
  },
};

const TaskMain: React.FC<TaskMainProps> = ({ task, onDeleted, onEdit }) => {
  const { refreshData } = useTaskDetailContext();
  const { openEditDrawer: openTodoDrawer } = useTodoDetail();
  const { open: openFocusTimer } = useFocusTimer();
  const [activeTab, setActiveTab] = useState('overview');

  const formatDuration = (duration?: number) => {
    if (!duration) return '0 分钟';
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return hours ? `${hours} 小时 ${minutes} 分钟` : `${minutes} 分钟`;
  };

  // 标记完成
  const handleComplete = async () => {
    try {
      const done = await TaskService.markDone(task.id);
      if (!done) return;
      emitTaskChanged();
      message.success('任务已标记为完成');
      await refreshData();
    } catch (error) {
      console.error('标记完成失败:', error);
      message.error('标记完成失败');
    }
  };

  // 恢复任务
  const handleRestore = async () => {
    try {
      const restored = await TaskService.restore(task.id);
      if (!restored) return;
      emitTaskChanged();
      message.success('任务已恢复');
      await refreshData();
    } catch (error) {
      console.error('恢复失败:', error);
      message.error('恢复失败');
    }
  };

  // 放弃任务
  const handleAbandon = () => {
    Modal.confirm({
      title: '确定放弃任务吗？',
      content: '放弃后可以重新激活，是否继续？',
      onOk: async () => {
        try {
          const abandoned = await TaskService.abandon(task.id);
          if (!abandoned) return;
          emitTaskChanged();
          message.success('任务已放弃');
          await refreshData();
        } catch (error) {
          console.error('放弃失败:', error);
          message.error('放弃失败');
        }
      },
    });
  };

  const handleStart = async () => {
    try {
      await TaskService.start(task.id);
      emitTaskChanged();
      await refreshData();
    } catch (error) {
      console.error('开始任务失败:', error);
    }
  };

  const handlePause = async () => {
    try {
      await TaskService.pause(task.id);
      emitTaskChanged();
      await refreshData();
    } catch (error) {
      console.error('暂停任务失败:', error);
    }
  };

  // 删除任务
  const handleDelete = () => {
    Modal.confirm({
      title: '确定删除吗？',
      content: '删除后将无法恢复；存在子任务或关联待办时无法删除，是否继续？',
      onOk: async () => {
        try {
          const deleted = await TaskService.delete(task.id);
          if (!deleted) return;
          emitTaskChanged();
          message.success('删除成功');
          onDeleted?.();
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
      {task.status === TaskStatus.TODO && (
        <Menu.Item key="start" onClick={handleStart}>开始</Menu.Item>
      )}
      {task.status === TaskStatus.DOING && (
        <Menu.Item key="pause" onClick={handlePause}>暂停</Menu.Item>
      )}
      {(task.status === TaskStatus.TODO || task.status === TaskStatus.DOING) && (
        <Menu.Item key="abandon" onClick={handleAbandon}>
          <CloseOutlined /> 放弃
        </Menu.Item>
      )}
      <Menu.Item key="delete" onClick={handleDelete} className={styles.dangerAction}>
        <DeleteOutlined /> 删除
      </Menu.Item>
    </Menu>
  );

  // 获取主要按钮
  const getPrimaryButton = () => {
    switch (task.status) {
      case TaskStatus.TODO:
      case TaskStatus.DOING:
        return (
          <Button type="primary" icon={<CheckOutlined />} onClick={handleComplete}>
            标记完成
          </Button>
        );
      case TaskStatus.DONE:
      case TaskStatus.ABANDONED:
        return (
          <Button type="primary" onClick={handleRestore}>
            恢复任务
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Flex vertical container="full" className={styles.detailMain}>
      {/* 头部 */}
      <Flex
        container="fixed"
        className={styles.detailHeader}
        justify="space-between"
        align="center"
      >
        {/* 左侧：任务名称 */}
        <Flex container="fill" className={styles.titleWrap} align="center">
          <h2 className={styles.title}>
            {task.name}
          </h2>
        </Flex>

        {/* 右侧：状态 Tag + 操作区 */}
        <Flex
          container="fixed"
          align="center"
          gap={8}
          className={styles.actions}
        >
          {/* 状态 Tag（只读） */}
          <Tag color={STATUS_CONFIG[task.status]?.color}>
            {STATUS_CONFIG[task.status]?.label}
          </Tag>

          <Button type="text" onClick={onEdit}>
            编辑
          </Button>

          {/* ... 下拉菜单 */}
          <Dropdown
            popupRender={() => renderActionMenu()}
            placement="bottomRight"
          >
            <Button type="text" icon={<EllipsisOutlined />} />
          </Dropdown>

          {/* 主要按钮 */}
          {getPrimaryButton()}
        </Flex>
      </Flex>

      {/* 内容区域 */}
      <Flex container="fill" className={styles.detailContent}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className={styles.tabs}
          items={[
            {
              key: 'overview',
              label: '概览',
              children: (
                <div className={styles.tabBody}>
                  <Flex vertical gap={16}>
                    {/* 基础信息 */}
                    <section className={styles.infoCard}>
                      <h3 className={styles.infoTitle}>
                        基础信息
                      </h3>
                      <div className={styles.infoGrid}>
                        <div>
                          <span className={styles.label}>任务名称：</span>
                          <span>{task.name}</span>
                        </div>
                        <div>
                          <span className={styles.label}>状态：</span>
                          <Tag
                            color={STATUS_CONFIG[task.status]?.color}
                            size="small"
                          >
                            {STATUS_CONFIG[task.status]?.label}
                          </Tag>
                        </div>
                        {task.description && (
                          <div className={styles.fullRow}>
                            <span className={styles.label}>描述：</span>
                            <p className={styles.description}>
                              {task.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* 时间信息 */}
                    <section className={styles.infoCard}>
                      <h3 className={styles.infoTitle}>
                        时间信息
                      </h3>
                      <div className={styles.infoGrid}>
                        {task.startAt && (
                          <div>
                            <span className={styles.label}>开始时间：</span>
                            <span>
                              {dayjs(task.startAt).format('YYYY-MM-DD HH:mm')}
                            </span>
                          </div>
                        )}
                        {task.endAt && (
                          <div>
                            <span className={styles.label}>结束时间：</span>
                            <span>
                              {dayjs(task.endAt).format('YYYY-MM-DD HH:mm')}
                            </span>
                          </div>
                        )}
                      </div>
                    </section>
                  </Flex>
                </div>
              ),
            },
            {
              key: 'todos',
              label: '关联待办',
              children: (
                <div className={styles.tabBody}>
                  {task.todoList?.length ? task.todoList.map((todo) => (
                    <div className={styles.todoRow} key={todo.id}>
                      <span>{todo.name}</span>
                      <Button type="link" onClick={() => openTodoDrawer({ contentProps: { todo, afterSubmit: refreshData } })}>查看</Button>
                    </div>
                  )) : <div className={styles.emptyText}>暂无关联待办</div>}
                </div>
              ),
            },
            {
              key: 'tracktime',
              label: '时间追踪',
              children: (
                <Flex vertical gap={12} className={styles.tabBody}>
                  <Flex justify="end">
                    <Button type="primary" onClick={() => openFocusTimer({ taskId: task.id, label: task.name })}>
                      打开计时器
                    </Button>
                  </Flex>
                  {task.trackTimeList?.length ? task.trackTimeList.map((record) => (
                    <Flex key={record.id} justify="space-between" align="center" className={styles.trackRow}>
                      <span>{record.startAt ? dayjs(record.startAt).format('YYYY-MM-DD HH:mm') : '手动记录'}</span>
                      <Flex gap={12} align="center">
                        {record.notes && <span>{record.notes}</span>}
                        <strong>{formatDuration(record.duration)}</strong>
                      </Flex>
                    </Flex>
                  )) : <Empty description="暂无时间记录" />}
                </Flex>
              ),
            },
          ]}
        />
      </Flex>
    </Flex>
  );
};

export default TaskMain;
