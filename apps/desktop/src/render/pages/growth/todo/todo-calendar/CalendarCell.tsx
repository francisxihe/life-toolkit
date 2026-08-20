import dayjs, { Dayjs } from 'dayjs';
import { Flex } from '@sue/design-web-react';
import { useCalendarContext } from './context';
import { TodoVo } from '@true-north/vo';
import { TodoStatus } from '@true-north/enum';
import { useMemo } from 'react';
import clsx from 'clsx';
import { useTodoDetail } from '../../components';
import SiteIcon from '@/components/SiteIcon';
import styles from './style.module.less';

function TodoItem({ todo }: { todo: TodoVo }) {
  const { getTodoList } = useCalendarContext();
  const { openEditDrawer: openEditTodoDrawer } = useTodoDetail();
  return (
    <div
      className={clsx([
        `text-body-1 px-1.5 leading-[20px] rounded-[2px] truncate cursor-pointer`,
        todo.status === TodoStatus.DONE
          ? 'text-success bg-success-light hover:bg-success-light-hover active:bg-success-light-active'
          : '',
        todo.status === TodoStatus.TODO
          ? 'text-warning bg-warning-light hover:bg-warning-light-hover active:bg-warning-light-active'
          : '',
      ])}
      onClick={(e) => {
        e.stopPropagation();
        openEditTodoDrawer({
          contentProps: {
            todo,
            afterSubmit: async () => {
              getTodoList();
            },
          },
        });
      }}
    >
      {todo.name}
    </div>
  );
}

export default function CalendarCell({ cellDate }: { cellDate: Dayjs }) {
  const {
    todoList,
    pageShowDate,
    showAddTaskDate,
    getTodoList,
    setShowAddTaskDate,
  } = useCalendarContext();

  const todayTodoList = useMemo(() => {
    return todoList.filter((todo) =>
      dayjs(todo.planDate).isSame(cellDate, 'day'),
    );
  }, [cellDate, todoList]);

  const { openCreateDrawer } = useTodoDetail();

  return (
    <div className={styles.cell}>
      <div
        className={clsx(styles.cellContent, {
          [styles.cellOutsideMonth]:
          cellDate.isBefore(pageShowDate, 'month') ||
          cellDate.isAfter(pageShowDate, 'month'),
        })}
        onMouseEnter={() => {
          setShowAddTaskDate(cellDate);
        }}
        onMouseLeave={() => setShowAddTaskDate(null)}
      >
        <div className={styles.cellDate}>{cellDate.date()}</div>
        <>
            <Flex vertical gap={2}>
              {todayTodoList.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </Flex>
            {showAddTaskDate?.isSame(cellDate) && (
              <div className={styles.cellCreate}>
                <Flex
                  align="center"
                  gap={4}
                  className={clsx([
                    'w-full text-body-1 px-1.5 leading-[20px] rounded-[2px]',
                    'text-text-2 truncate cursor-pointer',
                    'opacity-0.75 bg-secondary hover:bg-secondary-hover active:bg-secondary-active',
                  ])}
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreateDrawer({
                      contentProps: {
                        initialFormData: {
                          planDate: cellDate.format('YYYY-MM-DD'),
                        },
                        afterSubmit: async () => {
                          await getTodoList();
                        },
                      },
                    });
                  }}
                >
                  <SiteIcon id="add" className="w-3 h-3" />
                  添加待办
                </Flex>
              </div>
            )}
        </>
      </div>
    </div>
  );
}
