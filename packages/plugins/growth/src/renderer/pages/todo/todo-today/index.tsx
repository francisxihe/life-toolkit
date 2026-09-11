import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Flex } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import styles from './style.module.less';
import { TodoService } from '@true-north/web-service';
import { TodoVo, TodoWithoutRelationsVo } from '@true-north/vo';
import { TodoStatus } from '@true-north/enum';
import { useTodoDetail } from '../../components';
import DayAgendaCalendar, {
  formatAgendaTitle,
} from '../../components/day-agenda';
import { useAgendaDate } from '../../components/day-agenda/context';
import TodoAgendaSections from '../components/TodoAgendaSections';
import { onTodoChanged } from '../../events';

export default function TodoToday() {
  const { selectedDate, setSelectedDate, visibleMonth, setVisibleMonth } =
    useAgendaDate();
  const [scheduledTodos, setScheduledTodos] = useState<TodoVo[]>([]);
  const [doneTodos, setDoneTodos] = useState<TodoVo[]>([]);
  const [expiredTodos, setExpiredTodos] = useState<TodoVo[]>([]);
  const [abandonedTodos, setAbandonedTodos] = useState<TodoVo[]>([]);
  const [calendarCounts, setCalendarCounts] = useState<Record<string, number>>(
    {},
  );
  const selectedDateText = selectedDate.format('YYYY-MM-DD');
  const isSelectedToday = selectedDate.isSame(dayjs(), 'day');

  const refreshData = useCallback(async () => {
    const [scheduledTodo, doneResponse, abandonedResponse] = await Promise.all([
      TodoService.list({
        status: TodoStatus.TODO,
        planDateStart: selectedDateText,
        planDateEnd: selectedDateText,
      }),
      TodoService.list({
        status: TodoStatus.DONE,
        doneDateStart: selectedDateText,
        doneDateEnd: selectedDateText,
      }),
      TodoService.list({
        status: TodoStatus.ABANDONED,
        abandonedDateStart: selectedDateText,
        abandonedDateEnd: selectedDateText,
      }),
    ]);

    let expired: TodoVo[] = [];
    if (isSelectedToday) {
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      const expiredTodo = await TodoService.list({
        status: TodoStatus.TODO,
        planDateEnd: yesterday,
      });
      expired = [...(expiredTodo?.list || [])].sort((a, b) =>
        (a.planStartTime || '').localeCompare(b.planStartTime || ''),
      );
    }

    setScheduledTodos(
      [...(scheduledTodo?.list || [])].sort((a, b) =>
        (a.planStartTime || '').localeCompare(b.planStartTime || ''),
      ),
    );
    setDoneTodos(doneResponse?.list || []);
    setExpiredTodos(expired);
    setAbandonedTodos(abandonedResponse?.list || []);
  }, [isSelectedToday, selectedDateText]);

  const refreshCalendarCounts = useCallback(async () => {
    const visibleStart = visibleMonth.startOf('month').startOf('week');
    const visibleEnd = visibleMonth.endOf('month').endOf('week');
    const response = await TodoService.list({
      status: TodoStatus.TODO,
      planDateStart: visibleStart.format('YYYY-MM-DD'),
      planDateEnd: visibleEnd.format('YYYY-MM-DD'),
    });
    const todoList = response?.list || [];
    const counts = todoList.reduce<Record<string, number>>((result, todo) => {
      const dateKey = dayjs(todo.planDate).format('YYYY-MM-DD');
      result[dateKey] = (result[dateKey] || 0) + 1;
      return result;
    }, {});

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
      onTodoChanged(() => {
        void refreshData();
        void refreshCalendarCounts();
      }),
    [refreshCalendarCounts, refreshData],
  );

  const { openEditDrawer } = useTodoDetail();

  async function showTodoDetail(todo: TodoWithoutRelationsVo) {
    openEditDrawer({
      contentProps: {
        todo: todo as TodoVo,
        afterSubmit: refreshData,
      },
    });
  }

  return (
    <ProductSurface id={productRef('growth.todo.view.today')}>
    <Flex container="full">
      <Flex vertical container="fixed" className={styles.sidebar}>
        <DayAgendaCalendar
          value={selectedDate}
          onChange={setSelectedDate}
          visibleMonth={visibleMonth}
          onVisibleMonthChange={setVisibleMonth}
          itemCounts={calendarCounts}
        />
      </Flex>
      <Flex vertical container="fill" className={styles.main}>
        <Flex container="fixed" align="center" className={styles.toolbar}>
          <h1 className={styles.title}>{formatAgendaTitle(selectedDate)}</h1>
        </Flex>
        <Flex container="fill" className={styles.content}>
          <TodoAgendaSections
            groups={[
              ...(isSelectedToday
                ? [{ key: 'expired', label: '已过期', todoList: expiredTodos }]
                : []),
              { key: 'scheduled', label: '未完成', todoList: scheduledTodos },
              { key: 'done', label: '已完成', todoList: doneTodos },
              { key: 'abandoned', label: '已放弃', todoList: abandonedTodos },
            ]}
            emptyLabel="当天没有待办"
            onClickTodo={showTodoDetail}
            refreshTodoList={refreshData}
          />
        </Flex>
      </Flex>
    </Flex>
    </ProductSurface>
  );
}
