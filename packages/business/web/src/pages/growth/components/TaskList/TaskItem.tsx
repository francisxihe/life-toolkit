'use client';

import { Tag, Typography, Popover, Button } from '@arco-design/web-react';
import { isToday } from 'date-fns';
import { FlexibleContainer } from 'francis-component-react';
import IconSelector from '../../components/IconSelector';
import { SiteIcon } from '@life-toolkit/components-web-ui';
import { URGENCY_MAP, IMPORTANCE_MAP } from '../../constants';
import { TaskService } from '../../service';
import { TaskModelVo } from '@life-toolkit/vo/growth';
import dayjs from 'dayjs';
import clsx from 'clsx';

const { Paragraph } = Typography;

export type TaskItemProps = {
  task: TaskModelVo;
  onClickTask: (id: string) => Promise<void>;
  refreshTaskList: () => Promise<void>;
  TriggerCheckbox: React.ReactNode;
};

function TaskItem(props: TaskItemProps) {
  const { task } = props;
  return (
    <div className={'w-full pl-4 py-2 bg-bg-3'} key={task.id}>
      <FlexibleContainer direction="vertical" className="items-start">
        <FlexibleContainer.Fixed className="flex items-start ">
          {props.TriggerCheckbox}
        </FlexibleContainer.Fixed>
        <FlexibleContainer.Shrink
          onClick={() => props.onClickTask(task.id)}
          className={clsx([
            'cursor-pointer border-b',
            'after:content-[""] after:block after:h-1 after:w-full',
          ])}
        >
          <div
            className={clsx(['flex items-center justify-between', 'leading-8'])}
          >
            <span className="text-text-1">{task.name}</span>

            <div className="h-8 flex items-center">
              <Popover
                trigger="click"
                content={
                  <div className="w-40">
                    <div
                      className="cursor-pointer px-3 h-9 leading-9 hover:bg-fill-2"
                      onClick={() => {
                        TaskService.abandonTask(task.id);
                        props.refreshTaskList();
                      }}
                    >
                      放弃
                    </div>
                    <div
                      className="cursor-pointer px-3 h-9 leading-9 hover:bg-fill-2"
                      onClick={() => {
                        TaskService.deleteTask(task.id);
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
          {task.description && (
            <Paragraph
              className="text-body-1 !mb-0.5"
              style={{
                textDecoration:
                  task.status === 'done' ? 'line-through' : 'none',
                color: 'var(--color-text-3)',
              }}
            >
              {task.description}
            </Paragraph>
          )}
          <div className={clsx(['flex items-center gap-2', 'text-body-2'])}>
            {task.importance && (
              <IconSelector
                map={IMPORTANCE_MAP}
                iconName="priority-0"
                value={task.importance}
                readonly
              />
            )}

            {task.urgency && (
              <IconSelector
                map={URGENCY_MAP}
                iconName="urgency"
                value={task.urgency}
                readonly
              />
            )}
            {task.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
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
