'use client';

import { Tag, Popover, Button, Flex, Tooltip } from '@sue/design-web-react';
import { CheckOutlined, PlayCircleOutlined } from '@ant-design/icons';
import SiteIcon from '@/components/SiteIcon';
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
};

function formatPlanRange(task: TaskWithoutRelationsVo) {
  const start = task.startAt ? dayjs(task.startAt).format('YYYY-MM-DD') : '';
  const end = task.endAt ? dayjs(task.endAt).format('YYYY-MM-DD') : '';
  if (start && end) return `${start} - ${end}`;
  return start || end || '';
}

function TaskItem(props: TaskItemProps) {
  const { task } = props;
  const { open: openFocusTimer } = useFocusTimer();
  const isActive = task.status === TaskStatus.TODO || task.status === TaskStatus.DOING;
  const planRange = formatPlanRange(task);

  return (
    <div
      className={clsx(styles.taskItem, {
        [styles.done]: task.status === TaskStatus.DONE,
        [styles.abandoned]: task.status === TaskStatus.ABANDONED,
      })}
    >
      <Flex align="center" gap={12} className={styles.row}>
        <span
          className={clsx(styles.statusIndicator, {
            [styles.statusDone]: task.status === TaskStatus.DONE,
            [styles.statusAbandoned]: task.status === TaskStatus.ABANDONED,
          })}
          aria-hidden="true"
        />
        <button
          type="button"
          className={styles.executionContent}
          onClick={() => void props.onClickTask(task.id)}
        >
          <Flex vertical gap={2}>
            <span className={styles.title}>{task.name}</span>
            <span className={styles.executionMeta}>
              {[planRange, task.description].filter(Boolean).join(' · ') || '打开详情'}
            </span>
          </Flex>
        </button>
        <Flex className={styles.executionActions} align="center" gap={8} container="fixed">
          {task.importance ? (
            <IconSelector map={IMPORTANCE_MAP} iconName="priority-0" value={task.importance} readonly />
          ) : null}
          {task.urgency ? (
            <IconSelector map={URGENCY_MAP} iconName="urgency" value={task.urgency} readonly />
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
          {isActive && (
            <Tooltip title="完成">
              <Button
                size="small"
                icon={<CheckOutlined />}
                aria-label={`完成 ${task.name}`}
                onClick={async (event) => {
                  event.stopPropagation();
                  await TaskService.markDone(task.id);
                  emitTaskChanged();
                  await props.refreshTaskList();
                }}
              />
            </Tooltip>
          )}
          {isActive && (
            <Tooltip title="开始专注">
              <Button
                size="small"
                icon={<PlayCircleOutlined />}
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
              icon={<SiteIcon id="more-for-task" />}
              className={styles.moreButton}
            />
          </Popover>
        </Flex>
      </Flex>
    </div>
  );
}

export default TaskItem;
