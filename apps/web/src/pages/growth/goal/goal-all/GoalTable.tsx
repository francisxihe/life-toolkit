import { Table, Button, Modal, Card, Divider } from '@arco-design/web-react';
import dayjs from 'dayjs';
import { URGENCY_MAP, IMPORTANCE_MAP } from '../constants';
import { useGoalAllContext } from './context';
import { useEffect, useState } from 'react';
import GoalService from '../service';
import { GoalVo, GoalStatus } from '@life-toolkit/vo/goal';
import { openModal } from '@/hooks/OpenModal';
import GoalDetail from '../components/GoalDetail';
import { ColumnProps } from '@arco-design/web-react/lib/Table/interface';

export default function GoalTable() {
  const { goalList, getGoalPage } = useGoalAllContext();

  useEffect(() => {
    async function initData() {
      await getGoalPage();
      goalList.forEach((item) => {
        setSubGoalLoadingStatus((prev) => ({
          ...prev,
          [item.id]: 'unLoading',
        }));
      });
    }
    initData();
  }, []);

  const columns: ColumnProps<GoalVo>[] = [
    { title: '目标', dataIndex: 'name', key: 'name' },
    {
      title: '状态',
      key: 'status',
      render: (_, record) => {
        switch (record.status) {
          case GoalStatus.DONE:
            return (
              <div className="text-success">
                已完成({dayjs(record.doneAt).format('YY-MM-DD HH:mm')})
              </div>
            );
          case GoalStatus.TODO:
            return <div className="text-warning">未完成</div>;
          case GoalStatus.ABANDONED:
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
      render: (_, record) => (
        <div>
          {record.startAt && record.endAt
            ? `${dayjs(record.startAt).format('YYYY-MM-DD')}
             - ${dayjs(record.endAt).format('YYYY-MM-DD')}`
            : '--'}
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
                    <GoalDetail
                      goal={record}
                      onClose={null}
                      onChange={async () => {
                        console.log('onChange');
                      }}
                    />
                  </div>
                ),
                onCancel: () => {
                  getGoalPage();
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
                  GoalService.deleteGoal(record.id);
                  getGoalPage();
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

  const [expandedData, setExpandedData] = useState<Record<string, GoalVo>>({});
  const [subGoalLoadingStatus, setSubGoalLoadingStatus] = useState<
    Record<string, 'unLoading' | 'loading' | 'loaded' | 'error'>
  >({});
  const onExpandTable = async (record: GoalVo, expanded: boolean) => {
    if (!expanded) {
      return;
    }
    setSubGoalLoadingStatus((prev) => ({ ...prev, [record.id]: 'loading' }));
    const todoNode = await GoalService.getDetail(record.id);
    setExpandedData((prev) => ({
      ...prev,
      [record.id]: todoNode,
    }));
    setSubGoalLoadingStatus((prev) => ({ ...prev, [record.id]: 'loaded' }));
  };

  return (
    <>
      <Table
        className="w-full"
        columns={columns}
        data={goalList}
        pagination={false}
        rowKey="id"
        onExpand={onExpandTable}
        expandedRowRender={(record) => {
          if (subGoalLoadingStatus[record.id] === 'unLoading') return true;
          if (subGoalLoadingStatus[record.id] === 'loading') {
            return (
              <Card
                loading={subGoalLoadingStatus[record.id] === 'loading'}
              ></Card>
            );
          }
          if (subGoalLoadingStatus[record.id] === 'loaded') {
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
    </>
  );
}
