import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Button, Card, Flex, Select, Space, Tooltip, message } from '@sue/design-web-react';
import { CompressOutlined, ExpandOutlined, PauseCircleOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { TaskStatus, TrackTimeRelatedType } from '@true-north/enum';
import { TaskService, TrackTimeController } from '@true-north/web-service';
import Flip from '@/pages/timer/normal/Flip';
import { getTimeArr } from '@/pages/timer/utils';
import styles from './style.module.less';

const DEFAULT_DURATION = 25 * 60;

export type FocusTimerOpenOptions = {
  taskId?: string;
  todoId?: string;
  label?: string;
};

type FocusTimerOpenFn = (related?: string | FocusTimerOpenOptions) => void;

type FocusTimerContextValue = {
  open: FocusTimerOpenFn;
};

type TaskOption = { value: string; label: string };

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

export function FocusTimerProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [taskId, setTaskId] = useState<string>();
  const [todoId, setTodoId] = useState<string>();
  const [lockedLabel, setLockedLabel] = useState<string>();
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number>();
  const [taskOptions, setTaskOptions] = useState<TaskOption[]>([]);

  const loadTimerData = useCallback(async () => {
    try {
      const taskResult = await TaskService.findByFilter({});
      setTaskOptions(
        (taskResult?.list || [])
          .filter((task) => task.status !== TaskStatus.DONE && task.status !== TaskStatus.ABANDONED)
          .map((task) => ({ value: task.id, label: task.name })),
      );
    } catch (error) {
      console.error('加载专注计时器数据失败:', error);
      message.error('加载专注计时器数据失败');
    }
  }, []);

  const open = useCallback((related?: string | FocusTimerOpenOptions) => {
    const options = normalizeOpenOptions(related);
    setTodoId(options.todoId);
    setTaskId(options.todoId ? undefined : options.taskId);
    setLockedLabel(options.todoId ? options.label || '待办专注' : undefined);
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

  const contextValue = useMemo(() => ({ open }), [open]);
  const taskName = todoId
    ? lockedLabel || '待办专注'
    : taskOptions.find((task) => task.value === taskId)?.label || '独立专注';

  return (
    <FocusTimerContext.Provider value={contextValue}>
      {children}
      {visible && (
        <FocusTimerOverlay
          elapsed={elapsed}
          fullScreen={fullScreen}
          lockedToTodo={Boolean(todoId)}
          running={running}
          taskId={taskId}
          taskName={taskName}
          taskOptions={taskOptions}
          onClose={close}
          onFinish={finish}
          onReset={reset}
          onSetTaskId={(value) => {
            setTaskId(value);
            setTodoId(undefined);
            setLockedLabel(undefined);
          }}
          onToggleFullScreen={() => setFullScreen((value) => !value)}
          onToggleRunning={toggleRunning}
        />
      )}
    </FocusTimerContext.Provider>
  );
}

function FocusTimerOverlay({
  elapsed,
  fullScreen,
  lockedToTodo,
  running,
  taskId,
  taskName,
  taskOptions,
  onClose,
  onFinish,
  onReset,
  onSetTaskId,
  onToggleFullScreen,
  onToggleRunning,
}: {
  elapsed: number;
  fullScreen: boolean;
  lockedToTodo: boolean;
  running: boolean;
  taskId?: string;
  taskName: string;
  taskOptions: TaskOption[];
  onClose: () => void;
  onFinish: () => void;
  onReset: () => void;
  onSetTaskId: (value?: string) => void;
  onToggleFullScreen: () => void;
  onToggleRunning: () => void;
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
  const selector = lockedToTodo ? (
    <span className={styles.taskName}>待办 · {taskName}</span>
  ) : (
    <Select
      allowClear
      className={styles.taskSelector}
      value={taskId}
      placeholder="选择任务（可选）"
      options={taskOptions}
      onChange={(value) => onSetTaskId(value as string | undefined)}
    />
  );

  if (fullScreen) {
    return (
      <div className={styles.fullscreen}>
        <div className={styles.fullscreenContent}>
          <Flex className={styles.fullscreenHeader} align="center" justify="space-between">
            <div>
              <h1>专注计时</h1>
              <p>{taskName}</p>
            </div>
            {lockedToTodo ? (
              <span className={styles.taskName}>待办 · {taskName}</span>
            ) : (
              <Select
                allowClear
                className={styles.fullscreenTaskSelector}
                value={taskId}
                placeholder="选择任务（可选）"
                options={taskOptions}
                onChange={(value) => onSetTaskId(value as string | undefined)}
              />
            )}
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
    <Card className={styles.miniTimer}>
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
          <Flex vertical gap={2}><b className={styles.miniTime}>{formatSeconds(remaining)}</b><span className={styles.taskName}>{taskName}</span></Flex>
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
