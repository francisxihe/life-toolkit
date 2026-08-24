import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Card, Flex, Select, Space, Tooltip, message } from '@sue/design-web-react';
import { CompressOutlined, ExpandOutlined, PauseCircleOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { TaskStatus, TodoStatus, TrackTimeRelatedType } from '@true-north/enum';
import { TaskService, TodoService, TrackTimeController } from '@true-north/web-service';
import Flip from '@/pages/timer/normal/Flip';
import { getTimeArr } from '@/pages/timer/utils';
import { ProductSurface } from '@true-north/product-server';
import { productRef } from '@true-north/product-wiki';
import styles from './style.module.less';

const DEFAULT_DURATION = 25 * 60;
const SELECT_POPUP_Z_INDEX = 2100;

const RELATED_PREFIX = {
  task: 'task:',
  todo: 'todo:',
} as const;

export type FocusTimerOpenOptions = {
  taskId?: string;
  todoId?: string;
  label?: string;
};

type FocusTimerOpenFn = (related?: string | FocusTimerOpenOptions) => void;

type FocusTimerContextValue = {
  open: FocusTimerOpenFn;
};

type RelatedOption = { value: string; label: string };
type RelatedOptionGroup = { label: string; options: RelatedOption[] };

const FocusTimerContext = createContext<FocusTimerContextValue | null>(null);

/** Static Drawer/Modal portals leave the React tree; Provider registers here. */
let registeredOpen: FocusTimerOpenFn | null = null;

export function openFocusTimer(related?: string | FocusTimerOpenOptions) {
  if (!registeredOpen) {
    message.warning('专注计时器未就绪');
    return;
  }
  registeredOpen(related);
}

export function useFocusTimer() {
  const context = useContext(FocusTimerContext);
  if (context) return context;
  // Fallback for content rendered by Drawer.open / Modal.confirm outside the provider tree.
  return { open: openFocusTimer };
}

function normalizeOpenOptions(related?: string | FocusTimerOpenOptions): FocusTimerOpenOptions {
  if (!related) return {};
  if (typeof related === 'string') return { taskId: related };
  return related;
}

function toSelectValue(taskId?: string, todoId?: string) {
  if (todoId) return `${RELATED_PREFIX.todo}${todoId}`;
  if (taskId) return `${RELATED_PREFIX.task}${taskId}`;
  return undefined;
}

function parseSelectValue(value?: string): { taskId?: string; todoId?: string } {
  if (!value) return {};
  if (value.startsWith(RELATED_PREFIX.todo)) {
    return { todoId: value.slice(RELATED_PREFIX.todo.length) };
  }
  if (value.startsWith(RELATED_PREFIX.task)) {
    return { taskId: value.slice(RELATED_PREFIX.task.length) };
  }
  return {};
}

export function FocusTimerProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [taskId, setTaskId] = useState<string>();
  const [todoId, setTodoId] = useState<string>();
  const [relatedLocked, setRelatedLocked] = useState(false);
  const [lockedLabel, setLockedLabel] = useState<string>();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number>();
  const [relatedOptions, setRelatedOptions] = useState<RelatedOptionGroup[]>([]);

  const loadTimerData = useCallback(async () => {
    try {
      const [taskResult, todoResult] = await Promise.all([
        TaskService.findByFilter({}),
        TodoService.list({ status: TodoStatus.TODO }),
      ]);
      const taskOptions = (taskResult?.list || [])
        .filter((task) => task.status !== TaskStatus.DONE && task.status !== TaskStatus.ABANDONED)
        .map((task) => ({ value: `${RELATED_PREFIX.task}${task.id}`, label: task.name }));
      const todoOptions = (todoResult?.list || []).map((todo) => ({
        value: `${RELATED_PREFIX.todo}${todo.id}`,
        label: todo.name,
      }));
      setRelatedOptions([
        { label: '任务', options: taskOptions },
        { label: '待办', options: todoOptions },
      ]);
    } catch (error) {
      console.error('加载专注计时器数据失败:', error);
      message.error('加载专注计时器数据失败');
    }
  }, []);

  const open = useCallback((related?: string | FocusTimerOpenOptions) => {
    const options = normalizeOpenOptions(related);
    const nextTodoId = options.todoId;
    const nextTaskId = options.todoId ? undefined : options.taskId;
    setTodoId(nextTodoId);
    setTaskId(nextTaskId);
    setRelatedLocked(Boolean(options.taskId || options.todoId));
    setLockedLabel(
      nextTodoId
        ? options.label || '待办专注'
        : nextTaskId
          ? options.label || '任务专注'
          : undefined,
    );
    setVisible(true);
    setFullScreen(false);
    void loadTimerData();
  }, [loadTimerData]);

  useEffect(() => {
    registeredOpen = open;
    return () => {
      if (registeredOpen === open) registeredOpen = null;
    };
  }, [open]);

  useEffect(() => {
    if (!running || !startedAt) return;
    const timer = window.setInterval(() => {
      setElapsed((value) => Math.min(DEFAULT_DURATION, value + 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, startedAt]);

  useEffect(() => {
    if (elapsed >= DEFAULT_DURATION && running) setRunning(false);
  }, [elapsed, running]);

  const reset = () => {
    setRunning(false);
    setStartedAt(undefined);
    setElapsed(0);
  };

  const toggleRunning = () => {
    if (running) {
      setRunning(false);
      setStartedAt(undefined);
      return;
    }
    if (elapsed >= DEFAULT_DURATION) return;
    setStartedAt(Date.now());
    setRunning(true);
  };

  const finish = async () => {
    if (!elapsed) {
      message.warning('请先开始专注再记录');
      return;
    }
    const endedAt = new Date();
    const relatedType = todoId
      ? TrackTimeRelatedType.TODO
      : taskId
        ? TrackTimeRelatedType.TASK
        : TrackTimeRelatedType.NONE;
    const relatedId = todoId || taskId;
    try {
      await TrackTimeController.create({
        relatedType,
        relatedId,
        duration: elapsed,
        startAt: new Date(endedAt.getTime() - elapsed * 1000).toISOString(),
        endAt: endedAt.toISOString(),
      });
      message.success('专注记录已保存');
      reset();
      await loadTimerData();
    } catch (error) {
      console.error('保存专注记录失败:', error);
      message.error('保存专注记录失败');
    }
  };

  useEffect(() => {
    if (elapsed === DEFAULT_DURATION && startedAt) {
      setRunning(false);
      setStartedAt(undefined);
      void finish();
    }
  }, [elapsed, startedAt]);

  const close = () => {
    if (running) {
      setFullScreen(false);
      return;
    }
    setVisible(false);
    setFullScreen(false);
  };

  const onSelectRelated = useCallback((value?: string) => {
    const next = parseSelectValue(value);
    setTaskId(next.taskId);
    setTodoId(next.todoId);
    setLockedLabel(undefined);
  }, []);

  const contextValue = useMemo(() => ({ open }), [open]);

  const flatOptions = useMemo(
    () => relatedOptions.flatMap((group) => group.options),
    [relatedOptions],
  );

  const relatedName = useMemo(() => {
    if (relatedLocked && lockedLabel) return lockedLabel;
    const selected = flatOptions.find((option) => option.value === toSelectValue(taskId, todoId));
    if (selected) return selected.label;
    if (todoId) return lockedLabel || '待办专注';
    if (taskId) return lockedLabel || '任务专注';
    return '独立专注';
  }, [flatOptions, lockedLabel, relatedLocked, taskId, todoId]);

  const lockedDisplay = todoId
    ? `待办 · ${relatedName}`
    : taskId
      ? `任务 · ${relatedName}`
      : relatedName;

  return (
    <FocusTimerContext.Provider value={contextValue}>
      {children}
      {visible && (
        <ProductSurface id={productRef('growth.track-time.overview')}>
        <FocusTimerOverlay
          elapsed={elapsed}
          fullScreen={fullScreen}
          relatedLocked={relatedLocked}
          relatedName={relatedName}
          lockedDisplay={lockedDisplay}
          running={running}
          selectValue={toSelectValue(taskId, todoId)}
          relatedOptions={relatedOptions}
          onClose={close}
          onFinish={finish}
          onReset={reset}
          onSelectRelated={onSelectRelated}
          onToggleFullScreen={() => setFullScreen((value) => !value)}
          onToggleRunning={toggleRunning}
        />
        </ProductSurface>
      )}
    </FocusTimerContext.Provider>
  );
}

function RelatedSelector({
  relatedLocked,
  lockedDisplay,
  selectValue,
  relatedOptions,
  className,
  onSelectRelated,
}: {
  relatedLocked: boolean;
  lockedDisplay: string;
  selectValue?: string;
  relatedOptions: RelatedOptionGroup[];
  className: string;
  onSelectRelated: (value?: string) => void;
}) {
  if (relatedLocked) {
    return <span className={styles.taskName}>{lockedDisplay}</span>;
  }
  return (
    <ProductSurface id={productRef('growth.track-time.rule.task-optional')}>
      <ProductSurface id={productRef('growth.track-time.rule.todo-optional')}>
    <Select
      allowClear
      showSearch
      optionFilterProp="label"
      className={className}
      classNames={{ popup: { root: styles.selectPopup } }}
      styles={{ popup: { root: { zIndex: SELECT_POPUP_Z_INDEX } } }}
      value={selectValue}
      placeholder="搜索任务或待办（可选）"
      options={relatedOptions}
      onChange={(value) => onSelectRelated(value as string | undefined)}
    />
      </ProductSurface>
    </ProductSurface>
  );
}

function FocusTimerOverlay({
  elapsed,
  fullScreen,
  relatedLocked,
  relatedName,
  lockedDisplay,
  running,
  selectValue,
  relatedOptions,
  onClose,
  onFinish,
  onReset,
  onSelectRelated,
  onToggleFullScreen,
  onToggleRunning,
  'data-product-ref': productRefAttr,
}: {
  elapsed: number;
  fullScreen: boolean;
  relatedLocked: boolean;
  relatedName: string;
  lockedDisplay: string;
  running: boolean;
  selectValue?: string;
  relatedOptions: RelatedOptionGroup[];
  onClose: () => void;
  onFinish: () => void;
  onReset: () => void;
  onSelectRelated: (value?: string) => void;
  onToggleFullScreen: () => void;
  onToggleRunning: () => void;
  'data-product-ref'?: string;
}) {
  const remaining = Math.max(DEFAULT_DURATION - elapsed, 0);
  const timeArr = getTimeArr(remaining);
  const controls = (
    <Space size={8}>
      <Tooltip title="重置计时">
        <Button shape="circle" icon={<ReloadOutlined />} aria-label="重置计时" onClick={onReset} />
      </Tooltip>
      <Tooltip title={running ? '暂停计时' : '开始计时'}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={running ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          aria-label={running ? '暂停计时' : '开始计时'}
          onClick={onToggleRunning}
        />
      </Tooltip>
    </Space>
  );
  const selector = (
    <RelatedSelector
      relatedLocked={relatedLocked}
      lockedDisplay={lockedDisplay}
      selectValue={selectValue}
      relatedOptions={relatedOptions}
      className={fullScreen ? styles.fullscreenTaskSelector : styles.taskSelector}
      onSelectRelated={onSelectRelated}
    />
  );

  if (fullScreen) {
    return (
      <div className={styles.fullscreen} data-product-ref={productRefAttr}>
        <div className={styles.fullscreenContent}>
          <Flex className={styles.fullscreenHeader} align="center" justify="space-between">
            <div>
              <h1>专注计时</h1>
              <p>{relatedName}</p>
            </div>
            {selector}
          </Flex>
          <Flex align="center" justify="center" className={styles.clock}>
            <Flex align="center">
              <Flip total={9} current={timeArr[0]} />
              <Flip total={9} current={timeArr[1]} />
              <Flex vertical justify="space-around" className={styles.colon} />
              <Flip total={5} current={timeArr[2]} />
              <Flip total={9} current={timeArr[3]} />
              <Flex vertical justify="space-around" className={styles.colon} />
              <Flip total={5} current={timeArr[4]} />
              <Flip total={9} current={timeArr[5]} />
            </Flex>
          </Flex>
          <Flex align="center" gap={8} className={styles.fullscreenActions}>
            <Tooltip title="重置计时">
              <Button shape="circle" icon={<ReloadOutlined />} aria-label="重置计时" onClick={onReset} />
            </Tooltip>
            <Tooltip title={running ? '暂停计时' : '开始计时'}>
              <Button
                type="primary"
                shape="circle"
                icon={running ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                aria-label={running ? '暂停计时' : '开始计时'}
                onClick={onToggleRunning}
              />
            </Tooltip>
            <button type="button" className={styles.recordButton} onClick={onFinish}>
              结束并记录
            </button>
            <Tooltip title="最小化">
              <Button shape="circle" icon={<CompressOutlined />} aria-label="最小化计时器" onClick={onToggleFullScreen} />
            </Tooltip>
          </Flex>
        </div>
      </div>
    );
  }

  return (
    <Card className={styles.miniTimer} data-product-ref={productRefAttr}>
      <Flex vertical gap={12}>
        <Flex align="center" justify="space-between">
          <b>专注计时</b>
          <Space size={0}>
            <Tooltip title="展开全屏"><Button type="text" size="small" icon={<ExpandOutlined />} aria-label="展开全屏计时器" onClick={onToggleFullScreen} /></Tooltip>
            <Tooltip title={running ? '计时进行中，保持迷你浮层' : '关闭计时器'}><Button type="text" size="small" aria-label="关闭计时器" onClick={onClose}>关闭</Button></Tooltip>
          </Space>
        </Flex>
        {selector}
        <Flex className={styles.miniBody} align="center" justify="space-between" gap={12}>
          <Flex vertical gap={2}><b className={styles.miniTime}>{formatSeconds(remaining)}</b><span className={styles.taskName}>{relatedName}</span></Flex>
          {controls}
        </Flex>
        <Button type="link" className={styles.finishButton} onClick={onFinish}>结束并记录</Button>
      </Flex>
    </Card>
  );
}

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60).toString().padStart(2, '0');
  const seconds = (total % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}
