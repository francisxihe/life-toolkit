import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Empty,
  Spin,
  Message,
  Modal,
  Tag,
  Progress,
  Table,
} from '@arco-design/web-react';
import { HabitController } from '@life-toolkit/api/controller/habit';
import { GoalController } from '@life-toolkit/api/controller/goal';
import {
  HabitItemVo,
  HabitPageFiltersVo,
  HabitStatus,
  GoalItemVo,
} from '@life-toolkit/vo/growth';
import { HABIT_STATUS_OPTIONS, HABIT_DIFFICULTY_OPTIONS } from '../constants';
import { useHabitContext } from '../context';
import DefaultPage from '@/components/Layout/DefaultPage';
import HabitListFilter from './HabitListFilter';
import { HabitListProvider } from './context';
import { FlexibleContainer } from '@life-toolkit/components-web-ui';

const { Text } = Typography;
const { Fixed, Shrink } = FlexibleContainer;

export const HabitListPage: React.FC = () => {
  const { refreshHabits } = useHabitContext();

  // 状态管理
  const [habits, setHabits] = useState<HabitItemVo[]>([]);
  const [goals, setGoals] = useState<GoalItemVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  // 筛选条件
  const [filters, setFilters] = useState<HabitPageFiltersVo>({
    pageNum: 1,
    pageSize: 12,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // 获取习惯列表
  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await HabitController.getHabitPage(filters);
      setHabits(response.list);
      setPagination({
        current: response.pageNum,
        pageSize: response.pageSize,
        total: response.total,
      });
    } catch (error) {
      console.error('获取习惯列表失败:', error);
      Message.error('获取习惯列表失败');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 获取目标列表
  const fetchGoals = useCallback(async () => {
    try {
      const response = await GoalController.getGoalList({});
      setGoals(response.list);
    } catch (error) {
      console.error('获取目标列表失败:', error);
    }
  }, []);

  // 初始化数据
  useEffect(() => {
    fetchHabits();
    fetchGoals();
  }, [fetchHabits, fetchGoals]);

  // 处理分页变更
  const handlePageChange = useCallback((page: number, pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      pageNum: page,
      pageSize,
    }));
  }, []);

  // 处理习惯完成
  const handleHabitComplete = useCallback(
    async (habitId: string) => {
      try {
        await HabitController.batchCompleteHabit({ idList: [habitId] });
        Message.success('习惯已完成');
        fetchHabits();
        refreshHabits();
      } catch (error) {
        console.error('完成习惯失败:', error);
        Message.error('完成习惯失败');
      }
    },
    [fetchHabits, refreshHabits],
  );

  // 处理习惯删除
  const handleHabitDelete = useCallback(
    async (habitId: string) => {
      Modal.confirm({
        title: '确认删除习惯',
        content: '删除后无法恢复，确定要删除这个习惯吗？',
        onOk: async () => {
          try {
            await HabitController.deleteHabit(habitId);
            Message.success('习惯已删除');
            fetchHabits();
            refreshHabits();
          } catch (error) {
            console.error('删除习惯失败:', error);
            Message.error('删除习惯失败');
          }
        },
      });
    },
    [fetchHabits, refreshHabits],
  );

  // 刷新数据
  const handleRefresh = useCallback(async () => {
    await fetchHabits();
    await fetchGoals();
  }, [fetchHabits, fetchGoals]);

  // 表格列配置
  const columns = [
    {
      title: '习惯名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: HabitItemVo) => (
        <div>
          <div className="font-medium">{name}</div>
          {record.description && (
            <Text type="secondary" className="text-sm">
              {record.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: HabitStatus) => {
        const statusConfig = HABIT_STATUS_OPTIONS.find(
          (option) => option.value === status,
        );
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (difficulty: string) => {
        const difficultyConfig = HABIT_DIFFICULTY_OPTIONS.find(
          (option) => option.value === difficulty,
        );
        return difficultyConfig ? (
          <Tag color={difficultyConfig.color} size="small">
            {difficultyConfig.label}
          </Tag>
        ) : null;
      },
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 150,
      render: (_: any, record: HabitItemVo) => {
        const completionRate =
          record.completedCount && record.currentStreak
            ? Math.round(
                (record.completedCount /
                  (record.currentStreak + record.completedCount)) *
                  100,
              )
            : 0;
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <Text className="text-sm font-medium">{completionRate}%</Text>
            </div>
            <Progress percent={completionRate} size="small" />
          </div>
        );
      },
    },
    {
      title: '当前连续',
      dataIndex: 'currentStreak',
      key: 'currentStreak',
      width: 100,
      align: 'center' as const,
      render: (currentStreak: number) => (
        <div className="text-lg font-bold text-blue-600">
          {currentStreak || 0}
        </div>
      ),
    },
    {
      title: '最长连续',
      dataIndex: 'longestStreak',
      key: 'longestStreak',
      width: 100,
      align: 'center' as const,
      render: (longestStreak: number) => (
        <div className="text-lg font-bold text-green-600">
          {longestStreak || 0}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: HabitItemVo) => (
        <Space>
          {record.status === HabitStatus.ACTIVE && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleHabitComplete(record.id)}
            >
              完成
            </Button>
          )}
          <Button
            size="small"
            onClick={() => handleHabitDelete(record.id)}
            status="danger"
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <HabitListProvider>
      <DefaultPage title="习惯管理">
        <FlexibleContainer>
          <Fixed>
            <HabitListFilter handleRefresh={handleRefresh} loading={loading} />
          </Fixed>
          <Shrink>
            <Table
              columns={columns}
              data={habits}
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                onChange: handlePageChange,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 项，共 ${total} 项`,
                showJumper: true,
                sizeCanChange: true,
                sizeOptions: [12, 24, 48],
              }}
              rowKey="id"
              scroll={{ x: 900 }}
            />
          </Shrink>
        </FlexibleContainer>
      </DefaultPage>
    </HabitListProvider>
  );
};

export default HabitListPage;
