import { Table, Button, Modal, Card, Flex } from '@sue/design-web-react';
import dayjs from 'dayjs';
import { URGENCY_MAP, IMPORTANCE_MAP } from '../../constants';
import { useTaskAllContext } from './context';
import { useState } from 'react';
import { TaskService } from '@true-north/web-service';
import { TaskVo } from '@true-north/vo';
import { emitTaskChanged } from '../../events';
import { TaskStatus } from '@true-north/enum';
import { openTaskDetailDrawer } from '../detail/TaskDetailDrawer';

export default function TaskTable() {
  const {
    taskList,
    total,
    loading,
    filters,
    getTaskPage,
    setPage,
  } = useTaskAllContext();

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
          case TaskStatus.DOING:
            return <div className="text-primary">进行中</div>;
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
      render: (_, record) => {
        const start = record.startAt ? dayjs(record.startAt) : undefined;
        const end = record.endAt ? dayjs(record.endAt) : undefined;
        if (!start?.isValid() && !end?.isValid()) return '--';
        if (start?.isValid() && end?.isValid()) {
          const startText = start.format('YYYY-MM-DD HH:mm');
          const endText = end.format('YYYY-MM-DD HH:mm');
          return <div>{startText === endText ? startText : `${startText} - ${endText}`}</div>;
        }
        return <div>{(start || end)!.format('YYYY-MM-DD HH:mm')}</div>;
      },
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
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[] | undefined) => tags?.length ? tags.join('、') : '--',
    },
    {
      title: <span className="text-text-1 font-medium px-4">操作</span>,
      key: 'action',
      render: (_, record) => (
        <div>
          <Button
            type="text"
            onClick={() => {
              openTaskDetailDrawer({ taskId: record.id, onRefresh: getTaskPage });
            }}
          >
            查看
          </Button>
          <Button
            type="text"
            onClick={() =>
              Modal.confirm({
                title: '确定删除吗？',
                content: '删除后将无法恢复',
                onOk: async () => {
                  await TaskService.delete(record.id);
                  emitTaskChanged();
                  await getTaskPage();
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
    const todoNode = await TaskService.find(record.id);
    setExpandedData((prev) => ({
      ...prev,
      [record.id]: todoNode,
    }));
    setSubTaskLoadingStatus((prev) => ({ ...prev, [record.id]: 'loaded' }));
  };

  const canPrevious = filters.pageNum > 1;
  const canNext = filters.pageNum * filters.pageSize < total;

  const changePage = (pageNum: number) => {
    setPage(pageNum);
    void getTaskPage();
  };

  return (
    <Flex vertical container="full" className="gap-3">
      <Table
        className="w-full"
        columns={columns}
        dataSource={taskList}
        loading={loading}
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
      {total > 0 && (
        <Flex container="fixed" justify="space-between" align="center">
          <span className="text-body-2 text-text-2">
            第 {filters.pageNum} 页，共 {total} 个任务
          </span>
          <Flex gap={8}>
            <Button
              size="small"
              disabled={!canPrevious || loading}
              onClick={() => changePage(filters.pageNum - 1)}
            >
              上一页
            </Button>
            <Button
              size="small"
              disabled={!canNext || loading}
              onClick={() => changePage(filters.pageNum + 1)}
            >
              下一页
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}
