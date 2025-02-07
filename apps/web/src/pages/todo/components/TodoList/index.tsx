'use client';

import { Tag, Typography, Popover, Button } from '@arco-design/web-react';
import { Todo } from '../../service/types';
import { isToday } from 'date-fns';
import FlexibleContainer from '@/components/FlexibleContainer';
import { URGENCY_MAP, IMPORTANCE_MAP } from '../../constants';
import IconSelector from '../IconSelector';
import DoneTodoCheckbox from './DoneTodoCheckbox';
import SiteIcon from '@/components/SiteIcon';
import TodoService from '../../service';

const { Text, Paragraph } = Typography;

function TodoList(props: {
  todoList: Todo[];
  onClickTodo: (todo: Todo) => Promise<void>;
  refreshTodoList: () => Promise<void>;
}) {
  return (
    <div className="w-full mt-[-8px]">
      {props.todoList.map((todo) => (
        <div className={'w-full pl-4 py-2 bg-bg'} key={todo.id}>
          <FlexibleContainer direction="vertical" className="items-start">
            <FlexibleContainer.Fixed className="flex items-start ">
              <DoneTodoCheckbox
                todo={todo}
                onChange={async () => {
                  await props.refreshTodoList();
                }}
              />
            </FlexibleContainer.Fixed>
            <FlexibleContainer.Shrink
              onClick={() => props.onClickTodo(todo)}
              className="cursor-pointer border-b after:content-[''] after:block after:h-1 after:w-full"
            >
              <div className="leading-8 flex items-center justify-between">
                {todo.name}

                <div className="h-8 flex items-center">
                  <Popover
                    trigger="click"
                    content={
                      <div className="w-40">
                        <div
                          className="cursor-pointer px-3 h-9 leading-9 hover:bg-fill-2"
                          onClick={() => {
                            TodoService.abandonTodo(todo.id);
                            props.refreshTodoList();
                          }}
                        >
                          放弃
                        </div>
                        <div
                          className="cursor-pointer px-3 h-9 leading-9 hover:bg-fill-2"
                          onClick={() => {
                            TodoService.deleteTodo(todo.id);
                            props.refreshTodoList();
                          }}
                        >
                          删除
                        </div>
                      </div>
                    }
                  >
                    <Button
                      iconOnly
                      type="text"
                      size="mini"
                      icon={<SiteIcon id="more-for-task" />}
                      className="!flex justify-center items-center !text-text"
                    />
                  </Popover>
                </div>
              </div>
              {todo.description && (
                <Paragraph
                  className="text-body-1 !mb-0.5"
                  style={{
                    textDecoration:
                      todo.status === 'done' ? 'line-through' : 'none',
                    color: 'var(--color-text-3)',
                  }}
                >
                  {todo.description}
                </Paragraph>
              )}
              <div className="text-body-2 flex items-center gap-2">
                {todo.importance && (
                  <IconSelector
                    map={IMPORTANCE_MAP}
                    iconName="priority-0"
                    value={todo.importance}
                    readonly
                  />
                )}

                {todo.urgency && (
                  <IconSelector
                    map={URGENCY_MAP}
                    iconName="urgency"
                    value={todo.urgency}
                    readonly
                  />
                )}

                {!isToday(todo.planDate) && (
                  <Text type="error">
                    {todo.planDate}{' '}
                    {todo.planStartAt && todo.planEndAt && (
                      <>
                        {todo.planStartAt}-{todo.planEndAt}
                      </>
                    )}
                  </Text>
                )}
                {todo.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {todo.tags.map((tag, index) => (
                      <Tag key={index} color="arcoblue">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </FlexibleContainer.Shrink>
          </FlexibleContainer>
        </div>
      ))}
    </div>
  );
}

export default TodoList;
