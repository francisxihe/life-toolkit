import { TodoList, TodoCreatorMini, TodoEditor } from '../../components';
import { useEffect, useState } from 'react';
import { FlexibleContainer } from 'francis-component-react';
import { Collapse, Divider } from '@arco-design/web-react';
import styles from './style.module.less';
import { TodoService } from '../../service';
import { TodoVo } from '@life-toolkit/vo';
import { flushSync } from 'react-dom';
import clsx from 'clsx';
import { useTodoContext } from '../context';
import { TodoStatus } from '@life-toolkit/enum';

const { Fixed, Shrink } = FlexibleContainer;

export default function TodoToday() {
  const { today, yesterday } = useTodoContext();
  const [todayTodoList, setTodayTodoList] = useState<TodoVo[]>([]);
  const [todayDoneTodoList, setTodayDoneTodoList] = useState<TodoVo[]>([]);
  const [expiredTodoList, setExpiredTodoList] = useState<TodoVo[]>([]);
  const [todayAbandonedTodoList, setTodayAbandonedTodoList] = useState<
    TodoVo[]
  >([]);

  async function refreshData() {
    const { list: todos } = await TodoService.getTodoListWithRepeat({
      status: TodoStatus.TODO,
      planDateStart: today,
      planDateEnd: today,
    });
    setTodayTodoList(todos);

    const { list: doneTodos } = await TodoService.getTodoListWithRepeat({
      status: TodoStatus.DONE,
      doneDateStart: today,
      doneDateEnd: today,
    });
    setTodayDoneTodoList(doneTodos);

    const { list: expiredTodos } = await TodoService.getTodoListWithRepeat({
      status: TodoStatus.TODO,
      planDateEnd: yesterday,
    });
    setExpiredTodoList(expiredTodos);

    const { list: abandonedTodos } = await TodoService.getTodoListWithRepeat({
      status: TodoStatus.ABANDONED,
      abandonedDateStart: today,
      abandonedDateEnd: today,
    });
    setTodayAbandonedTodoList(abandonedTodos);

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
    const todo = await TodoService.getTodoDetailWithRepeat(id);
    setCurrentTodo(todo);
  }

  return (
    <>
      <Shrink className="flex" direction="vertical">
        <Shrink className="py-2" direction="horizontal">
          <Fixed>
            <TodoCreatorMini
              afterSubmit={async () => {
                refreshData();
              }}
            />
          </Fixed>
          <Shrink absolute overflowY="auto">
            <Collapse
              defaultActiveKey={['expired', 'today']}
              className={clsx(styles['custom-collapse'])}
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
              {todayTodoList.length > 0 && (
                <Collapse.Item
                  header="今天"
                  name="today"
                  contentStyle={{ padding: 0 }}
                >
                  <TodoList
                    todoList={todayTodoList}
                    onClickTodo={async (id) => {
                      await showTodoDetail(id);
                    }}
                    refreshTodoList={async () => {
                      await refreshData();
                    }}
                  />
                </Collapse.Item>
              )}
              {todayDoneTodoList.length > 0 && (
                <Collapse.Item
                  header="已完成"
                  name="done"
                  contentStyle={{ padding: 0 }}
                >
                  <TodoList
                    todoList={todayDoneTodoList}
                    onClickTodo={async (id) => {
                      await showTodoDetail(id);
                    }}
                    refreshTodoList={async () => {
                      await refreshData();
                    }}
                  />
                </Collapse.Item>
              )}
              {todayAbandonedTodoList.length > 0 && (
                <Collapse.Item
                  header="已放弃"
                  name="abandoned"
                  contentStyle={{ padding: 0 }}
                >
                  <TodoList
                    todoList={todayAbandonedTodoList}
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
          </Shrink>
        </Shrink>
        {currentTodo && (
          <>
            <Divider type="vertical" className="!h-full" />{' '}
            <Shrink className="w-1/2 py-2">
              <TodoEditor
                todo={currentTodo}
                onClose={async () => {
                  showTodoDetail(null);
                }}
                afterSubmit={async () => {
                  refreshData();
                }}
              />
            </Shrink>
          </>
        )}
      </Shrink>
    </>
  );
}
