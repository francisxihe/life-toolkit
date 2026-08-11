import { Alert, Button, Card, Descriptions, Dropdown, Flex, Modal, Space, Tabs } from '@sue/design-web-react';
import { Check, Ellipsis, RotateCcw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { productRef } from '../../../product-wiki';
import { PriorityTag, StateTag } from '../../../shared/components';
import { taskDeleteBlocker, taskRootSubtree, validateTaskHierarchy } from '../../../shared/lifecycle';
import type { Task, TaskStatus } from '../../../shared/types';
import { goalName } from '../../../shared/utils';
import { TaskTree } from '../components/TaskTree';
import { useTaskDetailContext } from '../context';
import styles from '../style.module.css';

export function TaskDetailLayout() {
  const context = useTaskDetailContext();
  const {
    currentTask,
    tasks,
    todos,
    goals,
    setSelectedTaskId,
    updateTask,
    createTask,
    deleteTask,
    setDrawer,
    onFocusTask,
    onClose,
    notify,
    onOpenAiDecomposition,
  } = context;
  const [creatingChild, setCreatingChild] = useState(false);
  const [childTitle, setChildTitle] = useState('');
  const [childError, setChildError] = useState('');
  const relatedTodos = todos.filter((todo) => todo.taskId === currentTask.id);
  const relatedTreeTasks = taskRootSubtree(currentTask.id, tasks);
  const updateStatus = (status: TaskStatus) => {
    updateTask(currentTask.id, { status });
    notify(status === 'done' ? '任务已标记完成' : status === 'abandoned' ? '任务已放弃' : '任务已恢复');
  };
  const cancelCreateChild = () => {
    setCreatingChild(false);
    setChildTitle('');
    setChildError('');
  };
  const createChild = (): boolean => {
    const task: Task = {
      id: `t${Date.now()}`,
      title: childTitle.trim(),
      description: '',
      parentId: currentTask.id,
      status: 'todo',
      importance: currentTask.importance,
      difficulty: currentTask.difficulty,
      plannedStart: currentTask.plannedStart,
      plannedEnd: currentTask.plannedEnd,
      start: currentTask.start,
      end: currentTask.end,
      estimated: 1,
      actual: 0,
    };
    if (!task.title) {
      setChildError('请输入子任务名称');
      return false;
    }
    const validation = validateTaskHierarchy(task, goals, tasks);
    if (validation) {
      setChildError(validation);
      return false;
    }
    createTask(task);
    cancelCreateChild();
    notify('已创建子任务');
    return true;
  };
  const requestDelete = () => {
    const blocker = taskDeleteBlocker(currentTask.id, tasks, todos);
    if (blocker) return Modal.warning({ title: '无法删除任务', content: blocker });
    Modal.confirm({ title: '删除任务', content: '删除后无法恢复，是否继续？', okType: 'danger', onOk: () => { deleteTask(currentTask.id); notify('任务已删除'); onClose(); } });
  };
  const primary = currentTask.status === 'done' || currentTask.status === 'abandoned'
    ? <Button type="primary" icon={<RotateCcw size={15} />} onClick={() => updateStatus('todo')}>恢复任务</Button>
    : <Button type="primary" icon={<Check size={15} />} onClick={() => updateStatus('done')}>标记完成</Button>;
  return (
    <Flex className={styles.detailShell} container="full">
      <TaskTree
        tasks={relatedTreeTasks}
        selectedTaskId={currentTask.id}
        onSelect={(id) => { cancelCreateChild(); setSelectedTaskId(id); }}
        creatingChild={creatingChild}
        childTitle={childTitle}
        childError={childError}
        onStartCreateChild={() => { setChildError(''); setCreatingChild(true); }}
        onChildTitleChange={(title) => { setChildTitle(title); if (childError) setChildError(''); }}
        onCreateChild={createChild}
        onCancelCreateChild={cancelCreateChild}
      />
      <Flex vertical className={styles.detailMain} container="fill">
        <Flex className={styles.detailHeader} align="center" justify="space-between">
          <h2>{currentTask.title}</h2>
          <Space>
            <StateTag status={currentTask.status} />
            <Button
              icon={<Sparkles size={15} />}
              data-product-ref={productRef('growth.task.view.ai-decomposition')}
              onClick={onOpenAiDecomposition}
            >
              AI 拆解
            </Button>
            <Dropdown
              placement="bottomRight"
              trigger={['click']}
              menu={{
                items: [
                  { key: 'edit', label: '编辑', onClick: () => setDrawer({ kind: 'task', id: currentTask.id }) },
                  {
                    key: 'abandon',
                    label: '放弃',
                    disabled: currentTask.status === 'abandoned',
                    onClick: () =>
                      Modal.confirm({
                        title: '放弃任务',
                        content: '放弃后可通过恢复任务重新激活。',
                        onOk: () => updateStatus('abandoned'),
                      }),
                  },
                  { key: 'delete', label: '删除', danger: true, onClick: requestDelete },
                ],
              }}
            >
              <Button type="text" aria-label="任务更多操作" icon={<Ellipsis size={17} />} />
            </Dropdown>
            {primary}
          </Space>
        </Flex>
        <Tabs className={styles.detailTabs} items={[
          { key: 'overview', label: '概览', children: <Overview task={currentTask} goals={goals} /> },
          { key: 'todos', label: `关联 Todo ${relatedTodos.length}`, children: <div className={styles.tabBody}>{relatedTodos.length ? <div className={styles.rows}>{relatedTodos.map((todo) => <Flex className={styles.row} key={todo.id} align="center" justify="space-between"><span>{todo.title}</span><Button type="link" onClick={() => setDrawer({ kind: 'todo', id: todo.id })}>查看</Button></Flex>)}</div> : <Alert type="info" showIcon title="暂无关联待办" />}</div> },
          { key: 'tracktime', label: 'TrackTime', children: <div className={styles.tabBody}><Alert type="info" showIcon title="TrackTime 暂不自动计时" description="可跳转至专注计时器手动开始记录。" action={<Button type="primary" onClick={() => onFocusTask(currentTask)}>打开计时器</Button>} /></div> },
        ]} />
      </Flex>
    </Flex>
  );
}

function Overview({ task, goals }: { task: Task; goals: ReturnType<typeof useTaskDetailContext>['goals'] }) {
  return <div className={styles.tabBody}><Card size="small"><Descriptions column={2} items={[
    { key: 'status', label: '状态', children: <StateTag status={task.status} /> },
    { key: 'goal', label: '关联目标', children: goalName(goals, task.goalId) },
    { key: 'range', label: '计划范围', children: `${task.start} 至 ${task.end}` },
    { key: 'hours', label: '预计 / 实际耗时', children: `${task.estimated}h / ${task.actual}h` },
    { key: 'priority', label: '重要度', span: 2, children: <PriorityTag importance={task.importance} /> },
    { key: 'description', label: '描述', span: 2, children: task.description || '暂无描述' },
  ]} /></Card></div>;
}
