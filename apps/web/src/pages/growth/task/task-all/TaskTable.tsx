import { Table, Button, Modal, Card } from '@arco-design/web-react';
import dayjs from 'dayjs';
import { URGENCY_MAP, IMPORTANCE_MAP } from '../constants';
import { useTaskAllContext } from './context';
import { useEffect, useState } from 'react';
import { TaskService } from '../../service';
import { TaskVo, TaskStatus } from '@life-toolkit/vo/growth';
import { useTaskDetailDrawer } from '../components/TaskDetail';

export default function TaskTable() {
  const { taskList, getTaskPage } = useTaskAllContext();

  useEffect(() => {
    async function initData() {
      await getTaskPage();
      taskList.forEach((item) => {
        setSubTaskLoadingStatus((prev) => ({
          ...prev,
          [item.id]: 'unLoading',
        }));
      });
    }
    initData();
  }, []);

  const {
    open: openTaskDetailDrawer,
    close: closeTaskDetailDrawer,
    TaskDetailDrawer,
  } = useTaskDetailDrawer({
    title: <div className="text-body-3">编辑</div>,
    onCancel: () => {
      closeTaskDetailDrawer();
      getTaskPage();
    },
  });

  const columns = [
    { title: '任务', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        switch (record.status) {
          case TaskStatus.DONE:
            return (
              <div className="text-success">
                已完成({dayjs(record.doneAt).format('YY-MM-DD HH:mm')})
              </div>
            );
          case TaskStatus.TODO:
            return <div className="text-warning">未完成</div>;
          case TaskStatus.ABANDONED:
            return (
              <div className="text-danger">
                已放弃({dayjs(record.abandonedAt).format('YY-MM-DD HH:mm')})
              </div>
            );
          default:
            return '--';
        }
      },
    },
    {
      title: '计划日期',
      key: 'planDate',
      render: (_, record) => (
        <div>
          {dayjs(record.planDate).format('YYYY-MM-DD')}
          {record.planStart &&
            record.planEnd &&
            `${dayjs(record.planStart).format('YYYY-MM-DD')}
             - ${dayjs(record.planEnd).format('YYYY-MM-DD')}`}
        </div>
      ),
    },
    {
      title: '紧急程度',
      key: 'urgency',
      render: (_, record) => (
        <div>{URGENCY_MAP.get(record.urgency)?.label || '--'}</div>
      ),
    },
    {
      title: '重要程度',
      key: 'importance',
      render: (_, record) => (
        <div>{IMPORTANCE_MAP.get(record.importance)?.label || '--'}</div>
      ),
    },
    { title: '标签', dataIndex: 'tags', key: 'tags' },
    {
      title: <span className="text-text-1 font-medium px-4">操作</span>,
      key: 'action',
      render: (_, record) => (
        <div>
          <Button
            type="text"
            onClick={() => {
              openTaskDetailDrawer({
                task: record,
                onClose: null,
                onChange: async () => {
                  console.log('onChange');
                },
              });
            }}
          >
            编辑
          </Button>
          <Button
            type="text"
            onClick={() =>
              Modal.confirm({
                title: '确定删除吗？',
                content: '删除后将无法恢复',
                onOk: () => {
                  TaskService.deleteTask(record.id);
                  getTaskPage();
                },
              })
            }
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  const [expandedData, setExpandedData] = useState<Record<string, TaskVo>>({});
  const [subTaskLoadingStatus, setSubTaskLoadingStatus] = useState<
    Record<string, 'unLoading' | 'loading' | 'loaded' | 'error'>
  >({});
  const onExpandTable = async (record: TaskVo, expanded: boolean) => {
    if (!expanded) {
      return;
    }
    setSubTaskLoadingStatus((prev) => ({ ...prev, [record.id]: 'loading' }));
    const todoNode = await TaskService.getTaskWithTrackTime(record.id);
    setExpandedData((prev) => ({
      ...prev,
      [record.id]: todoNode,
    }));
    setSubTaskLoadingStatus((prev) => ({ ...prev, [record.id]: 'loaded' }));
  };

  return (
    <>
      <Table
        className="w-full"
        columns={columns}
        data={taskList}
        pagination={false}
        rowKey="id"
        onExpand={onExpandTable}
        expandedRowRender={(record) => {
          if (subTaskLoadingStatus[record.id] === 'unLoading') return true;
          if (subTaskLoadingStatus[record.id] === 'loading') {
            return (
              <Card
                loading={subTaskLoadingStatus[record.id] === 'loading'}
              ></Card>
            );
          }
          if (subTaskLoadingStatus[record.id] === 'loaded') {
            return expandedData[record.id]?.children?.length ? (
              <Card>
                {expandedData[record.id]?.children
                  .map((item) => item.name)
                  .join(',')}
              </Card>
            ) : null;
          }
        }}
      />
      <TaskDetailDrawer />
    </>
  );
}
