import TaskList from '../../components/TaskList';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { Collapse, Divider, Button } from '@arco-design/web-react';
import styles from './style.module.less';
import { TaskService } from '../../service';
import { flushSync } from 'react-dom';
import { TaskStatus, TaskItemVo } from '@life-toolkit/vo/growth';
import SiteIcon from '@/components/SiteIcon';
import { useTaskDetail, TaskEditor } from '../../components';

const weekStart = dayjs().startOf('week').format('YYYY-MM-DD');
const weekEnd = dayjs().endOf('week').format('YYYY-MM-DD');

export default function TaskWeek() {
  const [weekTaskList, setWeekTaskList] = useState<TaskItemVo[]>([]);
  const [weekDoneTaskList, setWeekDoneTaskList] = useState<TaskItemVo[]>([]);
  const [expiredTaskList, setExpiredTaskList] = useState<TaskItemVo[]>([]);
  const [weekAbandonedTaskList, setWeekAbandonedTaskList] = useState<
    TaskItemVo[]
  >([]);

  async function refreshData() {
    const { list: todos } = await TaskService.getTaskList({
      status: TaskStatus.TODO,
      startAt: weekStart,
      endAt: weekEnd,
    });
    setWeekTaskList(todos);

    const { list: doneTasks } = await TaskService.getTaskList({
      status: TaskStatus.DONE,
      doneDateStart: weekStart,
      doneDateEnd: weekEnd,
    });
    setWeekDoneTaskList(doneTasks);

    const { list: expiredTasks } = await TaskService.getTaskList({
      status: TaskStatus.TODO,
      endAt: weekStart,
    });
    setExpiredTaskList(expiredTasks);

    const { list: abandonedTasks } = await TaskService.getTaskList({
      status: TaskStatus.ABANDONED,
      abandonedDateStart: weekStart,
      abandonedDateEnd: weekEnd,
    });
    setWeekAbandonedTaskList(abandonedTasks);

    if (currentTask) {
      showTaskDetail(currentTask.id);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  const [currentTask, setCurrentTask] = useState<TaskItemVo | null>(null);

  async function showTaskDetail(id: string) {
    flushSync(() => {
      setCurrentTask(null);
    });
    const todo = await TaskService.getTaskWithTrackTime(id);
    setCurrentTask(todo);
  }

  const { CreatePopover: CreateTaskPopover } = useTaskDetail();

  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <FlexibleContainer.Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-medium py-1">
          本周任务
        </div>
      </FlexibleContainer.Fixed>

      <FlexibleContainer.Shrink className="px-5 w-full h-full flex">
        <div className="w-full py-2">
          <CreateTaskPopover
            creatorProps={{
              afterSubmit: async () => {
                await refreshData();
              },
            }}
          >
            <Button className="!px-2" type="text" size="small">
              <div className="flex items-center gap-1">
                <SiteIcon id="add" />
                添加任务
              </div>
            </Button>
          </CreateTaskPopover>
          <Collapse
            defaultActiveKey={['expired', 'week']}
            className={`${styles['custom-collapse']} mt-2`}
            bordered={false}
          >
            {expiredTaskList.length > 0 && (
              <Collapse.Item
                header="已过期"
                name="expired"
                contentStyle={{ padding: 0 }}
              >
                <TaskList
                  taskList={expiredTaskList}
                  onClickTask={async (id) => {
                    await showTaskDetail(id);
                  }}
                  refreshTaskList={async () => {
                    await refreshData();
                  }}
                />
              </Collapse.Item>
            )}
            {weekTaskList.length > 0 && (
              <Collapse.Item
                header="本周"
                name="week"
                contentStyle={{ padding: 0 }}
              >
                <TaskList
                  taskList={weekTaskList}
                  onClickTask={async (id) => {
                    await showTaskDetail(id);
                  }}
                  refreshTaskList={async () => {
                    await refreshData();
                  }}
                />
              </Collapse.Item>
            )}
            {weekDoneTaskList.length > 0 && (
              <Collapse.Item
                header="已完成"
                name="done"
                contentStyle={{ padding: 0 }}
              >
                <TaskList
                  taskList={weekDoneTaskList}
                  onClickTask={async (id) => {
                    await showTaskDetail(id);
                  }}
                  refreshTaskList={async () => {
                    await refreshData();
                  }}
                />
              </Collapse.Item>
            )}
            {weekAbandonedTaskList.length > 0 && (
              <Collapse.Item
                header="已放弃"
                name="abandoned"
                contentStyle={{ padding: 0 }}
              >
                <TaskList
                  taskList={weekAbandonedTaskList}
                  onClickTask={async (id) => {
                    await showTaskDetail(id);
                  }}
                  refreshTaskList={async () => {
                    await refreshData();
                  }}
                />
              </Collapse.Item>
            )}
          </Collapse>
        </div>
        {currentTask && (
          <>
            <Divider type="vertical" className="!h-full" />
            <div className="w-full py-2">
              <TaskEditor
                size="small"
                task={currentTask}
                onClose={async () => {
                  showTaskDetail(null);
                }}
                afterSubmit={async () => {
                  await refreshData();
                }}
              />
            </div>
          </>
        )}
      </FlexibleContainer.Shrink>
    </FlexibleContainer>
  );
}
