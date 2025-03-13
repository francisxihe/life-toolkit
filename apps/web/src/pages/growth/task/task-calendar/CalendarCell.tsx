import dayjs, { Dayjs } from 'dayjs';
import { useCalendarContext } from './context';
import { TaskVo, TaskStatus } from '@life-toolkit/vo/growth';
import { useTaskDetail } from '../../components/TaskDetail';
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import SiteIcon from '@/components/SiteIcon';

function TaskItem({ task }: { task: TaskVo }) {
  const { getTaskList } = useCalendarContext();

  const { openEditDrawer } = useTaskDetail();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        openEditDrawer({
          contentProps: {
            task: task,
            onClose: null,
            afterSubmit: async () => {
              await getTaskList();
            },
          },
        });
      }}
      className={clsx([
        `min-w-[200px] text-body-1 px-1.5 leading-[20px] rounded-[2px]`,
        'truncate cursor-pointer',
        task.status === TaskStatus.DONE
          ? 'text-success bg-success-light hover:bg-success-light-hover active:bg-success-light-active'
          : '',
        task.status === TaskStatus.TODO
          ? 'text-warning bg-warning-light hover:bg-warning-light-hover active:bg-warning-light-active'
          : '',
      ])}
    >
      {task.name}
    </div>
  );
}

export default function CalendarCell({ cellDate }: { cellDate: Dayjs }) {
  const { taskList, calendarMode, pageShowDate, getTaskList } =
    useCalendarContext();

  const { openCreateDrawer } = useTaskDetail();

  const todayTaskList = useMemo(() => {
    return taskList.filter((task) =>
      dayjs(cellDate).isBetween(task.startAt, task.endAt, 'day'),
    );
  }, [cellDate, taskList]);

  const [showAddTask, setShowAddTask] = useState(false);

  return (
    <div className={`!text-body-3 text-text-1 h-full`}>
      <div
        className={clsx([
          `p-1 h-full hover:bg-primary-1`,
          cellDate.isBefore(pageShowDate, 'month') ||
          cellDate.isAfter(pageShowDate, 'month')
            ? 'opacity-50'
            : '',
        ])}
        onMouseEnter={() => {
          setShowAddTask(true);
        }}
        onMouseLeave={() => {
          setShowAddTask(false);
        }}
      >
        <div className={`leading-[24px]`}>{cellDate.date()}</div>
        {calendarMode === 'month' && (
          <>
            <div className="mt-1 flex flex-col gap-0.5">
              {todayTaskList.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
            {showAddTask && (
              <div
                className={clsx([
                  `w-full text-body-1 px-1.5 leading-[20px] rounded-[2px]`,
                  'flex items-center gap-1',
                  'text-text-2 truncate cursor-pointer',
                  'opacity-0.75 bg-secondary hover:bg-secondary-hover active:bg-secondary-active',
                ])}
                onClick={() => {
                  openCreateDrawer({
                    contentProps: {
                      initialFormData: {
                        planTimeRange: [
                          cellDate.startOf('day').format('YYYY-MM-DD'),
                          cellDate.endOf('day').format('YYYY-MM-DD'),
                        ],
                      },
                      afterSubmit: async () => {
                        await getTaskList();
                      },
                    },
                  });
                }}
              >
                <SiteIcon id="add" className="w-3 h-3" />
                添加任务
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
