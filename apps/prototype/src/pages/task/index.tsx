import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Button, Calendar, Card, DatePicker, Flex, Select, Space, Table, Tabs, Tooltip } from '@sue/design-web-react';
import { Check, Filter, Play, Plus, RotateCcw } from 'lucide-react';
import { DayAgendaCalendar, ExecutionGroupList, formatDayAgendaTitle, PriorityTag, StateTag } from '../../shared/components';
import { productRef } from '../../product-wiki';
import { TODAY } from '../../shared/mock-data';
import type { DrawerState, Goal, Task, TaskStatus } from '../../shared/types';
import { addDays, goalName, groupExecutionItems, statusLabel } from '../../shared/utils';
import styles from './index.module.css';

type Props = {
  tasks: Task[];
  goals: Goal[];
  setDrawer: (drawer: DrawerState) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  onFocusTask: (task: Task) => void;
  onOpenTaskDetail: (id: string) => void;
};

const taskStatuses: TaskStatus[] = ['todo', 'doing', 'done', 'abandoned'];

export function TasksPage({ tasks, goals, setDrawer, updateTask, onFocusTask, onOpenTaskDetail }: Props) {
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(() => dayjs(TODAY));
  const [visibleMonth, setVisibleMonth] = useState(() => dayjs(TODAY).startOf('month'));
  const [hoveredCalendarDate, setHoveredCalendarDate] = useState<string>();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [relations, setRelations] = useState<string[]>([]);
  const [filterStart, setFilterStart] = useState<string>();
  const [filterEnd, setFilterEnd] = useState<string>();
  const relationName = (task: Task) => {
    if (task.parentId) return tasks.find((item) => item.id === task.parentId)?.title || '关联任务';
    return goalName(goals, task.goalId);
  };
  const relationKey = (task: Task) => (task.parentId ? `task:${task.parentId}` : task.goalId ? `goal:${task.goalId}` : 'independent');
  const relationOptions = useMemo(
    () => [
      ...goals.map((goal) => ({ value: `goal:${goal.id}`, label: `目标 · ${goal.title}` })),
      ...tasks.map((task) => ({ value: `task:${task.id}`, label: `父任务 · ${task.title}` })),
      { value: 'independent', label: '独立事项' },
    ],
    [goals, tasks],
  );
  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (!statuses.length || statuses.includes(task.status)) &&
          (!relations.length || relations.includes(relationKey(task))) &&
          (!filterStart || task.plannedEnd >= filterStart) &&
          (!filterEnd || task.plannedStart <= filterEnd),
      ),
    [filterEnd, filterStart, relations, statuses, tasks],
  );
  const tasksByDate = useMemo(
    () =>
      tasks.reduce<Record<string, Task[]>>((items, task) => {
        plannedDates(task).forEach((date) => (items[date] ||= []).push(task));
        return items;
      }, {}),
    [tasks],
  );
  const calendarCounts = useMemo(() => {
    const visibleStart = visibleMonth.startOf('month').startOf('week');
    const visibleEnd = visibleMonth.endOf('month').endOf('week');
    const counts: Record<string, number> = {};
    tasks.forEach((task) => {
      if (task.status === 'done' || task.status === 'abandoned') return;
      plannedDates(task).forEach((date) => {
        if (date >= visibleStart.format('YYYY-MM-DD') && date <= visibleEnd.format('YYYY-MM-DD')) {
          counts[date] = (counts[date] || 0) + 1;
        }
      });
    });
    return counts;
  }, [tasks, visibleMonth]);
  const hasFilters = Boolean(statuses.length || relations.length || filterStart || filterEnd);
  const clearFilters = () => {
    setStatuses([]);
    setRelations([]);
    setFilterStart(undefined);
    setFilterEnd(undefined);
  };
  const columns = [
    {
      title: '任务',
      dataIndex: 'title',
      render: (title: string, task: Task) => (
        <Button className={styles.tableTitle} type="link" onClick={() => onOpenTaskDetail(task.id)}>
          {title}
        </Button>
      ),
    },
    {
      title: '归属',
      render: (_: unknown, task: Task) => <span data-product-ref={productRef('growth.task.rule.single-parent')}>{relationName(task)}</span>,
    },
    {
      title: '计划时间',
      render: (_: unknown, task: Task) => `${task.plannedStart} - ${task.plannedEnd}`,
    },
    {
      title: '预计耗时 / 实际耗时',
      render: (_: unknown, task: Task) => <span data-product-ref={productRef('growth.track-time.overview')}>{`${task.estimated}h / ${task.actual}h`}</span>,
    },
    {
      title: '状态',
      render: (_: unknown, task: Task) => (
        <Select
          size="small"
          value={task.status}
          className={styles.statusSelect}
          options={taskStatuses.map((value) => ({ value, label: statusLabel(value) }))}
          onChange={(value) => updateTask(task.id, { status: value as TaskStatus })}
        />
      ),
    },
    {
      title: '操作',
      render: (_: unknown, task: Task) =>
        task.status !== 'done' && task.status !== 'abandoned' ? (
          <Tooltip title="开始专注">
            <Button type="text" size="small" icon={<Play size={15} />} aria-label={`为${task.title}开始专注`} onClick={() => onFocusTask(task)} />
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <Card className={styles.taskSurface} data-product-ref={productRef('growth.task.interaction')}>
      <Flex className={styles.taskToolbar} align="center" justify="space-between">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className={styles.taskTabs}
          items={[
            { key: 'today', label: '当前' },
            { key: 'calendar', label: '日历' },
            { key: 'all', label: '全部' },
          ]}
        />
        <Button type="primary" icon={<Plus size={15} />} onClick={() => setDrawer({ kind: 'task' })}>
          新建任务
        </Button>
      </Flex>

      {activeTab === 'today' ? (
        <div className={styles.dayAgenda} data-product-ref={productRef('growth.task.view.today')}>
          <aside className={styles.dayAgendaSidebar}>
            <DayAgendaCalendar
              value={selectedDate}
              onChange={setSelectedDate}
              visibleMonth={visibleMonth}
              onVisibleMonthChange={setVisibleMonth}
              itemCounts={calendarCounts}
            />
          </aside>
          <main className={styles.dayAgendaMain}>
            <header className={styles.dayAgendaToolbar}>
              <h2 className={styles.dayAgendaTitle}>{formatDayAgendaTitle(selectedDate)}</h2>
            </header>
            <TaskExecutionList
              date={selectedDate.format('YYYY-MM-DD')}
              tasks={tasks}
              relationName={relationName}
              onOpenTaskDetail={onOpenTaskDetail}
              updateTask={updateTask}
              onFocusTask={onFocusTask}
            />
          </main>
        </div>
      ) : activeTab === 'calendar' ? (
        <Calendar
          className={styles.taskCalendar}
          defaultValue={dayjs(TODAY)}
          cellRender={(date, info) => {
            if (info.type !== 'date') return info.originNode;
            const dateKey = date.format('YYYY-MM-DD');
            const dayTasks = tasksByDate[dateKey] || [];
            return (
              <Flex
                vertical
                className={styles.calendarCell}
                gap={3}
                onMouseEnter={() => setHoveredCalendarDate(dateKey)}
                onMouseLeave={() => setHoveredCalendarDate(undefined)}
              >
                {dayTasks.map((task) => (
                  <Button
                    className={`${styles.calendarTask} ${styles[task.status]}`}
                    key={task.id}
                    size="small"
                    type="text"
                    title={task.title}
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenTaskDetail(task.id);
                    }}
                  >
                    <span className={styles.calendarTaskTitle}>{task.title}</span>
                    <StateTag status={task.status} />
                  </Button>
                ))}
                {hoveredCalendarDate === dateKey && (
                  <Button
                    className={styles.calendarAdd}
                    size="small"
                    type="text"
                    icon={<Plus size={12} />}
                    onClick={(event) => {
                      event.stopPropagation();
                      setDrawer({ kind: 'task', plannedStart: dateKey, plannedEnd: dateKey });
                    }}
                  >
                    添加任务
                  </Button>
                )}
              </Flex>
            );
          }}
        />
      ) : (
        <Flex vertical gap={12} data-product-ref={productRef('growth.task.view.all')}>
          <Flex className={styles.filterToolbar} align="center" justify="space-between" wrap="wrap" gap={8}>
            <span className={styles.resultCount}>共 {filteredTasks.length} 项任务</span>
            <Space size={4}>
              {hasFilters && (
                <Tooltip title="清空筛选">
                  <Button type="text" size="small" icon={<RotateCcw size={15} />} aria-label="清空筛选" onClick={clearFilters} />
                </Tooltip>
              )}
              <Tooltip title={filtersExpanded ? '收起筛选' : '展开筛选'}>
                <Button
                  type={hasFilters ? 'primary' : 'text'}
                  size="small"
                  icon={<Filter size={15} />}
                  aria-label={filtersExpanded ? '收起筛选' : '展开筛选'}
                  aria-expanded={filtersExpanded}
                  onClick={() => setFiltersExpanded((value) => !value)}
                />
              </Tooltip>
            </Space>
          </Flex>
          {filtersExpanded && (
            <Flex className={styles.filterFields} wrap="wrap" gap={8}>
              <Select
                mode="multiple"
                value={statuses}
                placeholder="全部状态"
                className={styles.filterControl}
                options={taskStatuses.map((value) => ({ value, label: statusLabel(value) }))}
                onChange={(value) => setStatuses(value as TaskStatus[])}
              />
              <Select
                mode="multiple"
                value={relations}
                placeholder="全部归属"
                className={styles.relationFilter}
                options={relationOptions}
                onChange={(value) => setRelations(value as string[])}
              />
              <DatePicker
                allowClear
                placeholder="计划开始日期"
                value={filterStart ? dayjs(filterStart) : undefined}
                onChange={(date) => setFilterStart(date?.format('YYYY-MM-DD'))}
              />
              <DatePicker
                allowClear
                placeholder="计划结束日期"
                value={filterEnd ? dayjs(filterEnd) : undefined}
                onChange={(date) => setFilterEnd(date?.format('YYYY-MM-DD'))}
              />
            </Flex>
          )}
          {filteredTasks.length ? (
            <Table rowKey="id" dataSource={filteredTasks} columns={columns} pagination={false} />
          ) : (
            <Alert type="info" showIcon title="没有匹配的任务" description="调整或清空筛选条件后可查看全部任务。" />
          )}
        </Flex>
      )}
    </Card>
  );
}

function TaskExecutionList({
  date,
  tasks,
  relationName,
  onOpenTaskDetail,
  updateTask,
  onFocusTask,
}: {
  date: string;
  tasks: Task[];
  relationName: (task: Task) => string;
  onOpenTaskDetail: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  onFocusTask: (task: Task) => void;
}) {
  const groups = groupExecutionItems(tasks, 'today', date, (task) => ({ start: task.plannedStart, end: task.plannedEnd }), {
    includeOverdue: date === TODAY,
  });
  return (
    <div className={styles.executionGroups}>
      <ExecutionGroupList
        groups={groups}
        renderItem={(task) => (
          <Flex align="center" className={`${styles.executionItem} ${styles[task.status]}`} gap={12} key={task.id}>
            <span className={styles.statusIndicator} aria-hidden="true" />
            <Button block className={styles.executionContent} type="text" onClick={() => onOpenTaskDetail(task.id)}>
              <Flex align="flex-start" vertical gap={2}>
                <span className={styles.executionTitle}>{task.title}</span>
                <span className={styles.executionMeta}>
                  {relationName(task)} · {task.plannedStart} - {task.plannedEnd} · 预计耗时 {task.estimated}h / 实际耗时 {task.actual}h
                </span>
              </Flex>
            </Button>
            <Flex className={styles.executionActions} container="fixed" gap={8}>
              <PriorityTag importance={task.importance} />
              <StateTag status={task.status} />
              {task.status !== 'done' && task.status !== 'abandoned' && (
                <Tooltip title="开始专注">
                  <Button icon={<Play size={15} />} size="small" aria-label={`为${task.title}开始专注`} onClick={() => onFocusTask(task)} />
                </Tooltip>
              )}
              {task.status !== 'done' && task.status !== 'abandoned' && (
                <Button icon={<Check size={15} />} size="small" title="完成" aria-label={`完成 ${task.title}`} onClick={() => updateTask(task.id, { status: 'done' })} />
              )}
            </Flex>
          </Flex>
        )}
      />
    </div>
  );
}

function plannedDates(task: Task) {
  const dates = [];
  for (let date = task.plannedStart; date <= task.plannedEnd; date = addDays(date, 1)) dates.push(date);
  return dates;
}
