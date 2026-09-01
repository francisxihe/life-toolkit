import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Flex } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { TaskService } from '@true-north/web-service';
import { TaskWithoutRelationsVo } from '@true-north/vo';
import { TaskStatus } from '@true-north/enum';
import DayAgendaCalendar, {
  formatDayAgendaTitle,
} from '../../components/DayAgenda';
import { useDayAgendaDate } from '../../components/DayAgenda/context';
import { openTaskDetailDrawer } from '../detail/TaskDetailDrawer';
import TaskAgendaSections from '../components/TaskAgendaSections';
import styles from './style.module.less';
import { onTaskChanged } from '../../events';

type TaskGroups = {
  expired: TaskWithoutRelationsVo[];
  scheduled: TaskWithoutRelationsVo[];
  done: TaskWithoutRelationsVo[];
  abandoned: TaskWithoutRelationsVo[];
};

const emptyGroups: TaskGroups = {
  expired: [],
  scheduled: [],
  done: [],
  abandoned: [],
};

export default function TaskToday() {
  const { selectedDate, setSelectedDate, visibleMonth, setVisibleMonth } =
    useDayAgendaDate();
  const [groups, setGroups] = useState<TaskGroups>(emptyGroups);
  const [calendarCounts, setCalendarCounts] = useState<Record<string, number>>(
    {},
  );
  const selectedDateText = selectedDate.format('YYYY-MM-DD');
  const isSelectedToday = selectedDate.isSame(dayjs(), 'day');

  const refreshData = useCallback(async () => {
    const activeStatuses = [TaskStatus.TODO, TaskStatus.DOING];
    const mergeActive = (
      responses: Array<{ list?: TaskWithoutRelationsVo[] } | undefined>,
    ) =>
      [
        ...new Map(
          responses
            .flatMap((response) => response?.list || [])
            .map((task) => [task.id, task]),
        ).values(),
      ].sort(
        (a, b) =>
          (a.startAt || '').localeCompare(b.startAt || '') ||
          (a.endAt || '').localeCompare(b.endAt || ''),
      );
    const [scheduledTodo, scheduledDoing, done, abandoned] = await Promise.all([
      ...activeStatuses.map((status) =>
        TaskService.findByFilter({
          status,
          startDateEnd: selectedDateText,
          endDateStart: selectedDateText,
        }),
      ),
      TaskService.findByFilter({
        status: TaskStatus.DONE,
        doneDateStart: selectedDateText,
        doneDateEnd: selectedDateText,
      }),
      TaskService.findByFilter({
        status: TaskStatus.ABANDONED,
        abandonedDateStart: selectedDateText,
        abandonedDateEnd: selectedDateText,
      }),
    ]);

    let expired: TaskWithoutRelationsVo[] = [];
    if (isSelectedToday) {
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      const [expiredTodo, expiredDoing] = await Promise.all(
        activeStatuses.map((status) =>
          TaskService.findByFilter({ status, endDateEnd: yesterday }),
        ),
      );
      expired = mergeActive([expiredTodo, expiredDoing]);
    }

    setGroups({
      expired,
      scheduled: mergeActive([scheduledTodo, scheduledDoing]),
      done: done?.list || [],
      abandoned: abandoned?.list || [],
    });
  }, [isSelectedToday, selectedDateText]);

  const refreshCalendarCounts = useCallback(async () => {
    const visibleStart = visibleMonth.startOf('month').startOf('week');
    const visibleEnd = visibleMonth.endOf('month').endOf('week');
    const activeStatuses = [TaskStatus.TODO, TaskStatus.DOING];
    const responses = await Promise.all(
      activeStatuses.map((status) =>
        TaskService.findByFilter({
          status,
          startDateEnd: visibleEnd.format('YYYY-MM-DD'),
          endDateStart: visibleStart.format('YYYY-MM-DD'),
        }),
      ),
    );
    const taskList = [
      ...new Map(
        responses
          .flatMap((response) => response?.list || [])
          .map((task) => [task.id, task]),
      ).values(),
    ];
    const counts: Record<string, number> = {};

    taskList.forEach((task) => {
      const taskStart = dayjs(task.startAt);
      const taskEnd = dayjs(task.endAt);
      if (!taskStart.isValid() || !taskEnd.isValid()) return;

      let cursor = taskStart.isBefore(visibleStart, 'day')
        ? visibleStart
        : taskStart.startOf('day');
      const lastDate = taskEnd.isAfter(visibleEnd, 'day')
        ? visibleEnd
        : taskEnd.startOf('day');
      while (!cursor.isAfter(lastDate, 'day')) {
        const dateKey = cursor.format('YYYY-MM-DD');
        counts[dateKey] = (counts[dateKey] || 0) + 1;
        cursor = cursor.add(1, 'day');
      }
    });

    setCalendarCounts(counts);
  }, [visibleMonth]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  useEffect(() => {
    void refreshCalendarCounts();
  }, [refreshCalendarCounts]);

  useEffect(
    () =>
      onTaskChanged(() => {
        void refreshData();
        void refreshCalendarCounts();
      }),
    [refreshCalendarCounts, refreshData],
  );

  return (
    <ProductSurface id={productRef('growth.task.view.today')}>
    <Flex vertical container="full" className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <DayAgendaCalendar
            value={selectedDate}
            onChange={setSelectedDate}
            visibleMonth={visibleMonth}
            onVisibleMonthChange={setVisibleMonth}
            itemCounts={calendarCounts}
          />
        </aside>
        <Flex vertical container="fill" className={styles.main}>
          <Flex container="fixed" align="center" className={styles.toolbar}>
            <h1 className={styles.title}>
              {formatDayAgendaTitle(selectedDate)}
            </h1>
          </Flex>
          <Flex container="fill" className={styles.content}>
            <TaskAgendaSections
              groups={[
                ...(isSelectedToday
                  ? [
                      {
                        key: 'expired',
                        label: '已过期',
                        taskList: groups.expired,
                      },
                    ]
                  : []),
                {
                  key: 'scheduled',
                  label: '未完成',
                  taskList: groups.scheduled,
                },
                { key: 'done', label: '已完成', taskList: groups.done },
                {
                  key: 'abandoned',
                  label: '已放弃',
                  taskList: groups.abandoned,
                },
              ]}
              emptyLabel="当天没有任务"
              onClickTask={async (id) => {
                openTaskDetailDrawer({ taskId: id, onRefresh: refreshData });
              }}
              refreshTaskList={refreshData}
            />
          </Flex>
        </Flex>
      </div>
    </Flex>
    </ProductSurface>
  );
}
