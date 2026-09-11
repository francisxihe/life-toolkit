'use client';

import { Tag, Popover, Button, Flex, Tooltip } from '@sue/design-web-react';
import { CirclePlay, Ellipsis, Flag, Flame } from 'lucide-react';
import IconSelector from '../../components/IconSelector';
import { URGENCY_MAP, IMPORTANCE_MAP } from '../../constants';
import { TaskService } from '@true-north/web-service';
import { TaskWithoutRelationsVo } from '@true-north/vo';
import { TaskStatus } from '@true-north/enum';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { useFocusTimer } from '../../focus-timer';
import styles from './style.module.less';
import { emitTaskChanged } from '../../events';

export type TaskItemProps = {
  task: TaskWithoutRelationsVo;
  onClickTask: (id: string) => Promise<void>;
  refreshTaskList: () => Promise<void>;
  TriggerCheckbox: React.ReactNode;
};

function formatPlanRange(task: TaskWithoutRelationsVo) {
  const start = task.startAt ? dayjs(task.startAt).format('YYYY-MM-DD') : '';
  const end = task.endAt ? dayjs(task.endAt).format('YYYY-MM-DD') : '';
  if (start && end) return `${start} - ${end}`;
  return start || end || '';
}

function isPlanOverdue(task: TaskWithoutRelationsVo) {
  if (!task.endAt) return false;
  return dayjs(task.endAt).format('YYYY-MM-DD') < dayjs().format('YYYY-MM-DD');
}

function TaskItem(props: TaskItemProps) {
  const { task } = props;
  const { open: openFocusTimer } = useFocusTimer();
  const isActive =
    task.status === TaskStatus.TODO || task.status === TaskStatus.DOING;
  const planRange = formatPlanRange(task);

  return (
    <Flex
      className={clsx(styles.taskItem, styles.itemLayout, {
        [styles.done]: task.status === TaskStatus.DONE,
        [styles.abandoned]: task.status === TaskStatus.ABANDONED,
      })}
      align="center"
      gap={12}
    >
      <Flex container="fixed" className={styles.checkbox} align="flex-start">
        {props.TriggerCheckbox}
      </Flex>
      <span
        className={clsx(styles.statusIndicator, {
          [styles.statusDone]: task.status === TaskStatus.DONE,
          [styles.statusAbandoned]: task.status === TaskStatus.ABANDONED,
        })}
        aria-hidden="true"
      />
      <Flex
        vertical
        container="fill"
        onClick={() => void props.onClickTask(task.id)}
        className={styles.content}
      >
        <Flex className={styles.header} align="center" gap={12}>
          <Tooltip title={task.description}>
            <Flex
              container="fixed"
              className={styles.title}
              align="center"
              gap={5}
            >
              {task.name}
            </Flex>
          </Tooltip>
          <Flex
            container="fixed"
            className={styles.meta}
            align="center"
            wrap
            gap={8}
          >
            {task.importance ? (
              <IconSelector
                map={IMPORTANCE_MAP}
                icon={Flag}
                value={task.importance}
                readonly
              />
            ) : null}
            {task.urgency ? (
              <IconSelector
                map={URGENCY_MAP}
                icon={Flame}
                value={task.urgency}
                readonly
              />
            ) : null}
            {task.tags?.length > 0 && (
              <Flex wrap gap={4}>
                {task.tags.map((tag, index) => (
                  <Tag key={index} color="blue">
                    {tag}
                  </Tag>
                ))}
              </Flex>
            )}
          </Flex>
          {planRange ? (
            <Flex container="fill" justify="flex-end">
              <span
                className={isPlanOverdue(task) ? styles.overdue : styles.date}
              >
                {planRange}
              </span>
            </Flex>
          ) : null}
        </Flex>
      </Flex>
      <Flex
        container="fixed"
        className={styles.executionActions}
        align="center"
        gap={8}
      >
        {isActive && (
          <Tooltip title="开始专注">
            <Button
              size="small"
              icon={<CirclePlay size={16} />}
              aria-label={`为${task.name}开始专注`}
              onClick={(event) => {
                event.stopPropagation();
                openFocusTimer({ taskId: task.id, label: task.name });
              }}
            />
          </Tooltip>
        )}
        <Popover
          trigger="click"
          content={
            <div className={styles.menu}>
              {task.status === TaskStatus.TODO && (
                <div
                  className={styles.menuItem}
                  onClick={async (event) => {
                    event.stopPropagation();
                    await TaskService.start(task.id);
                    emitTaskChanged();
                    await props.refreshTaskList();
                  }}
                >
                  开始
                </div>
              )}
              {task.status === TaskStatus.DOING && (
                <div
                  className={styles.menuItem}
                  onClick={async (event) => {
                    event.stopPropagation();
                    await TaskService.pause(task.id);
                    emitTaskChanged();
                    await props.refreshTaskList();
                  }}
                >
                  暂停
                </div>
              )}
              {isActive && (
                <div
                  className={styles.menuItem}
                  onClick={async (event) => {
                    event.stopPropagation();
                    await TaskService.abandon(task.id);
                    emitTaskChanged();
                    await props.refreshTaskList();
                  }}
                >
                  放弃
                </div>
              )}
              <div
                className={styles.menuItem}
                onClick={async (event) => {
                  event.stopPropagation();
                  await TaskService.delete(task.id);
                  emitTaskChanged();
                  await props.refreshTaskList();
                }}
              >
                删除
              </div>
            </div>
          }
        >
          <Button
            onClick={(e) => e.stopPropagation()}
            type="text"
            size="small"
            icon={<Ellipsis size={16} />}
            className={styles.moreButton}
          />
        </Popover>
      </Flex>
    </Flex>
  );
}

export default TaskItem;
