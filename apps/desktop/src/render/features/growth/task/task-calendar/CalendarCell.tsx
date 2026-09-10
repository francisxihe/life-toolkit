import dayjs, { Dayjs } from 'dayjs';
import { Flex } from '@sue/design-web-react';
import { useCalendarContext } from './context';
import { TaskVo } from '@true-north/vo';
import { useTaskDetail } from '../../components/task-detail';
import { openTaskDrawer } from '../detail/TaskDrawer';
import { useMemo } from 'react';
import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { TaskStatus } from '@true-north/enum';
import styles from './style.module.less';

function TaskItem({ task }: { task: TaskVo }) {
  const { getTaskList } = useCalendarContext();

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        openTaskDrawer({ taskId: task.id, onRefresh: getTaskList });
      }}
      className={clsx([
        `text-body-1 px-1.5 leading-[20px] rounded-[2px]`,
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
  const {
    taskList,
    pageShowDate,
    addDate,
    getTaskList,
    setAddDate,
  } = useCalendarContext();

  const {
    CreatePopover: CreateTaskPopover,
    createPopoverVisible: createTaskPopoverVisible,
  } = useTaskDetail();

  const todayTaskList = useMemo(() => {
    return taskList.filter((task) => {
      const startDate = dayjs(task.startAt);
      const endDate = dayjs(task.endAt);

      return (
        startDate.isValid() &&
        endDate.isValid() &&
        !cellDate.isBefore(startDate, 'day') &&
        !cellDate.isAfter(endDate, 'day')
      );
    });
  }, [cellDate, taskList]);

  return (
    <div className={styles.cell}>
      <div
        className={clsx(styles.cellContent, {
          [styles.cellOutsideMonth]:
            cellDate.isBefore(pageShowDate, 'month') ||
            cellDate.isAfter(pageShowDate, 'month'),
        })}
        onMouseEnter={() => {
          setAddDate(cellDate);
        }}
        onMouseLeave={() => setAddDate(null)}
      >
        <div className={styles.cellDate}>{cellDate.date()}</div>
        <>
            <Flex vertical gap={2}>
              {todayTaskList.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </Flex>
            {(addDate?.isSame(cellDate) ||
              createTaskPopoverVisible) && (
              <div className={styles.cellCreate}>
                <CreateTaskPopover
                  creatorProps={{
                    initialFormData: {
                      planTimeRange: [
                        cellDate.startOf('day').format('YYYY-MM-DD'),
                        cellDate.endOf('day').format('YYYY-MM-DD'),
                      ],
                    },
                    afterSubmit: async () => {
                      await getTaskList();
                    },
                  }}
                >
                  <Flex
                    align="center"
                    gap={4}
                    className={clsx([
                      'w-full text-body-1 px-1.5 leading-[20px] rounded-[2px]',
                      'text-text-2 truncate cursor-pointer',
                      'opacity-0.75 bg-secondary hover:bg-secondary-hover active:bg-secondary-active',
                    ])}
                  >
                    <Plus size={12} className="w-3 h-3" />
                    添加任务
                  </Flex>
                </CreateTaskPopover>
              </div>
            )}
        </>
      </div>
    </div>
  );
}
