import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Button, Card, Col, DatePicker, Dropdown, Flex, Input, Modal, Row, Select, Space, Statistic, Tabs, Tooltip } from '@sue/design-web-react';
import { Check, ChevronRight, Ellipsis, Plus, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { PriorityTag, StateTag } from '../../shared/components';
import { goalDeleteBlocker } from '../../shared/lifecycle';
import { productRef } from '../../product-wiki';
import { goalTypes } from '../../shared/mock-data';
import type { DrawerState, Goal, GoalStatus, GoalType, Habit, Task, Todo } from '../../shared/types';
import { statusLabel } from '../../shared/utils';
import { GoalManagementHeader } from './GoalManagementHeader';
import styles from './index.module.css';

type Props = {
  goals: Goal[];
  tasks: Task[];
  todos: Todo[];
  habits: Habit[];
  selectedGoal: string;
  setSelectedGoal: (id: string) => void;
  setDrawer: (drawer: DrawerState) => void;
  updateGoal: (id: string, patch: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  onOpenTaskDetail: (id: string) => void;
  onOpenAiDecomposition: () => void;
};
export function GoalsPage({
  goals,
  tasks,
  todos,
  habits,
  selectedGoal,
  setSelectedGoal,
  setDrawer,
  updateGoal,
  deleteGoal,
  onOpenTaskDetail,
  onOpenAiDecomposition,
}: Props) {
  const [keyword, setKeyword] = useState('');
  const [statuses, setStatuses] = useState<GoalStatus[]>([]);
  const [types, setTypes] = useState<GoalType[]>([]);
  const [filterStart, setFilterStart] = useState<string>();
  const [filterEnd, setFilterEnd] = useState<string>();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [undoCompletion, setUndoCompletion] = useState<{ id: string; status: GoalStatus }>();
  const current = goals.find((goal) => goal.id === selectedGoal) || goals[0];
  const children = goals.filter((goal) => goal.parentId === current.id);
  const relatedTasks = tasks.filter((task) => task.goalId === current.id);
  const relatedHabits = habits.filter((habit) => habit.goalIds.includes(current.id));
  const normalizedKeyword = keyword.trim().toLocaleLowerCase();
  const visibleGoalIds = useMemo(() => {
    const goalsById = new Map(goals.map((goal) => [goal.id, goal]));
    const ids = new Set<string>();
    goals
      .filter(
        (goal) =>
          (!normalizedKeyword || goal.title.toLocaleLowerCase().includes(normalizedKeyword)) &&
          (!statuses.length || statuses.includes(goal.status)) &&
          (!types.length || types.includes(goal.type)) &&
          (!filterStart || goal.end >= filterStart) &&
          (!filterEnd || goal.start <= filterEnd)
      )
      .forEach((goal) => {
        let item: Goal | undefined = goal;
        while (item) {
          ids.add(item.id);
          item = item.parentId ? goalsById.get(item.parentId) : undefined;
        }
      });
    return ids;
  }, [filterEnd, filterStart, goals, normalizedKeyword, statuses, types]);
  const hasFilters = Boolean(normalizedKeyword || statuses.length || types.length || filterStart || filterEnd);
  const clearFilters = () => {
    setKeyword('');
    setStatuses([]);
    setTypes([]);
    setFilterStart(undefined);
    setFilterEnd(undefined);
  };
  const relatedImpact = (goal: Goal) => {
    const impacts = [
      goals.filter((item) => item.parentId === goal.id).length && '子目标',
      tasks.filter((item) => item.goalId === goal.id).length && '任务',
      todos.filter((item) => item.goalId === goal.id).length && '待办',
      habits.filter((item) => item.goalIds.includes(goal.id)).length && '习惯',
    ].filter(Boolean);
    return impacts.length ? `关联${impacts.join('、')}的状态不会被自动修改。` : '当前目标没有关联行动。';
  };
  const completeGoal = () => {
    const previousStatus = current.status;
    Modal.confirm({
      title: '标记目标完成',
      content: `完成后将保留关联关系。${relatedImpact(current)}`,
      onOk: () => {
        updateGoal(current.id, { status: 'done', history: [...current.history, '标记目标完成'] });
        setUndoCompletion({ id: current.id, status: previousStatus });
      },
    });
  };
  const abandonGoal = () => Modal.confirm({
    title: '放弃目标',
    content: `放弃后可以通过编辑重新调整。${relatedImpact(current)}`,
    onOk: () => updateGoal(current.id, { status: 'abandoned', history: [...current.history, '放弃目标'] }),
  });
  const requestDelete = () => {
    const blocker = goalDeleteBlocker(current.id, goals, tasks, todos, habits);
    if (blocker) return Modal.warning({ title: '无法删除目标', content: blocker });
    Modal.confirm({ title: '删除目标', content: '删除后无法恢复，是否继续？', okType: 'danger', onOk: () => deleteGoal(current.id) });
  };
  const renderTree = (parentId?: string, depth = 0): React.ReactNode =>
    goals
      .filter((goal) => goal.parentId === parentId && visibleGoalIds.has(goal.id))
      .map((goal) => (
        <div
          key={goal.id}
          className={styles.treeItem}
          style={{ paddingLeft: depth * 16 }}
        >
          <Button
            type="text"
            className={selectedGoal === goal.id ? styles.treeActive : ''}
            onClick={() => setSelectedGoal(goal.id)}
            icon={<ChevronRight size={14} />}
          >
            <span className={styles.treeGoalLabel}>{goal.title}</span>
            <small className={styles.treeTimeRange} data-product-ref={productRef('growth.goal.rule.time-frame')}>
              {`${goal.start} 至 ${goal.end}`}
            </small>
          </Button>
          {renderTree(goal.id, depth + 1)}
        </div>
      ));
  return (
    <>
      <GoalManagementHeader />
      <Row gutter={[16, 16]} align="top">
        <Col xs={24} lg={8}>
          <div data-product-ref={productRef('growth.goal.view.tree')}>
            <Card
              title="目标树"
              extra={
                <Space size={0}>
                  {hasFilters && (
                    <Tooltip title="清空筛选">
                      <Button type="text" size="small" icon={<X size={15} />} aria-label="清空筛选" onClick={clearFilters} />
                    </Tooltip>
                  )}
                  <Tooltip title={filtersExpanded ? '收起筛选' : '展开筛选'}>
                    <Button
                      type={hasFilters ? 'primary' : 'text'}
                      size="small"
                      icon={<SlidersHorizontal size={15} />}
                      aria-label={filtersExpanded ? '收起筛选' : '展开筛选'}
                      aria-expanded={filtersExpanded}
                      onClick={() => setFiltersExpanded((value) => !value)}
                    />
                  </Tooltip>
                  <Tooltip title="新建目标">
                    <Button
                      type="text"
                      size="small"
                      icon={<Plus size={15} />}
                      aria-label="新建目标"
                      onClick={() => setDrawer({ kind: 'goal' })}
                    />
                  </Tooltip>
                </Space>
              }
            >
              <Flex vertical gap={12}>
                {filtersExpanded && (
                  <Flex vertical gap={8}>
                    <Input value={keyword} placeholder="搜索目标名称" allowClear onChange={(event) => setKeyword(event.target.value)} />
                    <Flex wrap gap={8}>
                      <Select
                        mode="multiple"
                        value={statuses}
                        placeholder="全部状态"
                        style={{ minWidth: 132 }}
                        options={['todo', 'doing', 'done', 'abandoned'].map((value) => ({
                          value,
                          label: statusLabel(value),
                        }))}
                        onChange={(value) => setStatuses(value as GoalStatus[])}
                      />
                      <Select
                        mode="multiple"
                        value={types}
                        placeholder="全部类型"
                        style={{ minWidth: 132 }}
                        options={goalTypes}
                        onChange={(value) => setTypes(value as GoalType[])}
                      />
                      <DatePicker
                        allowClear
                        placeholder="开始日期"
                        value={filterStart ? dayjs(filterStart) : undefined}
                        onChange={(date) => setFilterStart(date?.format('YYYY-MM-DD'))}
                      />
                      <DatePicker
                        allowClear
                        placeholder="结束日期"
                        value={filterEnd ? dayjs(filterEnd) : undefined}
                        onChange={(date) => setFilterEnd(date?.format('YYYY-MM-DD'))}
                      />
                    </Flex>
                  </Flex>
                )}
                {visibleGoalIds.size ? renderTree() : <Alert type="info" showIcon title="没有匹配的目标" />}
              </Flex>
            </Card>
          </div>
        </Col>
        <Col xs={24} lg={16}>
          <div data-product-ref={productRef('growth.goal.view.detail')}>
            <Card
              title={current.title}
              extra={<div data-product-ref={productRef('growth.goal.interaction')}><Space>
                <StateTag status={current.status} />
                <Dropdown placement="bottomRight" trigger={['click']} menu={{ items: [
                  { key: 'edit', label: '编辑', onClick: () => setDrawer({ kind: 'goal', id: current.id }) },
                  { key: 'abandon', label: '放弃', disabled: current.status === 'abandoned', onClick: abandonGoal },
                  { key: 'delete', label: '删除', danger: true, onClick: requestDelete },
                ] }}>
                  <Button type="text" icon={<Ellipsis size={17} />} aria-label="目标更多操作" />
                </Dropdown>
                {current.status === 'done' || current.status === 'abandoned'
                  ? <Button type="primary" onClick={() => updateGoal(current.id, { status: 'todo' })}>恢复目标</Button>
                  : <Button type="primary" icon={<Check size={15} />} onClick={completeGoal}>标记完成</Button>}
              </Space></div>}
            >
              <Flex vertical gap={16}>
                {undoCompletion?.id === current.id && <Alert type="success" showIcon title="目标已标记完成" description="如状态调整有误，可立即撤销本次完成操作。" action={<Button size="small" onClick={() => { updateGoal(undoCompletion.id, { status: undoCompletion.status }); setUndoCompletion(undefined); }}>撤销</Button>} />}
                <div>
                  <Tabs
                    items={[
                      {
                        key: 'overview',
                        label: '概览',
                        children: <Flex vertical gap={16}>
                          <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
                            <Space><PriorityTag importance={current.importance} /><small className={styles.timeRange} data-product-ref={productRef('growth.goal.rule.time-frame')}>{`时间范围：${current.start} 至 ${current.end}`}</small></Space>
                            <Button
                              icon={<Sparkles size={15} />}
                              data-product-ref={productRef('growth.goal.view.ai-decomposition')}
                              onClick={onOpenAiDecomposition}
                            >
                              AI 拆解
                            </Button>
                          </Flex>
                          <p className={styles.goalDescription}>{current.description}</p>
                          <Row gutter={[16, 16]}>
                            <Col span={12}><Statistic title="关联任务" value={relatedTasks.length} suffix="项" /></Col>
                            <Col span={12}><Statistic title="关联习惯" value={relatedHabits.length} suffix="项" /></Col>
                          </Row>
                        </Flex>,
                      },
                      {
                        key: 'children',
                        label: `子目标 ${children.length}`,
                        children: <RelationList items={children} empty="暂无子目标" />,
                      },
                      {
                        key: 'tasks',
                        label: `关联任务 ${relatedTasks.length}`,
                        children: <RelationList items={relatedTasks} empty="暂无关联任务" onOpen={onOpenTaskDetail} />,
                      },
                    ]}
                  />
                </div>
              </Flex>
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
}
function RelationList({
  items,
  empty,
  onOpen,
}: {
  items: Array<{ id: string; title: string; status?: string }>;
  empty: string;
  onOpen?: (id: string) => void;
}) {
  return items.length ? (
    <div className={styles.relationList}>
      {items.map((item) => (
        <Flex justify="space-between" align="center" key={item.id}>
          {onOpen ? <Button type="link" className={styles.relationButton} onClick={() => onOpen(item.id)}>{item.title}</Button> : <b>{item.title}</b>}
          {item.status && <StateTag status={item.status} />}
        </Flex>
      ))}
    </div>
  ) : (
    <Alert type="info" showIcon title={empty} />
  );
}
