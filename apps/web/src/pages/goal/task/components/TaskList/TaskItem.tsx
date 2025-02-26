'use client';

import { Tag, Typography, Popover, Button } from '@arco-design/web-react';
import { isToday } from 'date-fns';
import FlexibleContainer from '@/components/FlexibleContainer';
import { URGENCY_MAP, IMPORTANCE_MAP } from '../../constants';
import IconSelector from '../IconSelector';
import SiteIcon from '@/components/SiteIcon';
import TaskService from '../../service';
import { TaskVo } from '@life-toolkit/vo/task';
import dayjs from 'dayjs';
import clsx from 'clsx';

const { Paragraph } = Typography;

export type TaskItemProps = {
  todo: {
    id: TaskVo['id'];
    name: TaskVo['name'];
    description?: TaskVo['description'];
    status?: TaskVo['status'];
    tags?: TaskVo['tags'];
    importance?: TaskVo['importance'];
    urgency?: TaskVo['urgency'];
    planStartAt?: TaskVo['planStartAt'];
    planEndAt?: TaskVo['planEndAt'];
    doneAt?: TaskVo['doneAt'];
    abandonedAt?: TaskVo['abandonedAt'];
  };
  onClickTask: (id: string) => Promise<void>;
  refreshTaskList: () => Promise<void>;
  TriggerCheckbox: React.ReactNode;
};

function TaskItem(props: TaskItemProps) {
  const { todo } = props;
  return (
    <div className={'w-full pl-4 py-2 bg-bg-3'} key={todo.id}>
      <FlexibleContainer direction="vertical" className="items-start">
        <FlexibleContainer.Fixed className="flex items-start ">
          {props.TriggerCheckbox}
        </FlexibleContainer.Fixed>
        <FlexibleContainer.Shrink
          onClick={() => props.onClickTask(todo.id)}
          className={clsx([
            'cursor-pointer border-b',
            'after:content-[""] after:block after:h-1 after:w-full',
          ])}
        >
          <div
            className={clsx(['flex items-center justify-between', 'leading-8'])}
          >
            <span className="text-text-1">{todo.name}</span>

            <div className="h-8 flex items-center">
              <Popover
                trigger="click"
                content={
                  <div className="w-40">
                    <div
                      className="cursor-pointer px-3 h-9 leading-9 hover:bg-fill-2"
                      onClick={() => {
                        TaskService.abandonTask(todo.id);
                        props.refreshTaskList();
                      }}
                    >
                      放弃
                    </div>
                    <div
                      className="cursor-pointer px-3 h-9 leading-9 hover:bg-fill-2"
                      onClick={() => {
                        TaskService.deleteTask(todo.id);
                        props.refreshTaskList();
                      }}
                    >
                      删除
                    </div>
                  </div>
                }
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
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
          <div className={clsx(['flex items-center gap-2', 'text-body-2'])}>
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
              <span
                className={
                  todo.planDate < dayjs().format('YYYY-MM-DD')
                    ? 'text-danger'
                    : 'text-text-3'
                }
              >
                {todo.planDate}
                {todo.planStartAt && todo.planEndAt && (
                  <>
                    {todo.planStartAt}-{todo.planEndAt}
                  </>
                )}
              </span>
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
  );
}

export default TaskItem;
