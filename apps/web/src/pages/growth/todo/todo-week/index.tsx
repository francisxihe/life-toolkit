import TodoList from '../components/TodoList/TodoList';
import AddTodo from '../components/AddTodo';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import FlexibleContainer from '@/components/FlexibleContainer';
import { Collapse, Divider } from '@arco-design/web-react';
import TodoDetail from '../components/TodoDetail';
import styles from './style.module.less';
import TodoService from '../service';
import { flushSync } from 'react-dom';
import { TodoVo } from '@life-toolkit/vo/todo';

const weekStart = dayjs().startOf('week').format('YYYY-MM-DD');
const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD');

export default function TodoWeek() {
  const [weekTodoList, setWeekTodoList] = useState<TodoVo[]>([]);
  const [weekDoneTodoList, setWeekDoneTodoList] = useState<TodoVo[]>([]);
  const [expiredTodoList, setExpiredTodoList] = useState<TodoVo[]>([]);
  const [weekAbandonedTodoList, setWeekAbandonedTodoList] = useState<TodoVo[]>(
    [],
  );

  async function refreshData() {
    const { list: todos } = await TodoService.getTodoList({
      status: 'todo',
      planDateStart: weekStart,
      planDateEnd: weekEnd,
    });
    setWeekTodoList(todos);

    const { list: doneTodos } = await TodoService.getTodoList({
      status: 'done',
      doneDateStart: weekStart,
      doneDateEnd: weekEnd,
    });
    setWeekDoneTodoList(doneTodos);

    const { list: expiredTodos } = await TodoService.getTodoList({
      status: 'todo',
      planDateEnd: weekStart,
    });
    setExpiredTodoList(expiredTodos);

    const { list: abandonedTodos } = await TodoService.getTodoList({
      status: 'abandoned',
      abandonedDateStart: weekStart,
      abandonedDateEnd: weekEnd,
    });
    setWeekAbandonedTodoList(abandonedTodos);

    if (currentTodo) {
      showTodoDetail(currentTodo.id);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const [currentTodo, setCurrentTodo] = useState<TodoVo | null>(null);

  async function showTodoDetail(id: string) {
    flushSync(() => {
      setCurrentTodo(null);
    });
    const todo = await TodoService.getTodoWithSub(id);
    setCurrentTodo(todo);
  }

  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <FlexibleContainer.Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-medium py-1">本周待办</div>
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Shrink className="px-5 w-full h-full flex">
        <div className="w-full py-2">
          <AddTodo
            onSubmit={async (todoFormData) => {
              await TodoService.addTodo({
                name: todoFormData.name,
                description: todoFormData.description,
                importance: todoFormData.importance,
                urgency: todoFormData.urgency,
                planDate: todoFormData.planDate || undefined,
                startAt: todoFormData.planTimeRange?.[0] || undefined,
                endAt: todoFormData.planTimeRange?.[1] || undefined,
                repeat: todoFormData.repeat,
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
                  onClickTodo={async (id) => {
                    await showTodoDetail(id);
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
                  onClickTodo={async (id) => {
                    await showTodoDetail(id);
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
                  onClickTodo={async (id) => {
                    await showTodoDetail(id);
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
                  onClickTodo={async (id) => {
                    await showTodoDetail(id);
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
