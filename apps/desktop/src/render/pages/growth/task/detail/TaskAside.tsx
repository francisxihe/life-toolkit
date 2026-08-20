'use client';

import React, { useState } from 'react';
import { Tree, Button, Empty, Flex, PlusOutlined } from '@sue/design-web-react';

import { useTaskDetailContext } from './context';
import { TaskVo } from '@true-north/vo';
import { TaskStatus } from '@true-north/enum';
import clsx from 'clsx';
import { useTaskDetail } from '../../components/TaskDetail';
import styles from './style.module.less';

interface TaskAsideProps {
  currentTaskId: string;
}

const TaskAside: React.FC<TaskAsideProps> = ({ currentTaskId }) => {
  const {
    taskTree,
    selectedTaskId,
    setSelectedTaskId,
    fetchTaskDetail,
    refreshData,
  } = useTaskDetailContext();

  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const { openCreateDrawer } = useTaskDetail();

  // 构建树形数据
  const buildTreeData = (tasks: TaskVo[]) => {
    const convertToTreeNode = (task: TaskVo): any => {
      const children = task.children || [];
      return {
        key: task.id,
        title: (
          <Flex
            align="center"
            justify="space-between"
            gap={8}
            className={styles.treeTitle}
          >
            <span
              className={clsx(
                styles.treeName,
                task.status === TaskStatus.DONE && styles.treeNameDone,
              )}
            >
              {task.name}
            </span>
            <Flex align="center" className={styles.treeTag}>
              {getStatusTag(task.status)}
            </Flex>
          </Flex>
        ),
        children: children.map(convertToTreeNode),
        isLeaf: children.length === 0,
      };
    };

    return tasks.map(convertToTreeNode);
  };

  // 获取状态标签
  const getStatusTag = (status: TaskStatus) => {
    if (!status) {
      return null;
    }
    const statusConfig = {
      [TaskStatus.TODO]: { color: 'gray', text: '待办' },
      [TaskStatus.DOING]: { color: 'blue', text: '进行' },
      [TaskStatus.DONE]: { color: 'green', text: '完成' },
      [TaskStatus.ABANDONED]: { color: 'red', text: '放弃' },
    };

    const config = statusConfig[status];
    return (
      <span
        className={clsx(
          styles.statusTag,
          config.color === 'gray' && styles.statusTodo,
          config.color === 'blue' && styles.statusDoing,
          config.color === 'green' && styles.statusDone,
          config.color === 'red' && styles.statusAbandoned,
        )}
      >
        {config.text}
      </span>
    );
  };

  const treeData = buildTreeData(taskTree);

  // 处理节点选择
  const handleSelect = (selectedKeys: string[]) => {
    if (selectedKeys.length > 0) {
      const taskId = selectedKeys[0];
      setSelectedTaskId(taskId);
      fetchTaskDetail(taskId);
    }
  };

  // 展开当前任务的父链
  React.useEffect(() => {
    if (currentTaskId && taskTree.length > 0) {
      const expandKeys: string[] = [];
      const allTasks: TaskVo[] = [];
      const collect = (tasks: TaskVo[]) => tasks.forEach((task) => {
        allTasks.push(task);
        if (task.children) collect(task.children);
      });
      collect(taskTree);
      const findParentChain = (taskId: string) => {
        const task = allTasks.find((t) => t.id === taskId);
        if (task?.parentId) {
          expandKeys.push(task.parentId);
          findParentChain(task.parentId);
        }
      };
      findParentChain(currentTaskId);
      setExpandedKeys(expandKeys);
    }
  }, [currentTaskId, taskTree]);

  return (
    <Flex vertical className={styles.asideContent}>
      {/* 搜索和操作栏 */}
      <div className={styles.asideToolbar}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          className={styles.createButton}
          onClick={() =>
            openCreateDrawer({
              contentProps: {
                initialFormData: { parentId: selectedTaskId, isSubTask: true },
                afterSubmit: refreshData,
              },
            })
          }
        >
          新建子任务
        </Button>
      </div>

      {/* 任务树 */}
      <div className={styles.treeArea}>
        {treeData.length > 0 ? (
          <Tree
            treeData={treeData}
            selectedKeys={[selectedTaskId]}
            expandedKeys={expandedKeys}
            onSelect={handleSelect}
            onExpand={setExpandedKeys}
            blockNode
            showLine
            className={styles.taskTree}
          />
        ) : (
          <Empty description="暂无任务数据" />
        )}
      </div>
    </Flex>
  );
};

export default TaskAside;
