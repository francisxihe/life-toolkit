import dayjs, { Dayjs } from 'dayjs';
import { useCalendarContext } from './context';
import { TodoVo, TodoStatus } from '@life-toolkit/vo/growth';
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { useTodoDetail } from '../../components';
import SiteIcon from '@/components/SiteIcon';

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
            onClose: null,
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
  const { todoList, calendarMode, pageShowDate, getTodoList } =
    useCalendarContext();

  const todayTodoList = useMemo(() => {
    return todoList.filter((todo) =>
      dayjs(todo.planDate).isSame(cellDate, 'day'),
    );
  }, [cellDate, todoList]);

  const [showAddTask, setShowAddTask] = useState(false);

  const { CreatePopover: CreateTodoPopover } = useTodoDetail();

  return (
    <div className={`!text-body-3 text-text-1 h-full`}>
      <div
        className={`p-1 h-full ${
          cellDate.isBefore(pageShowDate, 'month') ||
          cellDate.isAfter(pageShowDate, 'month')
            ? 'opacity-50'
            : ''
        }`}
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
              {todayTodoList.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
            {showAddTask && (
              <CreateTodoPopover
                creatorProps={{
                  showSubmitButton: true,
                  initialFormData: {
                    planDate: cellDate.format('YYYY-MM-DD'),
                  },
                  afterSubmit: async () => {
                    getTodoList();
                  },
                }}
              >
                <div
                  className={clsx([
                    'mt-1',
                    `w-full text-body-1 px-1.5 leading-[20px] rounded-[2px]`,
                    'flex items-center gap-1',
                    'text-text-2 truncate cursor-pointer',
                    'opacity-0.75 bg-secondary hover:bg-secondary-hover active:bg-secondary-active',
                  ])}
                >
                  <SiteIcon id="add" className="w-3 h-3" />
                  添加任务
                </div>
              </CreateTodoPopover>
            )}
          </>
        )}
      </div>
    </div>
  );
}
