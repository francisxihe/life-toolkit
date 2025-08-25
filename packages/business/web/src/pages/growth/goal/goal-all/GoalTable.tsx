import { Table, Button, Modal, Card, Divider } from '@arco-design/web-react';
import dayjs from 'dayjs';
import { IMPORTANCE_MAP } from '../../constants';
import { useGoalAllContext } from './context';
import { useEffect, useState } from 'react';
import { GoalService } from '../../service';
import { GoalVo } from '@life-toolkit/vo/growth';
import { ColumnProps } from '@arco-design/web-react/lib/Table/interface';
import { useGoalDetail } from '../../components/GoalDetail';
import { GoalType, GoalStatus } from '@life-toolkit/enum';

export default function GoalTable() {
  const { goalList, getGoalPage } = useGoalAllContext();
  const { openEditDrawer } = useGoalDetail();

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
      title: '类型',
      key: 'type',
      render: (_, record) => (
        <div>
          {record.type === GoalType.OBJECTIVE && '规划目标'}
          {record.type === GoalType.KEY_RESULT && '成果目标'}
        </div>
      ),
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
              openEditDrawer({
                contentProps: {
                  goalId: record.id,
                  afterSubmit: async () => {
                    await getGoalPage();
                  },
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
                content:
                  '删除后将无法恢复,如果目标下有子目标,将一并删除,是否继续?',
                onOk: async () => {
                  await GoalService.deleteGoal(record.id);
                  await getGoalPage();
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
  );
}
