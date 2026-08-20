import { useRef, useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import {
  Alert,
  Button,
  Col,
  DatePicker,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Slider,
  Switch,
  Tag,
  TimePicker,
} from '@sue/design-web-react';
import { createDefaultRepeatSetting, RepeatSelector, type RepeatSelectorValue } from '@true-north/components-repeat';
import { RepeatMode } from '@true-north/components-repeat/types';
import { goalTypes, NEXT_DAY, TODAY } from '../mock-data';
import { productRef } from '../../product-wiki';
import type {
  DrawerKind,
  DrawerState,
  FocusSession,
  Goal,
  GoalStatus,
  Habit,
  SaveEntity,
  Task,
  TaskStatus,
  Todo,
  TodoStatus,
} from '../types';
import { asTodoRepeat } from '../repeat';
import { validateGoalHierarchy, validateTaskHierarchy } from '../lifecycle';
import { canFocusTodo, isTodoPlanRange, statusLabel } from '../utils';
import { drawerPaddedBodyStyles } from '../drawerStyles';
import styles from './EntityDrawer.module.css';

type Props = {
  drawer: NonNullable<DrawerState>;
  goals: Goal[];
  tasks: Task[];
  todos: Todo[];
  habits: Habit[];
  sessions: FocusSession[];
  onClose: () => void;
  onSave: SaveEntity;
  onFocusTask: (task: Task) => void;
  onFocusTodo: (todo: Todo) => void;
};

export function EntityDrawer({
  drawer,
  goals,
  tasks,
  todos,
  habits,
  sessions,
  onClose,
  onSave,
  onFocusTask,
  onFocusTodo,
}: Props) {
  const existing =
    drawer.kind === 'goal'
      ? goals.find((item) => item.id === drawer.id)
      : drawer.kind === 'task'
        ? tasks.find((item) => item.id === drawer.id)
        : drawer.kind === 'todo'
          ? todos.find((item) => item.id === drawer.id)
          : habits.find((item) => item.id === drawer.id);
  const [draft, setDraft] = useState<Goal | Task | Todo | Habit>(() => existing || createDraft(drawer.kind, goals, drawer));
  const [error, setError] = useState('');
  const [repeatError, setRepeatError] = useState('');
  const patch = (value: Partial<typeof draft>) => setDraft((current) => ({ ...current, ...value }) as typeof draft);
  const submit = () => {
    if (repeatError) return setError(repeatError);
    const entity = !existing && drawer.kind === 'task' ? ({ ...draft, status: 'todo' } as Task) : draft;
    const validation = validateDraft(drawer.kind, entity, goals, tasks);
    if (validation) return setError(validation);
    onSave(drawer.kind, entity);
  };
  const name = ({ goal: '目标', task: '任务', todo: '待办', habit: '习惯' } as Record<DrawerKind, string>)[drawer.kind];
  const productReference = {
    goal: productRef('growth.goal.interaction'),
    task: productRef('growth.task.rule.single-parent'),
    todo: productRef('growth.todo.interaction'),
    habit: productRef('growth.habit.rules'),
  }[drawer.kind];
  return (
    <Drawer
      open
      title={<span data-product-ref={productReference}>{`${existing ? '编辑' : '新建'}${name}`}</span>}
      onClose={onClose}
      size="large"
      destroyOnHidden
      styles={drawerPaddedBodyStyles}
      extra={
        <div data-product-ref={productReference}>
          <Button type="primary" onClick={submit}>
            保存
          </Button>
        </div>
      }
    >
      <div data-product-ref={productReference}>
        <Form layout="vertical" className={styles.entityForm}>
          <Form.Item label={`${name}名称`} required>
            <Input
              value={draft.title}
              onChange={(event) => patch({ title: event.target.value })}
              placeholder={`输入${name}名称`}
            />
          </Form.Item>
          {drawer.kind === 'goal' && <GoalFields draft={draft as Goal} patch={patch} goals={goals} />}
          {drawer.kind === 'task' && (
            <TaskFields
              draft={draft as Task}
              patch={patch}
              goals={goals}
              tasks={tasks}
              isNew={!existing}
              onFocusTask={onFocusTask}
            />
          )}
          {drawer.kind === 'todo' && (
            <TodoFields
              draft={draft as Todo}
              patch={patch}
              goals={goals}
              tasks={tasks}
              habits={habits}
              isNew={!existing}
              sessions={sessions}
              onRepeatInvalid={setRepeatError}
              onFocusTodo={onFocusTodo}
            />
          )}
          {drawer.kind === 'habit' && (
            <HabitFields draft={draft as Habit} patch={patch} goals={goals} onRepeatInvalid={setRepeatError} />
          )}
          {error && <Alert type="error" showIcon title={error} />}
        </Form>
      </div>
    </Drawer>
  );
}

function createDraft(kind: DrawerKind, goals: Goal[], drawer?: NonNullable<DrawerState>): Goal | Task | Todo | Habit {
  const id = `${kind[0]}${Date.now()}`;
  if (kind === 'goal')
    return {
      id,
      title: '',
      description: '',
      type: 'vision',
      status: 'todo',
      importance: 3,
      difficulty: 2,
      start: TODAY,
      end: '2026-12-31',
      history: ['刚刚创建'],
    };
  if (kind === 'task')
    return {
      id,
      title: '',
      description: '',
      goalId: goals[0]?.id,
      status: 'todo',
      importance: 3,
      difficulty: 2,
      start: drawer?.plannedStart || TODAY,
      end: drawer?.plannedEnd || NEXT_DAY,
      plannedStart: drawer?.plannedStart || TODAY,
      plannedEnd: drawer?.plannedEnd || drawer?.plannedStart || TODAY,
      estimated: 1,
      actual: 0,
    };
  if (kind === 'todo')
    return {
      id,
      title: '',
      description: '',
      status: 'todo',
      importance: 3,
      urgency: 3,
      planned: drawer?.planned || drawer?.plannedStart || TODAY,
      plannedStartTime: '09:00',
      plannedEndTime: '09:00',
      history: ['刚刚创建'],
    };
  return {
    id,
    title: '',
    goalIds: goals.length ? [goals[0].id] : [],
    status: 'active',
    importance: 3,
    difficulty: 2,
    repeat: createDefaultRepeatSetting(TODAY),
    streak: 0,
    longest: 0,
    logs: [],
  };
}
function validateDraft(kind: DrawerKind, draft: Goal | Task | Todo | Habit, goals: Goal[], tasks: Task[]) {
  if (!draft.title.trim()) return '请输入名称';
  if (kind === 'goal') {
    return validateGoalHierarchy(draft as Goal, goals);
  }
  if (kind === 'task') {
    return validateTaskHierarchy(draft as Task, goals, tasks);
  }
  if (kind === 'todo') {
    const item = draft as Todo;
    if (!item.plannedStartTime || !item.plannedEndTime || item.plannedStartTime > item.plannedEndTime)
      return '计划结束时间不能早于开始时间';
    const sourceCount = [item.taskId, item.goalId, item.habitId].filter(Boolean).length;
    if (sourceCount > 1) return '系统待办只能关联一个来源';
    const parent = item.taskId
      ? tasks.find((task) => task.id === item.taskId)
      : goals.find((goal) => goal.id === item.goalId);
    if (parent && (item.planned < parent.start || item.planned > parent.end || item.importance > parent.importance))
      return '待办的时间和重要度必须继承关联上游';
  }
  if (kind === 'habit') {
    const item = draft as Habit;
    if (!item.goalIds.length) return '习惯至少需要关联一个目标';
    const related = goals.filter((goal) => item.goalIds.includes(goal.id));
    if (related.some((goal) => item.difficulty > goal.difficulty)) return '习惯难度不能高于任一关联目标';
    if (item.repeat.repeatMode === RepeatMode.NONE) return '习惯必须设置重复规则';
  }
  return undefined;
}
function ImportanceControl({
  value,
  onChange,
  label = '重要程度',
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
}) {
  return (
    <Form.Item label={label}>
      <Slider
        min={1}
        max={5}
        value={value}
        marks={{ 1: '1', 3: '3', 5: '5' }}
        onChange={(value) => onChange(Number(value))}
      />
      <small className={styles.formHint}>当前值：{value}</small>
    </Form.Item>
  );
}
function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <Form.Item label={label}>
      <DatePicker
        value={dayjs(value)}
        style={{ width: '100%' }}
        onChange={(date) => date && onChange(date.format('YYYY-MM-DD'))}
      />
    </Form.Item>
  );
}
function timeOf(value: string): Dayjs {
  const [hour, minute] = value.split(':').map(Number);
  return dayjs().hour(hour).minute(minute).second(0);
}
function toTimeMinutes(value: string): number {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}
function timeFromMinutes(value: number): string {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
function defaultTimeRange(point: string) {
  const latest = 23 * 60 + 55;
  const start = toTimeMinutes(point);
  const end = Math.min(start + 60, latest);
  if (end > start) return { start: point, end: timeFromMinutes(end) };
  return { start: timeFromMinutes(latest - 60), end: timeFromMinutes(latest) };
}
function PlannedTimeField({
  start,
  end,
  onChange,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}) {
  const isRange = start !== end;
  return (
    <Form.Item label="计划时间" required>
      <Flex vertical gap={8}>
        <Radio.Group
          optionType="button"
          value={isRange ? 'range' : 'point'}
          onChange={(event) => {
            if (event.target.value === 'point') return onChange(start, start);
            const range = defaultTimeRange(start);
            onChange(range.start, range.end);
          }}
        >
          <Radio value="point">时间点</Radio>
          <Radio value="range">时间范围</Radio>
        </Radio.Group>
        {isRange ? (
          <TimePicker.RangePicker
            allowClear={false}
            format="HH:mm"
            minuteStep={5}
            value={[timeOf(start), timeOf(end)]}
            style={{ width: '100%' }}
            onChange={(range) => {
              if (!range?.[0] || !range[1]) return;
              const nextStart = range[0].format('HH:mm');
              const nextEnd = range[1].format('HH:mm');
              if (nextStart < nextEnd) onChange(nextStart, nextEnd);
            }}
          />
        ) : (
          <TimePicker
            allowClear={false}
            format="HH:mm"
            minuteStep={5}
            value={timeOf(start)}
            style={{ width: '100%' }}
            onChange={(time) => {
              if (!time) return;
              const point = time.format('HH:mm');
              onChange(point, point);
            }}
          />
        )}
      </Flex>
    </Form.Item>
  );
}
function GoalFields({ draft, patch, goals }: { draft: Goal; patch: (value: Partial<Goal>) => void; goals: Goal[] }) {
  const parent = goals.find((goal) => goal.id === draft.parentId);
  const availableTypes = parent
    ? parent.type === 'result'
      ? goalTypes.filter((type) => type.value === 'result')
      : goalTypes
    : goalTypes.filter((type) => type.value === 'vision');
  const updateParent = (parentId?: string) => {
    const nextParent = goals.find((goal) => goal.id === parentId);
    if (!nextParent) return patch({ parentId: undefined, type: 'vision' });
    patch(nextParent.type === 'result' ? { parentId, type: 'result' } : { parentId });
  };
  const typeRuleReference = productRef('growth.goal.rule.type');
  const timeFrameReference = productRef('growth.goal.rule.time-frame');
  return (
    <>
      <div data-product-ref={typeRuleReference}>
        <Form.Item label="父级目标">
          <Select
            allowClear
            value={draft.parentId}
            options={goals
              .filter((goal) => goal.id !== draft.id)
              .map((goal) => ({ value: goal.id, label: goal.title }))}
            onChange={(value) => updateParent(value as string | undefined)}
          />
        </Form.Item>
        <Form.Item label="目标类型" required>
          <Radio.Group value={draft.type} onChange={(event) => patch({ type: event.target.value })}>
            {availableTypes.map((type) => (
              <Radio key={type.value} value={type.value}>
                {type.label}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      </div>
      <Row gutter={12}>
        <Col span={12}>
          <ImportanceControl value={draft.importance} onChange={(importance) => patch({ importance })} />
        </Col>
        <Col span={12}>
          <ImportanceControl
            label="完成难度"
            value={draft.difficulty}
            onChange={(difficulty) => patch({ difficulty })}
          />
        </Col>
        <Col span={12}>
          <div data-product-ref={timeFrameReference}>
            <DateField label="开始日期" value={draft.start} onChange={(start) => patch({ start })} />
          </div>
        </Col>
        <Col span={12}>
          <div data-product-ref={timeFrameReference}>
            <DateField label="结束日期" value={draft.end} onChange={(end) => patch({ end })} />
          </div>
        </Col>
      </Row>
      <Form.Item label="状态">
        <Select
          value={draft.status}
          options={['todo', 'doing', 'done', 'abandoned'].map((value) => ({
            value,
            label: statusLabel(value),
          }))}
          onChange={(value) => patch({ status: value as GoalStatus })}
        />
      </Form.Item>
      <Form.Item label="描述">
        <Input.TextArea value={draft.description} onChange={(event) => patch({ description: event.target.value })} />
      </Form.Item>
    </>
  );
}
function TaskFields({
  draft,
  patch,
  goals,
  tasks,
  isNew,
  onFocusTask,
}: {
  draft: Task;
  patch: (value: Partial<Task>) => void;
  goals: Goal[];
  tasks: Task[];
  isNew: boolean;
  onFocusTask: (task: Task) => void;
}) {
  const subTask = Boolean(draft.parentId);
  return (
    <>
      <Form.Item label="关联方式" required>
        <Radio.Group
          value={subTask ? 'parent' : 'goal'}
          onChange={(event) =>
            patch(
              event.target.value === 'parent'
                ? { parentId: tasks.find((task) => task.id !== draft.id)?.id, goalId: undefined }
                : { parentId: undefined, goalId: goals[0]?.id }
            )
          }
        >
          <Radio value="goal">关联目标</Radio>
          <Radio value="parent">关联父任务</Radio>
        </Radio.Group>
      </Form.Item>
      {subTask ? (
        <Form.Item label="父任务">
          <Select
            value={draft.parentId}
            options={tasks
              .filter((task) => task.id !== draft.id)
              .map((task) => ({ value: task.id, label: task.title }))}
            onChange={(value) => patch({ parentId: value as string, goalId: undefined })}
          />
        </Form.Item>
      ) : (
        <Form.Item label="关联目标">
          <Select
            value={draft.goalId}
            options={goals.map((goal) => ({ value: goal.id, label: goal.title }))}
            onChange={(value) => patch({ goalId: value as string, parentId: undefined })}
          />
        </Form.Item>
      )}
      <Row gutter={12}>
        <Col span={12}>
          <ImportanceControl value={draft.importance} onChange={(importance) => patch({ importance })} />
        </Col>
        <Col span={12}>
          <ImportanceControl
            label="完成难度"
            value={draft.difficulty}
            onChange={(difficulty) => patch({ difficulty })}
          />
        </Col>
        <Col span={12}>
          <DateField
            label="计划开始时间"
            value={draft.plannedStart}
            onChange={(plannedStart) => patch({ plannedStart })}
          />
        </Col>
        <Col span={12}>
          <DateField label="计划结束时间" value={draft.plannedEnd} onChange={(plannedEnd) => patch({ plannedEnd })} />
        </Col>
        {!isNew && (
          <Col span={12}>
            <DateField label="开始时间" value={draft.start} onChange={(start) => patch({ start })} />
          </Col>
        )}
        {!isNew && (
          <Col span={12}>
            <DateField label="结束时间" value={draft.end} onChange={(end) => patch({ end })} />
          </Col>
        )}
        <Col span={12}>
          <Form.Item label="预计耗时">
            <InputNumber
              min={0.5}
              step={0.5}
              value={draft.estimated}
              style={{ width: '100%' }}
              onChange={(estimated) => patch({ estimated: Number(estimated) || 0 })}
            />
          </Form.Item>
        </Col>
      </Row>
      {!isNew && (
        <Form.Item label="状态">
          <Select
            value={draft.status}
            options={['todo', 'doing', 'done', 'abandoned'].map((value) => ({
              value,
              label: statusLabel(value),
            }))}
            onChange={(value) => patch({ status: value as TaskStatus })}
          />
        </Form.Item>
      )}
      {!isNew && (
        <Form.Item label="实际耗时">
          <Flex align="center" justify="space-between" gap={12}>
            <span>{draft.actual} 小时</span>
            <Button onClick={() => onFocusTask(draft)}>开始专注计时</Button>
          </Flex>
        </Form.Item>
      )}
      <Form.Item label="描述">
        <Input.TextArea value={draft.description} onChange={(event) => patch({ description: event.target.value })} />
      </Form.Item>
    </>
  );
}
function TodoFields({
  draft,
  patch,
  goals,
  tasks,
  habits,
  isNew,
  sessions,
  onRepeatInvalid,
  onFocusTodo,
}: {
  draft: Todo;
  patch: (value: Partial<Todo>) => void;
  goals: Goal[];
  tasks: Task[];
  habits: Habit[];
  isNew: boolean;
  sessions: FocusSession[];
  onRepeatInvalid: (message: string) => void;
  onFocusTodo: (todo: Todo) => void;
}) {
  const disabledRepeatRef = useRef<Todo['repeat']>(undefined);
  const repeatSetting = draft.repeat;
  const todoSessions = sessions.filter((session) => session.todoId === draft.id);
  const sourceName = draft.taskId
    ? `任务 · ${tasks.find((task) => task.id === draft.taskId)?.title || '已删除任务'}`
    : draft.goalId
      ? `目标 · ${goals.find((goal) => goal.id === draft.goalId)?.title || '已删除目标'}`
      : draft.habitId
        ? `习惯 · ${habits.find((habit) => habit.id === draft.habitId)?.title || '已删除习惯'}`
        : undefined;
  return (
    <>
      {sourceName && (
        <Form.Item label="系统来源">
          <Input disabled value={sourceName} />
        </Form.Item>
      )}
      <Row gutter={12}>
        <Col span={12}>
          <ImportanceControl value={draft.importance} onChange={(importance) => patch({ importance })} />
        </Col>
        <Col span={12}>
          <ImportanceControl label="紧急程度" value={draft.urgency} onChange={(urgency) => patch({ urgency })} />
        </Col>
        {!sourceName && (
          <Col span={24}>
            <div className={styles.repeatControl} data-product-ref={productRef('growth.repeat.interaction')}>
              <Flex align="center" justify="space-between">
                <span>重复</span>
                <Switch
                  checked={Boolean(draft.repeat)}
                  disabled={!isNew}
                  onChange={(enabled) => {
                    if (!isNew) return;
                    onRepeatInvalid('');
                    if (!enabled) {
                      disabledRepeatRef.current = draft.repeat;
                      patch({ repeat: undefined });
                      return;
                    }
                    patch({
                      repeat: disabledRepeatRef.current ?? asTodoRepeat(createDefaultRepeatSetting(draft.planned)),
                    });
                  }}
                />
              </Flex>
              {repeatSetting && (
                <RepeatSelector
                  lang="zh-CN"
                  value={repeatSetting as RepeatSelectorValue}
                  onChange={(setting) => {
                    onRepeatInvalid('');
                    const repeat = asTodoRepeat(setting, draft.repeat?.settledTimes);
                    disabledRepeatRef.current = repeat;
                    patch({
                      repeat,
                      planned: draft.repeat?.settledTimes ? draft.planned : repeat.repeatStartDate,
                    });
                  }}
                  onInvalid={() => onRepeatInvalid('请完成有效的重复规则后再保存')}
                />
              )}
            </div>
          </Col>
        )}
        {!draft.repeat && (
          <Col span={24}>
            <DateField label="计划日期" value={draft.planned} onChange={(planned) => patch({ planned })} />
          </Col>
        )}
        <Col span={24}>
          <PlannedTimeField
            start={draft.plannedStartTime}
            end={draft.plannedEndTime}
            onChange={(plannedStartTime, plannedEndTime) => patch({ plannedStartTime, plannedEndTime })}
          />
        </Col>
      </Row>
      {!isNew && (
        <Form.Item label="状态">
          <Select
            value={draft.status}
            options={['todo', 'done', 'abandoned'].map((value) => ({
              value,
              label: statusLabel(value),
            }))}
            onChange={(value) => patch({ status: value as TodoStatus })}
          />
        </Form.Item>
      )}
      {!isNew && (
        <Form.Item label="专注记录" data-product-ref={productRef('growth.track-time.rule.todo-range-focus')}>
          <Flex vertical gap={8}>
            {canFocusTodo(draft) ? (
              <Button onClick={() => onFocusTodo(draft)}>开始专注计时</Button>
            ) : draft.status === 'todo' && !isTodoPlanRange(draft) ? (
              <Alert type="info" showIcon title="时间点待办不可从本入口管理计时；已有记录仍可查看。" />
            ) : null}
            {todoSessions.length ? (
              todoSessions.map((session) => (
                <Flex key={session.id} align="center" justify="space-between">
                  <span>{session.title}</span>
                  <b>{session.minutes} 分钟 · {session.at}</b>
                </Flex>
              ))
            ) : (
              <span>尚无关联专注记录</span>
            )}
          </Flex>
        </Form.Item>
      )}
      <Form.Item label="描述">
        <Input.TextArea value={draft.description} onChange={(event) => patch({ description: event.target.value })} />
      </Form.Item>
    </>
  );
}
function HabitFields({
  draft,
  patch,
  goals,
  onRepeatInvalid,
}: {
  draft: Habit;
  patch: (value: Partial<Habit>) => void;
  goals: Goal[];
  onRepeatInvalid: (message: string) => void;
}) {
  const repeatSetting = draft.repeat;
  return (
    <>
      <Form.Item label="关联目标" required>
        <Select
          mode="multiple"
          value={draft.goalIds}
          options={goals
            .filter((goal) => goal.status !== 'abandoned')
            .map((goal) => ({ value: goal.id, label: goal.title }))}
          onChange={(goalIds) => patch({ goalIds: goalIds as string[] })}
        />
      </Form.Item>
      <Row gutter={12}>
        <Col span={12}>
          <ImportanceControl value={draft.importance} onChange={(importance) => patch({ importance })} />
        </Col>
        <Col span={12}>
          <ImportanceControl
            label="完成难度"
            value={draft.difficulty}
            onChange={(difficulty) => patch({ difficulty })}
          />
        </Col>
      </Row>
      <Form.Item label="执行规则" required>
        <div className={styles.repeatControl} data-product-ref={productRef('growth.repeat.interaction')}>
          <RepeatSelector
            lang="zh-CN"
            value={repeatSetting as RepeatSelectorValue}
            onChange={(setting) => {
              onRepeatInvalid('');
              patch({ repeat: setting });
            }}
            onInvalid={() => onRepeatInvalid('请完成有效的重复规则后再保存')}
          />
        </div>
      </Form.Item>
      <Form.Item label="状态">
        <Select
          value={draft.status}
          options={['active', 'paused', 'completed', 'abandoned'].map((value) => ({
            value,
            label: statusLabel(value),
            disabled: value === 'completed',
          }))}
          onChange={(status) => patch({ status: status as Habit['status'] })}
        />
      </Form.Item>
      <Alert
        type="info"
        showIcon
        title={`当前连续 ${draft.streak} 天、最长 ${draft.longest} 天与日志为计算字段，仅通过打卡更新。`}
      />
    </>
  );
}
