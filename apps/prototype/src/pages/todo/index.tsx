import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Button, Calendar, Card, Checkbox, DatePicker, Flex, Modal, Select, Space, Table, Tabs, Tag, Tooltip } from '@sue/design-web-react';
import { Ban, Check, Filter, Play, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { DayAgendaCalendar, ExecutionGroupList, formatDayAgendaTitle, PriorityTag, StateTag } from '../../shared/components';
import { productRef } from '../../product-wiki';
import { TODAY } from '../../shared/mock-data';
import type { DrawerState, Goal, Habit, Task, Todo, TodoStatus } from '../../shared/types';
import { canFocusTodo, compareTodoPlan, formatTodoPlan, goalName, groupExecutionItems, statusLabel } from '../../shared/utils';
import styles from './index.module.css';

type Props = {
  todos: Todo[];
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  setDrawer: (drawer: DrawerState) => void;
  completeTodo: (todo: Todo) => void;
  markTodoIncomplete: (todo: Todo) => void;
  abandonTodo: (todo: Todo) => void;
  deleteTodo: (todo: Todo) => void;
  onFocusTodo: (todo: Todo) => void;
};

const todoStatuses: TodoStatus[] = ['todo', 'done', 'abandoned'];

export function TodosPage({
  todos,
  goals,
  tasks,
  habits,
  setDrawer,
  completeTodo,
  markTodoIncomplete,
  abandonTodo,
  deleteTodo,
  onFocusTodo,
}: Props) {
  const [tab, setTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState(() => dayjs(TODAY));
  const [visibleMonth, setVisibleMonth] = useState(() => dayjs(TODAY).startOf('month'));
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [statuses, setStatuses] = useState<TodoStatus[]>([]);
  const [relations, setRelations] = useState<string[]>([]);
  const [filterStart, setFilterStart] = useState<string>();
  const [filterEnd, setFilterEnd] = useState<string>();
  const [selected, setSelected] = useState<string[]>([]);
  const [batchOpen, setBatchOpen] = useState(false);
  const orderedTodos = useMemo(() => [...todos].sort(compareTodoPlan), [todos]);
  const groups = useMemo(
    () =>
      groupExecutionItems(
        orderedTodos,
        'today',
        selectedDate.format('YYYY-MM-DD'),
        (todo) => ({ start: todo.planned, end: todo.planned }),
        { includeOverdue: selectedDate.format('YYYY-MM-DD') === TODAY },
      ),
    [orderedTodos, selectedDate],
  );
  const todosByDate = useMemo(
    () =>
      orderedTodos.reduce<Record<string, Todo[]>>((items, todo) => {
        (items[todo.planned] ||= []).push(todo);
        return items;
      }, {}),
    [orderedTodos],
  );
  const calendarCounts = useMemo(() => {
    const visibleStart = visibleMonth.startOf('month').startOf('week').format('YYYY-MM-DD');
    const visibleEnd = visibleMonth.endOf('month').endOf('week').format('YYYY-MM-DD');
    return orderedTodos.reduce<Record<string, number>>((counts, todo) => {
      if (todo.status === 'done' || todo.status === 'abandoned') return counts;
      if (todo.planned >= visibleStart && todo.planned <= visibleEnd) {
        counts[todo.planned] = (counts[todo.planned] || 0) + 1;
      }
      return counts;
    }, {});
  }, [orderedTodos, visibleMonth]);
  const relationKey = (todo: Todo) =>
    todo.taskId ? `task:${todo.taskId}` : todo.goalId ? `goal:${todo.goalId}` : todo.habitId ? `habit:${todo.habitId}` : 'independent';
  const relationOptions = useMemo(
    () => [
      ...goals.map((goal) => ({ value: `goal:${goal.id}`, label: `目标 · ${goal.title}` })),
      ...tasks.map((task) => ({ value: `task:${task.id}`, label: `任务 · ${task.title}` })),
      ...habits.map((habit) => ({ value: `habit:${habit.id}`, label: `习惯 · ${habit.title}` })),
      { value: 'independent', label: '独立事项' },
    ],
    [goals, habits, tasks],
  );
  const allTodos = useMemo(
    () =>
      orderedTodos.filter(
        (todo) =>
          (!statuses.length || statuses.includes(todo.status)) &&
          (!relations.length || relations.includes(relationKey(todo))) &&
          (!filterStart || todo.planned >= filterStart) &&
          (!filterEnd || todo.planned <= filterEnd),
      ),
    [filterEnd, filterStart, orderedTodos, relations, statuses],
  );
  const hasFilters = Boolean(statuses.length || relations.length || filterStart || filterEnd);
  const clearFilters = () => {
    setStatuses([]);
    setRelations([]);
    setFilterStart(undefined);
    setFilterEnd(undefined);
  };

  const toggleSelected = (id: string, checked: boolean) => {
    setSelected((items) => (checked ? [...items, id] : items.filter((item) => item !== id)));
  };
  const relationName = (todo: Todo) =>
    todo.taskId
      ? tasks.find((task) => task.id === todo.taskId)?.title || '关联任务'
      : todo.goalId
        ? goalName(goals, todo.goalId)
        : todo.habitId
          ? habits.find((habit) => habit.id === todo.habitId)?.title || '关联习惯'
          : '独立待办';
  /** 当前/日历：完成与放弃（或周期未完成），不提供删除 */
  const TodoActions = ({ todo }: { todo: Todo }) =>
    todo.status !== 'done' && todo.status !== 'abandoned' ? (
      <>
        {canFocusTodo(todo) && (
          <Tooltip title="开始专注">
            <Button
              icon={<Play size={15} />}
              size="small"
              aria-label={`为 ${todo.title} 开始专注`}
              onClick={() => onFocusTodo(todo)}
            />
          </Tooltip>
        )}
        <Button icon={<Check size={15} />} size="small" title="完成" aria-label={`完成 ${todo.title}`} onClick={() => completeTodo(todo)} />
        {(todo.habitId || todo.repeat) ? (
          <Button icon={<X size={15} />} size="small" title="标记未完成" aria-label={`标记 ${todo.title} 未完成`} onClick={() => markTodoIncomplete(todo)} />
        ) : (
          <Button icon={<Ban size={15} />} size="small" title="放弃" aria-label={`放弃 ${todo.title}`} onClick={() => abandonTodo(todo)} />
        )}
      </>
    ) : null;
  /** 全部：含删除；重复待办只能在此删除系列定义，已结算历史保留 */
  const confirmDelete = (todo: Todo) => {
    const isRepeatSeries = Boolean(todo.repeat && todo.status !== 'done' && todo.status !== 'abandoned');
    Modal.confirm({
      title: isRepeatSeries ? '删除重复待办' : '删除待办',
      content: isRepeatSeries
        ? '将停止后续重复生成，已完成/已放弃的历史记录会保留。确定删除吗？'
        : '删除后无法恢复，确定删除该待办吗？',
      okText: '删除',
      okButtonProps: { status: 'danger' } as any,
      cancelText: '取消',
      onOk: () => deleteTodo(todo),
    });
  };
  const AllTodoActions = ({ todo }: { todo: Todo }) => (
    <>
      <TodoActions todo={todo} />
      {!(todo.habitId && todo.status !== 'done' && todo.status !== 'abandoned') && (
        <Button
          icon={<Trash2 size={15} />}
          size="small"
          title="删除"
          aria-label={`删除 ${todo.title}`}
          data-product-ref={productRef('growth.todo.rule.delete-boundary')}
          onClick={() => confirmDelete(todo)}
        />
      )}
    </>
  );
  const columns = [
    {
      title: '',
      render: (_: unknown, todo: Todo) => (
        <span>
          <Checkbox checked={selected.includes(todo.id)} onChange={(event) => toggleSelected(todo.id, event.target.checked)} />
        </span>
      ),
    },
    {
      title: '待办',
      render: (_: unknown, todo: Todo) => (
        <span>
          <Button type="link" onClick={() => setDrawer({ kind: 'todo', id: todo.id })}>
            {todo.title}
          </Button>
        </span>
      ),
    },
    {
      title: '关联',
      render: (_: unknown, todo: Todo) => <span data-product-ref={productRef('growth.todo.priority')}>{relationName(todo)}</span>,
    },
    {
      title: '计划时间',
      render: (_: unknown, todo: Todo) => <span data-product-ref={productRef('growth.todo.priority')}>{formatTodoPlan(todo)}</span>,
    },
    {
      title: '优先级',
      render: (_: unknown, todo: Todo) => (
        <span data-product-ref={productRef('growth.todo.priority')}>
          <PriorityTag importance={todo.importance} urgency={todo.urgency} />
        </span>
      ),
    },
    {
      title: '状态',
      render: (_: unknown, todo: Todo) => (
        <Flex gap={8} data-product-ref={todo.repeat ? productRef('growth.todo.rule.repeat-template') : undefined}>
          <StateTag status={todo.status} />
          {todo.repeat && todo.status === 'todo' ? <Tag color="arcoblue">重复</Tag> : null}
          <AllTodoActions todo={todo} />
        </Flex>
      ),
    },
  ];
  const batchDone = () => {
    selected.slice(0, 50).forEach((id) => {
      const todo = todos.find((item) => item.id === id);
      if (todo) completeTodo(todo);
    });
    setSelected([]);
    setBatchOpen(false);
  };

  return (
    <>
      <div data-product-ref={productRef('growth.todo.interaction')}>
        <Card className={styles.todoSurface}>
          <Flex className={styles.todoToolbar} align="center" justify="space-between" gap={12}>
            <Tabs
              activeKey={tab}
              onChange={setTab}
              items={[
                { key: 'today', label: '当前' },
                { key: 'calendar', label: '日历' },
                { key: 'all', label: '全部' },
              ]}
            />
            <Space>
              {tab === 'all' && selected.length > 0 && <Button onClick={() => setBatchOpen(true)}>批量完成 {selected.length}</Button>}
              <Button type="primary" icon={<Plus size={15} />} onClick={() => setDrawer({ kind: 'todo' })}>
                新建待办
              </Button>
            </Space>
          </Flex>

          {tab === 'today' ? (
            <div className={styles.dayAgenda} data-product-ref={productRef('growth.todo.view.today')}>
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
                <div className={styles.executionGroups}>
                  <ExecutionGroupList
                    groups={groups}
                    renderItem={(todo) => (
                      <Flex align="center" className={`${styles.executionItem} ${styles[todo.status]}`} gap={12} key={todo.id}>
                        <span className={styles.statusIndicator} aria-hidden="true" />
                        <Button block className={styles.executionContent} type="text" onClick={() => setDrawer({ kind: 'todo', id: todo.id })}>
                          <Flex align="flex-start" vertical gap={2}>
                            <span className={styles.executionTitle}>{todo.title}</span>
                            <span className={styles.executionMeta}>
                              {relationName(todo)} · 计划 {formatTodoPlan(todo)}
                            </span>
                          </Flex>
                        </Button>
                        <Flex className={styles.executionActions} container="fixed" gap={8}>
                          <PriorityTag importance={todo.importance} urgency={todo.urgency} />
                          <StateTag status={todo.status} />
                          <TodoActions todo={todo} />
                        </Flex>
                      </Flex>
                    )}
                  />
                </div>
              </main>
            </div>
          ) : tab === 'calendar' ? (
            <Calendar
              className={styles.todoCalendar}
              defaultValue={dayjs(TODAY)}
              cellRender={(date, info) => {
                if (info.type !== 'date') return info.originNode;
                const dayTodos = todosByDate[date.format('YYYY-MM-DD')] || [];
                return (
                  <Flex vertical className={styles.calendarCell} gap={3}>
                    {dayTodos.map((todo) => (
                      <Button
                        className={styles.calendarTodo}
                        key={todo.id}
                        size="small"
                        type="text"
                        title={todo.title}
                        onClick={(event) => {
                          event.stopPropagation();
                          setDrawer({ kind: 'todo', id: todo.id });
                        }}
                      >
                        <span className={styles.calendarTodoTitle}>
                          {formatTodoPlan(todo)} {todo.title}
                        </span>
                        <StateTag status={todo.status} />
                      </Button>
                    ))}
                  </Flex>
                );
              }}
            />
          ) : (
            <Flex vertical gap={12} data-product-ref={productRef('growth.todo.view.all')}>
              <Flex className={styles.filterToolbar} align="center" justify="space-between" wrap="wrap" gap={8}>
                <span className={styles.resultCount}>共 {allTodos.length} 项待办</span>
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
                    options={todoStatuses.map((value) => ({ value, label: statusLabel(value) }))}
                    onChange={(value) => setStatuses(value as TodoStatus[])}
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
              {allTodos.length ? (
                <Table rowKey="id" dataSource={allTodos} columns={columns} pagination={false} />
              ) : (
                <Alert type="info" showIcon title="没有匹配的待办" description="调整或清空筛选条件后可查看全部待办。" />
              )}
            </Flex>
          )}
        </Card>
      </div>
      <Modal title="批量完成待办" open={batchOpen} onOk={batchDone} onCancel={() => setBatchOpen(false)} okText="确认完成" cancelText="取消">
        <div data-product-ref={productRef('growth.todo.interaction')}>
          <p>将完成已选择的 {Math.min(selected.length, 50)} 条待办。</p>
        </div>
      </Modal>
    </>
  );
}
