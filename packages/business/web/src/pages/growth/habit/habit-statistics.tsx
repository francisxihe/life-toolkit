import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Grid,
  Typography,
  Select,
  DatePicker,
  Space,
  Spin,
  Message,
  Empty,
} from '@arco-design/web-react';
import { HabitController } from '@life-toolkit/api';
import { HabitVo } from '@life-toolkit/vo';
import { HABIT_STATUS_OPTIONS } from './constants';
import { HabitStatus } from '@life-toolkit/enum';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Row, Col } = Grid;

export const HabitStatisticsPage: React.FC = () => {
  const [habits, setHabits] = useState<HabitVo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);

  // 获取习惯列表
  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await HabitController.getHabitList({});
      setHabits(response.list);
    } catch (error) {
      console.error('获取习惯列表失败:', error);
      Message.error('获取习惯列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // 计算统计数据
  const calculateStatistics = useCallback(() => {
    const filteredHabits =
      selectedHabitId === 'all'
        ? habits
        : habits.filter((habit) => habit.id === selectedHabitId);

    // 状态分布
    const statusDistribution = HABIT_STATUS_OPTIONS.map((status) => ({
      status: status.label,
      count: filteredHabits.filter((habit) => habit.status === status.value)
        .length,
      color: status.color,
    }));

    // 完成率统计
    const completionStats = filteredHabits.map((habit) => {
      const completionRate =
        habit.completedCount && habit.currentStreak
          ? Math.round(
              (habit.completedCount /
                (habit.currentStreak + habit.completedCount)) *
                100,
            )
          : 0;

      return {
        name: habit.name,
        completionRate,
        currentStreak: habit.currentStreak || 0,
        longestStreak: habit.longestStreak || 0,
        completedCount: habit.completedCount || 0,
      };
    });

    // 连续天数分布
    const streakDistribution = [
      {
        range: '1-7天',
        count: filteredHabits.filter(
          (h) => (h.currentStreak || 0) >= 1 && (h.currentStreak || 0) <= 7,
        ).length,
      },
      {
        range: '8-30天',
        count: filteredHabits.filter(
          (h) => (h.currentStreak || 0) >= 8 && (h.currentStreak || 0) <= 30,
        ).length,
      },
      {
        range: '31-90天',
        count: filteredHabits.filter(
          (h) => (h.currentStreak || 0) >= 31 && (h.currentStreak || 0) <= 90,
        ).length,
      },
      {
        range: '90天以上',
        count: filteredHabits.filter((h) => (h.currentStreak || 0) > 90).length,
      },
    ];

    return {
      statusDistribution,
      completionStats,
      streakDistribution,
      totalHabits: filteredHabits.length,
      activeHabits: filteredHabits.filter(
        (h) => h.status === HabitStatus.ACTIVE,
      ).length,
      completedHabits: filteredHabits.filter(
        (h) => h.status === HabitStatus.COMPLETED,
      ).length,
      averageCompletion:
        completionStats.length > 0
          ? Math.round(
              completionStats.reduce(
                (sum, stat) => sum + stat.completionRate,
                0,
              ) / completionStats.length,
            )
          : 0,
    };
  }, [habits, selectedHabitId]);

  const statistics = calculateStatistics();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size={40} />
      </div>
    );
  }

  return (
    <div className="habit-statistics-page">
      {/* 页面头部 */}
      <Card className="mb-4">
        <div className="flex justify-between items-center">
          <div>
            <Title heading={4} className="mb-2">
              习惯统计分析
            </Title>
            <Text type="secondary">
              通过数据分析了解习惯养成情况，优化个人成长策略
            </Text>
          </div>
          <Space>
            <Select
              placeholder="选择习惯"
              value={selectedHabitId}
              onChange={setSelectedHabitId}
              style={{ width: 200 }}
            >
              <Option value="all">全部习惯</Option>
              {habits.map((habit) => (
                <Option key={habit.id} value={habit.id}>
                  {habit.name}
                </Option>
              ))}
            </Select>
            <RangePicker
              placeholder={['开始日期', '结束日期']}
              value={dateRange}
              onChange={(dateString, date) => setDateRange(date as [any, any])}
            />
          </Space>
        </div>
      </Card>

      {habits.length === 0 ? (
        <Card>
          <Empty
            description="暂无习惯数据"
            imgSrc="//p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a0082b7754fbdb2d98a5c18d0b0edd25.png~tplv-uwbnlip3yd-webp.webp"
          />
        </Card>
      ) : (
        <>
          {/* 概览卡片 */}
          <Row gutter={16} className="mb-4">
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {statistics.totalHabits}
                  </div>
                  <div className="text-gray-600">总习惯数</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {statistics.activeHabits}
                  </div>
                  <div className="text-gray-600">活跃习惯</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {statistics.completedHabits}
                  </div>
                  <div className="text-gray-600">已完成习惯</div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {statistics.averageCompletion}%
                  </div>
                  <div className="text-gray-600">平均完成率</div>
                </div>
              </Card>
            </Col>
          </Row>

          {/* 状态分布 */}
          <Row gutter={16} className="mb-4">
            <Col span={12}>
              <Card title="习惯状态分布">
                <div className="space-y-3">
                  {statistics.statusDistribution.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <span
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        />
                        <Text>{item.status}</Text>
                      </div>
                      <Text className="font-medium">{item.count}</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>

            <Col span={12}>
              <Card title="连续天数分布">
                <div className="space-y-3">
                  {statistics.streakDistribution.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <Text>{item.range}</Text>
                      <Text className="font-medium">{item.count}个习惯</Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          {/* 详细数据表格 */}
          <Row gutter={16}>
            <Col span={24}>
              <Card title="习惯详细统计">
                {statistics.completionStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border p-3 text-left">习惯名称</th>
                          <th className="border p-3 text-center">完成率</th>
                          <th className="border p-3 text-center">当前连续</th>
                          <th className="border p-3 text-center">最长连续</th>
                          <th className="border p-3 text-center">总完成次数</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statistics.completionStats.map((stat, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border p-3">{stat.name}</td>
                            <td className="border p-3 text-center">
                              <span
                                className={`font-medium ${
                                  stat.completionRate >= 80
                                    ? 'text-green-600'
                                    : stat.completionRate >= 60
                                      ? 'text-orange-600'
                                      : 'text-red-600'
                                }`}
                              >
                                {stat.completionRate}%
                              </span>
                            </td>
                            <td className="border p-3 text-center">
                              {stat.currentStreak}天
                            </td>
                            <td className="border p-3 text-center">
                              {stat.longestStreak}天
                            </td>
                            <td className="border p-3 text-center">
                              {stat.completedCount}次
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Text>暂无数据</Text>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default HabitStatisticsPage;
