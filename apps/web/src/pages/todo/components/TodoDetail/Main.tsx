import { Input, Button, Popover } from '@arco-design/web-react';
import { useTodoDetailContext } from './context';
import TodoService from '../../service';
import TodoList from '../TodoList';
import SiteIcon from '@/components/SiteIcon';
import AddTodo from '../AddTodo';
import { useState, useCallback } from 'react';
import { SubTodoFormData, TodoFormData } from '../../types';

const TextArea = Input.TextArea;

export default function TodoDetailMain() {
  const {
    todoFormData,
    todoNode,
    setTodoFormData,
    onChange,
    refreshSubTodoFormData,
  } = useTodoDetailContext();

  const [subTodoFormData, setSubTodoFormData] =
    useState<SubTodoFormData | null>(null);
  const [addSubTodoVisible, setAddSubTodoVisible] = useState<boolean>(false);

  const onChangeSubTodo = useCallback(
    (todoFormData: TodoFormData) => {
      setSubTodoFormData(todoFormData);
    },
    [setSubTodoFormData]
  );

  const onClickSubmitSubTodo = useCallback(async () => {
    await TodoService.addSubTodo(todoNode.id, {
      name: subTodoFormData.name,
      importance: subTodoFormData.importance,
      urgency: subTodoFormData.urgency,
      planStartAt: subTodoFormData.planTimeRange?.[0] || undefined,
      planEndAt: subTodoFormData.planTimeRange?.[1] || undefined,
      tags: subTodoFormData.tags,
    });

    await refreshSubTodoFormData(todoNode);
    setAddSubTodoVisible(false);
  }, [subTodoFormData, todoNode, refreshSubTodoFormData]);

  return todoFormData ? (
    <>
      <Input
        value={todoFormData.name}
        placeholder="准备做什么?"
        type="primary"
        size="small"
        className="!text-text-1 !bg-transparent !border-none mb-1"
        onChange={(value) => {
          setTodoFormData((prev) => ({ ...prev, name: value }));
        }}
        onBlur={() => {
          onChange(todoFormData);
        }}
      />
      <TextArea
        autoSize={false}
        value={todoFormData.description}
        placeholder="描述一下"
        className="!text-text-3 !text-body-1 !bg-transparent !border-none mb-1"
        onChange={(value) => {
          setTodoFormData((prev) => ({
            ...prev,
            description: value,
          }));
        }}
      />
      <div>
        <TodoList
          todoList={todoNode.subTodoList}
          onClickTodo={async (todo) => {
            await refreshSubTodoFormData(todo);
          }}
          refreshTodoList={async () => {
            await refreshSubTodoFormData(todoNode);
          }}
        />
      </div>
      <Popover
        popupVisible={addSubTodoVisible}
        trigger="click"
        className={'w-80'}
        content={
          <div>
            <AddTodo
              hiddenDate
              onChange={onChangeSubTodo}
              onSubmit={onClickSubmitSubTodo}
            />
            <div className="flex items-center justify-end mt-2">
              <Button
                type="text"
                size="small"
                status="default"
                onClick={() => {
                  setAddSubTodoVisible(false);
                }}
              >
                取消
              </Button>
              <Button type="text" size="small" onClick={onClickSubmitSubTodo}>
                添加
              </Button>
            </div>
          </div>
        }
      >
        <Button
          type="text"
          size="small"
          onClick={() => {
            setAddSubTodoVisible(true);
          }}
        >
          <div className="flex items-center gap-1">
            <SiteIcon id="add" />
            添加子待办
          </div>
        </Button>
      </Popover>
    </>
  ) : (
    <></>
  );
}
