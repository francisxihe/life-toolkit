import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Grid,
  Space,
  Typography,
  Empty,
  Spin,
  Message,
  Modal,
  Pagination,
  Tag,
  Progress,
} from '@arco-design/web-react';
import { IconPlus, IconFilter, IconRefresh } from '@arco-design/web-react/icon';
import { HabitController } from '@life-toolkit/api/controller/habit';
import { GoalController } from '@life-toolkit/api/controller/goal';
import {
  HabitItemVo,
  HabitPageFiltersVo,
  HabitStatus,
  GoalItemVo,
} from '@life-toolkit/vo/growth';
import { HABIT_STATUS_OPTIONS, HABIT_DIFFICULTY_OPTIONS } from './constants';
import { useHabitContext } from './context';

const { Row, Col } = Grid;
const { Title, Text } = Typography;

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
  const handleRefresh = useCallback(() => {
    fetchHabits();
    fetchGoals();
  }, [fetchHabits, fetchGoals]);

  // 渲染习惯卡片
  const renderHabitCard = (habit: HabitItemVo) => {
    const statusConfig = HABIT_STATUS_OPTIONS.find(
      (option) => option.value === habit.status,
    );
    const difficultyConfig = HABIT_DIFFICULTY_OPTIONS.find(
      (option) => option.value === habit.difficulty,
    );

    const completionRate =
      habit.completedCount && habit.currentStreak
        ? Math.round(
            (habit.completedCount /
              (habit.currentStreak + habit.completedCount)) *
              100,
          )
        : 0;

    return (
      <Card
        key={habit.id}
        className="habit-card h-full"
        hoverable
        title={
          <div className="flex justify-between items-center">
            <Text className="font-medium">{habit.name}</Text>
            <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>
          </div>
        }
        extra={
          <Space>
            {habit.status === HabitStatus.ACTIVE && (
              <Button
                type="primary"
                size="small"
                onClick={() => handleHabitComplete(habit.id)}
              >
                完成
              </Button>
            )}
            <Button
              size="small"
              onClick={() => handleHabitDelete(habit.id)}
              status="danger"
            >
              删除
            </Button>
          </Space>
        }
      >
        {habit.description && (
          <Text type="secondary" className="block mb-3">
            {habit.description}
          </Text>
        )}

        <div className="space-y-2">
          {difficultyConfig && (
            <Tag color={difficultyConfig.color} size="small">
              {difficultyConfig.label}
            </Tag>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <Text className="text-sm">完成率</Text>
              <Text className="text-sm font-medium">{completionRate}%</Text>
            </div>
            <Progress percent={completionRate} size="small" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-gray-50 rounded p-2">
              <div className="text-lg font-bold text-blue-600">
                {habit.currentStreak || 0}
              </div>
              <div className="text-xs text-gray-500">当前连续</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-lg font-bold text-green-600">
                {habit.longestStreak || 0}
              </div>
              <div className="text-xs text-gray-500">最长连续</div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="habit-list-page">
      {/* 页面头部 */}
      <Card className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <Title heading={4} className="mb-2">
              习惯管理
            </Title>
            <Typography.Text type="secondary">
              通过目标导向的习惯养成，实现个人成长目标
            </Typography.Text>
          </div>
          <Space>
            <Button
              icon={<IconRefresh />}
              onClick={handleRefresh}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<IconPlus />}
              onClick={() => Message.info('创建习惯功能开发中')}
            >
              创建习惯
            </Button>
          </Space>
        </div>
      </Card>

      {/* 习惯列表 */}
      <Card>
        <Spin loading={loading}>
          {habits.length === 0 ? (
            <Empty
              description="暂无习惯数据"
              imgSrc="//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a0082b7754fbdb2d98a5c18d0b0edd25.png~tplv-uwbnlip3yd-webp.webp"
            />
          ) : (
            <>
              <Row gutter={[16, 16]}>
                {habits.map((habit) => (
                  <Col key={habit.id} xs={24} sm={12} md={8} lg={6}>
                    {renderHabitCard(habit)}
                  </Col>
                ))}
              </Row>

              {/* 分页器 */}
              {pagination.total > pagination.pageSize && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handlePageChange}
                    showTotal={(total, range) =>
                      `第 ${range[0]}-${range[1]} 项，共 ${total} 项`
                    }
                    showJumper
                    sizeCanChange
                    sizeOptions={[12, 24, 48]}
                  />
                </div>
              )}
            </>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default HabitListPage;
