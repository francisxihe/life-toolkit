import type { TableColumnProps } from '@sue/design-web-react';
import { Table, Button, Modal, message, Tag, Flex } from '@sue/design-web-react';
import dayjs from 'dayjs';
import { URGENCY_MAP, IMPORTANCE_MAP } from '../../constants';
import { useTodoAllContext } from './context';
import { TodoService } from '@true-north/web-service';
import {
  useTodoDetail,
  formatTodoPlanTime,
  isTodoPlanRange,
} from '../../components';
import { TodoRelatedType, TodoStatus } from '@true-north/enum';

import { TodoVo } from '@true-north/vo';
import { emitTodoChanged } from '../../events';
import { useFocusTimer } from '../../focus-timer';

function relatedTypeLabel(relatedType?: TodoRelatedType): string {
  switch (relatedType) {
    case TodoRelatedType.TASK:
      return '任务';
    case TodoRelatedType.GOAL:
      return '目标';
    case TodoRelatedType.HABIT:
      return '习惯';
    case TodoRelatedType.IS_REPEAT:
      return '独立重复';
    case TodoRelatedType.REPEAT:
      return '独立重复';
    case TodoRelatedType.NONE:
    default:
      return '独立';
  }
}

function isRepeatSeries(relatedType?: TodoRelatedType): boolean {
  return relatedType === TodoRelatedType.IS_REPEAT;
}

export default function TodoTable(props: {
  selectedRowKeys: string[];
  onSelectionChange: (keys: string[]) => void;
}) {
  const { todoList, getTodoPage } = useTodoAllContext();
  const { open: openFocusTimer } = useFocusTimer();
  const { openEditDrawer } = useTodoDetail();

  const openEdit = (record: TodoVo) => {
    openEditDrawer({
      contentProps: {
        todo: record,
        afterSubmit: async () => {
          emitTodoChanged();
          await getTodoPage();
        },
      },
    });
  };

  const columns: TableColumnProps<TodoVo>[] = [
    {
      title: '待办',
      key: 'name',
      render: (_, record) => (
        <Flex align="center" gap={8}>
          <Button type="text" onClick={() => openEdit(record)}>
            {record.name}
          </Button>
          {isRepeatSeries(record.relatedType) && <Tag color="blue">重复</Tag>}
        </Flex>
      ),
    },
    {
      title: '来源',
      key: 'relatedType',
      width: 110,
      render: (_, record) => relatedTypeLabel(record.relatedType),
    },
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
      render: (_, record) => {
        const planTime = formatTodoPlanTime(record.planStartTime, record.planEndTime);
        return (
          <div>
            {dayjs(record.planDate).format('YYYY-MM-DD')}
            {planTime ? ` ${planTime}` : ''}
          </div>
        );
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
      title: <span className="text-text-1 font-medium px-4">操作</span>,
      key: 'action',
      render: (_, record) => {
        const relatedType = record.relatedType || TodoRelatedType.NONE;
        const isActive = record.status === TodoStatus.TODO;
        return (
          <div>
            <Button type="text" onClick={() => openEdit(record)}>
              编辑
            </Button>
            {isActive && isTodoPlanRange(record.planStartTime, record.planEndTime) && (
              <Button
                type="text"
                onClick={() => openFocusTimer({ todoId: record.id, label: record.name })}
              >
                开始专注
              </Button>
            )}
            {isActive && (
              <>
                <Button
                  type="text"
                  onClick={async () => {
                    await TodoService.done(relatedType, record.id);
                    emitTodoChanged();
                    await getTodoPage();
                  }}
                >
                  完成
                </Button>
                <Button
                  type="text"
                  onClick={async () => {
                    await TodoService.abandon(relatedType, record.id);
                    emitTodoChanged();
                    await getTodoPage();
                  }}
                >
                  放弃
                </Button>
              </>
            )}
            {!(relatedType === TodoRelatedType.HABIT && isActive) && (
              <Button
                type="text"
                status="danger"
                onClick={() => {
                  const isRepeatSeries = relatedType === TodoRelatedType.IS_REPEAT;
                  Modal.confirm({
                    title: isRepeatSeries ? '删除重复待办' : '删除待办',
                    content: isRepeatSeries
                      ? '将停止后续重复生成，已完成/已放弃的历史记录会保留。确定删除吗？'
                      : '删除后无法恢复，确定删除该待办吗？',
                    okText: '删除',
                    cancelText: '取消',
                    onOk: async () => {
                      try {
                        await TodoService.delete(relatedType, record.id);
                        message.success(
                          isRepeatSeries ? '已删除重复待办，历史记录已保留' : '待办已删除',
                        );
                        emitTodoChanged();
                        await getTodoPage();
                      } catch (error) {
                        console.error(error);
                        message.error('删除失败');
                      }
                    },
                  });
                }}
              >
                删除
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Table
      className="w-full"
      columns={columns as any}
      dataSource={todoList}
      pagination={false}
      rowKey="id"
      rowSelection={{
        selectedRowKeys: props.selectedRowKeys,
        onChange: (keys) => props.onSelectionChange(keys.map(String)),
        getCheckboxProps: (record: TodoVo) => ({
          disabled: record.status !== TodoStatus.TODO,
        }),
      }}
    />
  );
}
