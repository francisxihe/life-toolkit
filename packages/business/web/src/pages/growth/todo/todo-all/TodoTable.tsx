import { Table, Button, Modal, Card, Divider } from '@arco-design/web-react';
import dayjs from 'dayjs';
import { URGENCY_MAP, IMPORTANCE_MAP } from '../../constants';
import { useTodoAllContext } from './context';
import { useEffect } from 'react';
import { TodoService } from '../../service';
import { openModal } from '@/hooks/OpenModal';
import { TodoEditor } from '../../components';
import { TodoStatus } from '@life-toolkit/enum';

export default function TodoTable() {
  const { todoList, getTodoPage } = useTodoAllContext();

  useEffect(() => {
    getTodoPage();
  }, []);

  const columns = [
    { title: '待办', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        switch (record.status) {
          case TodoStatus.DONE:
            return (
              <div className="text-success">
                已完成({dayjs(record.doneAt).format('YY-MM-DD HH:mm')})
              </div>
            );
          case TodoStatus.TODO:
            return <div className="text-warning">未完成</div>;
          case TodoStatus.ABANDONED:
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
              openModal({
                title: <div className="text-body-3">编辑</div>,
                content: (
                  <div className="ml-[-6px]">
                    <TodoEditor
                      todo={record}
                      onClose={null}
                      afterSubmit={async () => {
                        await getTodoPage();
                      }}
                    />
                  </div>
                ),
                onCancel: () => {
                  getTodoPage();
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
                onOk: async () => {
                  await TodoService.deleteTodo(record.id);
                  await getTodoPage();
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

  return (
    <>
      <Table
        className="w-full"
        columns={columns}
        data={todoList}
        pagination={false}
        rowKey="id"
      />
    </>
  );
}
