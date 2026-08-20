import { useState, useEffect, useRef } from 'react';
import {
  Popover,
  Button,
  Input,
  DatePicker,
  Avatar,
  Space,
  Divider,
  PlusOutlined,
  Flex,
} from '@sue/design-web-react';
import {
  CaretRightOutlined,
  PauseOutlined,
  StopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { TimeEntry, TimeTrackerProps } from './types';

const { RangePicker } = DatePicker;

export default function TimeTracker({
  onSave,
  initialEntries = [],
  taskName = '任务'
}: Omit<TimeTrackerProps, 'visible' | 'onClose'>) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialEntries);
  const [note, setNote] = useState('');
  const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  // 格式化持续时间
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // 开始计时
  const startTimer = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setCurrentTime(0);

    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => prev + 1);
    }, 1000);
  };

  // 暂停计时
  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 停止并保存计时
  const stopTimer = () => {
    if (startTime && currentTime > 0) {
      const endTime = new Date();
      const entry: TimeEntry = {
        id: Date.now().toString(),
        duration: currentTime,
        startAt: startTime.toISOString(),
        endAt: endTime.toISOString(),
        notes: note.trim() || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTimeEntries((prev) => [entry, ...prev]);
    }

    pauseTimer();
    setCurrentTime(0);
    setStartTime(null);
    setNote('');
  };

  // 添加时间范围记录
  const addTimeRange = () => {
    if (timeRange) {
      const [start, end] = timeRange;
      const duration = end.diff(start, 'second');

      const entry: TimeEntry = {
        id: Date.now().toString(),
        duration,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        notes: note.trim() || undefined,
        user: 'Xihe Francis',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTimeEntries((prev) => [entry, ...prev]);
      setTimeRange(null);
      setNote('');
    }
  };

  // 计算总时间
  const totalTime = timeEntries.reduce((acc, entry) => acc + entry.duration, 0);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 处理保存
  const handleSave = () => {
    onSave(timeEntries);
  };

  return (
    <div className="space-y-4">
      {/* 实时计时器 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <Flex align="center" justify="space-between" className="mb-4">
          <Flex align="center" gap={8}>
            <Avatar size={24} style={{ backgroundColor: '#6366f1' }}>
              X
            </Avatar>
            <span>Xihe Francis</span>
          </Flex>
          <div className="text-2xl font-mono">{formatTime(currentTime)}</div>
        </Flex>

        <Flex align="center" gap={8} className="mb-3">
          {!isRunning ?
          <Button
            type="primary"
            icon={<CaretRightOutlined />}
            onClick={startTimer}
            size="small">

              开始计时
            </Button> :

          <>
              <Button icon={<PauseOutlined />} onClick={pauseTimer} size="small">
                暂停
              </Button>
              <Button
              icon={<StopOutlined />}
              onClick={stopTimer}
              size="small"
              type="primary"
              status="success">

                停止并保存
              </Button>
            </>
          }
        </Flex>
      </div>

      {/* 时间范围选择 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h6 className="text-title-1 font-medium mb-3">
          或选择时间范围
        </h6>

        <div className="space-y-3">
          <RangePicker
            showTime
            value={timeRange}
            onChange={(date) =>
            setTimeRange(date as [dayjs.Dayjs, dayjs.Dayjs])
            }
            style={{ width: '100%' }}
            placeholder={['开始时间', '结束时间']} />

          <Input.TextArea
            placeholder="备注..."
            value={note}
            onChange={(event) => setNote(event.target.value)}
            autoSize={{ minRows: 2, maxRows: 3 }} />

          <Flex gap={8}>
            <Button
              type="primary"
              onClick={addTimeRange}
              disabled={!timeRange}
              size="small">

              添加时间记录
            </Button>
          </Flex>
        </div>
      </div>

      {/* 时间记录列表 */}
      <div>
        <Flex justify="space-between" align="center" className="mb-3">
          <h6 className="text-title-1 font-medium">时间记录</h6>
          <div className="text-sm text-gray-500">
            总计: {formatDuration(totalTime)}
          </div>
        </Flex>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {timeEntries.map((entry) =>
          <Flex
            key={entry.id}
            align="center"
            justify="space-between"
            className="p-3 bg-bg-1 rounded border">

              <Flex align="center" gap={12}>
                <Avatar size={20} style={{ backgroundColor: '#6366f1' }}>
                  X
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{entry.user}</div>
                  <div className="text-xs text-gray-500">
                    {dayjs(entry.startAt).format('MM-DD HH:mm')} -{' '}
                    {dayjs(entry.endAt).format('HH:mm')}
                  </div>
                  {entry.notes &&
                <div className="text-xs text-gray-600 mt-1">
                      {entry.notes}
                    </div>
                }
                </div>
              </Flex>
              <div className="text-sm font-medium">
                {formatDuration(entry.duration)}
              </div>
            </Flex>
          )}

          {timeEntries.length === 0 &&
          <div className="text-center text-gray-500 py-8">暂无时间记录</div>
          }
        </div>
      </div>
    </div>);

}
