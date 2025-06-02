import { TodoList, TodoCreatorMini, TodoEditor } from '../../components';
import { useEffect, useState } from 'react';
import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { Collapse, Divider } from '@arco-design/web-react';
import styles from './style.module.less';
import { TodoService } from '../../service';
import { flushSync } from 'react-dom';
import { TodoVo, TodoStatus } from '@life-toolkit/vo/growth';
import { useTodoContext } from '../context';

const { Fixed, Shrink } = FlexibleContainer;

export default function TodoWeek() {
  const { weekStart, weekEnd } = useTodoContext();
  const [weekTodoList, setWeekTodoList] = useState<TodoVo[]>([]);
  const [weekDoneTodoList, setWeekDoneTodoList] = useState<TodoVo[]>([]);
  const [expiredTodoList, setExpiredTodoList] = useState<TodoVo[]>([]);
  const [weekAbandonedTodoList, setWeekAbandonedTodoList] = useState<TodoVo[]>(
    [],
  );

  async function refreshData() {
    const { list: todos } = await TodoService.getTodoList({
      status: TodoStatus.TODO,
      planDateStart: weekStart,
      planDateEnd: weekEnd,
    });
    setWeekTodoList(todos);

    const { list: doneTodos } = await TodoService.getTodoList({
      status: TodoStatus.DONE,
      doneDateStart: weekStart,
      doneDateEnd: weekEnd,
    });
    setWeekDoneTodoList(doneTodos);

    const { list: expiredTodos } = await TodoService.getTodoList({
      status: TodoStatus.TODO,
      planDateEnd: weekStart,
    });
    setExpiredTodoList(expiredTodos);

    const { list: abandonedTodos } = await TodoService.getTodoList({
      status: TodoStatus.ABANDONED,
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
    const todo = await TodoService.getTodo(id);
    setCurrentTodo(todo);
  }

  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-medium py-1">
          本周待办
        </div>
      </Fixed>

      <Shrink className="px-5 w-full h-full flex">
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
          </Shrink>
        </Shrink>
        {currentTodo && (
          <>
            <Divider type="vertical" className="!h-full" />{' '}
            <Shrink className="w-full py-2">
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
    </FlexibleContainer>
  );
}
