import dayjs, { Dayjs } from 'dayjs';
import { useCalendarContext } from './context';
import { TodoVo, TodoStatus } from '@life-toolkit/vo/growth';
import TodoDetail from '../components/TodoDetail';
import { openModal } from '@/hooks/OpenModal';
import { TodoFormData } from '../../service';
import { useState, useRef, useMemo } from 'react';
import clsx from 'clsx';
import { useAddTodoModal } from '../../components/AddTodo';

function TodoItem({ todo }: { todo: TodoVo }) {
  const { getTodoList } = useCalendarContext();
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        openModal({
          title: <div className="text-body-3">编辑</div>,
          content: (
            <div className="ml-[-6px]">
              <TodoDetail
                todo={todo}
                onClose={null}
                onChange={async () => {
                  console.log('onChange');
                }}
              />
            </div>
          ),
          onCancel: () => {
            getTodoList();
          },
        });
      }}
      className={clsx([
        `min-w-[200px] text-body-1 px-1.5 leading-[20px] rounded-[2px] truncate cursor-pointer`,
        todo.status === TodoStatus.DONE
          ? 'text-success bg-success-light hover:bg-success-light-hover active:bg-success-light-active'
          : '',
        todo.status === TodoStatus.TODO
          ? 'text-warning bg-warning-light hover:bg-warning-light-hover active:bg-warning-light-active'
          : '',
      ])}
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

  // const [showMoreTodo, setShowMoreTodo] = useState(false);

  const { open: openAddTodoModal } = useAddTodoModal();

  const todoFormDataRef = useRef<TodoFormData>();

  return (
    <div className={`!text-body-3 text-text-1 h-full`}>
      <div
        className={`p-1 h-full cursor-pointer ${
          cellDate.isBefore(pageShowDate, 'month') ||
          cellDate.isAfter(pageShowDate, 'month')
            ? 'opacity-50'
            : ''
        }`}
        onDoubleClick={() => {
          openAddTodoModal({
            initialFormData: {
              planDate: cellDate.format('YYYY-MM-DD'),
            },
            afterSubmit: async (todoFormData) => {
              getTodoList();
            },
          });
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
            {/* {todayTodoList.length > 3 && (
              <div>
                <Popover
                  position="bl"
                  popupVisible={showMoreTodo}
                  trigger={'click'}
                  content={
                    <div className="mt-1 flex flex-col gap-0.5">
                      {todayTodoList
                        .slice(3, todayTodoList.length)
                        .map((todo) => (
                          <TodoItem key={todo.id} todo={todo} />
                        ))}
                    </div>
                  }
                >
                  <span
                    className="text-text-2 cursor-pointer px-1 rounded-xs hover:bg-fill active:bg-fill-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMoreTodo(true);
                      // handleEditEvent(event);
                    }}
                  >
                    +{todayTodoList.length - 3}
                  </span>
                </Popover>
              </div>
            )} */}
          </>
        )}
      </div>
    </div>
  );
}
