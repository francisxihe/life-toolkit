import TodoList from '../components/TodoList';
import AddTodo from '../components/AddTodo';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import FlexibleContainer from '@/components/FlexibleContainer';
import { Collapse, Divider } from '@arco-design/web-react';
import TodoDetail from '../components/TodoDetail';
import styles from './style.module.less';
import TodoService from '../service/api';
import { Todo } from '../service/types';
import { flushSync } from 'react-dom';

const weekStart = dayjs().startOf('week').format('YYYY-MM-DD');
const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD');

export default function TodoWeek() {
  const [weekTodoList, setWeekTodoList] = useState<Todo[]>([]);
  const [weekDoneTodoList, setWeekDoneTodoList] = useState<Todo[]>([]);
  const [expiredTodoList, setExpiredTodoList] = useState<Todo[]>([]);
  const [weekAbandonedTodoList, setWeekAbandonedTodoList] = useState<Todo[]>(
    []
  );

  async function refreshData() {
    const todos = await TodoService.getTodoList({
      status: 'todo',
      planDateStart: weekStart,
      planDateEnd: weekEnd,
    });
    setWeekTodoList(todos);

    const doneTodos = await TodoService.getTodoList({
      status: 'done',
      doneDateStart: weekStart,
      doneDateEnd: weekEnd,
    });
    setWeekDoneTodoList(doneTodos);

    const expiredTodos = await TodoService.getTodoList({
      status: 'todo',
      planDateEnd: weekStart,
    });
    setExpiredTodoList(expiredTodos);

    const abandonedTodos = await TodoService.getTodoList({
      status: 'abandoned',
      abandonedDateStart: weekStart,
      abandonedDateEnd: weekEnd,
    });
    setWeekAbandonedTodoList(abandonedTodos);

    if (currentTodo) {
      showTodoDetail(currentTodo);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null);

  async function showTodoDetail(todo: Todo) {
    flushSync(() => {
      setCurrentTodo(null);
    });
    setCurrentTodo(todo);
  }

  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <FlexibleContainer.Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-[500] py-1">本周待办</div>
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Shrink className="px-5 w-full h-full flex">
        <div className="w-full py-2">
          <AddTodo
            onSubmit={async (todoFormData) => {
              await TodoService.addTodo({
                name: todoFormData.name,
                importance: todoFormData.importance,
                urgency: todoFormData.urgency,
                planDate: todoFormData.planDate || undefined,
                planStartAt: todoFormData.planTimeRange?.[0] || undefined,
                planEndAt: todoFormData.planTimeRange?.[1] || undefined,
                recurring: todoFormData.recurring,
                tags: todoFormData.tags,
              });
              refreshData();
            }}
          />
          <Collapse
            defaultActiveKey={['expired', 'week']}
            className={`${styles['custom-collapse']} mt-2`}
            bordered={false}
          >
            {expiredTodoList.length > 0 && (
              <Collapse.Item
                header="已过期"
                name="expired"
                contentStyle={{ padding: 0 }}
              >
                <TodoList
                  todoList={expiredTodoList}
                  onClickTodo={async (todo) => {
                    await showTodoDetail(todo);
                  }}
                  refreshTodoList={async () => {
                    await refreshData();
                  }}
                />
              </Collapse.Item>
            )}
            {weekTodoList.length > 0 && (
              <Collapse.Item
                header="本周"
                name="week"
                contentStyle={{ padding: 0 }}
              >
                <TodoList
                  todoList={weekTodoList}
                  onClickTodo={async (todo) => {
                    await showTodoDetail(todo);
                  }}
                  refreshTodoList={async () => {
                    await refreshData();
                  }}
                />
              </Collapse.Item>
            )}
            {weekDoneTodoList.length > 0 && (
              <Collapse.Item
                header="已完成"
                name="done"
                contentStyle={{ padding: 0 }}
              >
                <TodoList
                  todoList={weekDoneTodoList}
                  onClickTodo={async (todo) => {
                    await showTodoDetail(todo);
                  }}
                  refreshTodoList={async () => {
                    await refreshData();
                  }}
                />
              </Collapse.Item>
            )}
            {weekAbandonedTodoList.length > 0 && (
              <Collapse.Item
                header="已放弃"
                name="abandoned"
                contentStyle={{ padding: 0 }}
              >
                <TodoList
                  todoList={weekAbandonedTodoList}
                  onClickTodo={async (todo) => {
                    await showTodoDetail(todo);
                  }}
                  refreshTodoList={async () => {
                    await refreshData();
                  }}
                />
              </Collapse.Item>
            )}
          </Collapse>
        </div>
        {currentTodo && (
          <>
            <Divider type="vertical" className="!h-full" />{' '}
            <div className="w-full py-2">
              <TodoDetail
                todo={currentTodo}
                onClose={async () => {
                  showTodoDetail(null);
                }}
                onChange={async (todo) => {
                  refreshData();
                }}
              />
            </div>
          </>
        )}
      </FlexibleContainer.Shrink>
    </FlexibleContainer>
  );
}
