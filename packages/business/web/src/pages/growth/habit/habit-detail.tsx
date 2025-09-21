import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Progress,
  Descriptions,
  Tabs,
  Grid,
  Spin,
  Message,
  Modal,
  Badge,
} from '@arco-design/web-react';
import {
  IconLeft,
  IconEdit,
  IconDelete,
  IconCheck,
  IconPause,
  IconPlayArrow,
  IconClose,
} from '@arco-design/web-react/icon';
import { HabitController } from '@life-toolkit/api';
import { HabitVo } from '@life-toolkit/vo';
import { HABIT_STATUS_OPTIONS } from './constants';
import { useHabitContext } from './context';
import { HabitStatus } from '@life-toolkit/enum';
import { DIFFICULTY_MAP } from '../constants';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { Row, Col } = Grid;

export const HabitDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { refreshHabits } = useHabitContext();

  const [habit, setHabit] = useState<HabitVo | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // 获取习惯详情
  const fetchHabitDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await HabitController.getHabitDetail(id);
      setHabit(response);
    } catch (error) {
      console.error('获取习惯详情失败:', error);
      Message.error('获取习惯详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHabitDetail();
  }, [fetchHabitDetail]);

  // 处理习惯操作
  const handleHabitAction = useCallback(
    async (action: string) => {
      if (!habit) return;

      try {
        setActionLoading(true);

        switch (action) {
          case 'complete':
            await HabitController.doneBatchHabit({ includeIds: [habit.id] });
            Message.success('习惯已完成');
            break;
          case 'pause':
            await HabitController.pauseHabit(habit.id);
            Message.success('习惯已暂停');
            break;
          case 'resume':
            await HabitController.resumeHabit(habit.id);
            Message.success('习惯已恢复');
            break;
          case 'abandon':
            await HabitController.abandonHabit(habit.id);
            Message.success('习惯已放弃');
            break;
          default:
            return;
        }

        fetchHabitDetail();
        refreshHabits();
      } catch (error) {
        console.error(`${action}习惯失败:`, error);
        Message.error(`${action}习惯失败`);
      } finally {
        setActionLoading(false);
      }
    },
    [habit, fetchHabitDetail, refreshHabits],
  );

  // 处理删除习惯
  const handleDelete = useCallback(() => {
    if (!habit) return;

    Modal.confirm({
      title: '确认删除习惯',
      content: '删除后无法恢复，确定要删除这个习惯吗？',
      onOk: async () => {
        try {
          await HabitController.deleteHabit(habit.id);
          Message.success('习惯已删除');
          navigate('/growth/habits');
          refreshHabits();
        } catch (error) {
          console.error('删除习惯失败:', error);
          Message.error('删除习惯失败');
        }
      },
    });
  }, [habit, navigate, refreshHabits]);

  // 获取状态配置
  const statusConfig = habit
    ? HABIT_STATUS_OPTIONS.find((option) => option.value === habit.status)
    : null;
  const difficultyConfig = habit ? DIFFICULTY_MAP.get(habit.difficulty) : null;

  // 计算完成率
  const completionRate =
    habit?.completedCount && habit?.currentStreak
      ? Math.round(
          (habit.completedCount /
            (habit.currentStreak + habit.completedCount)) *
            100,
        )
      : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size={40} />
      </div>
    );
  }

  if (!habit) {
    return (
      <div className="text-center py-8">
        <Text>习惯不存在或已被删除</Text>
      </div>
    );
  }

  return (
    <div className="habit-detail-page">
      {/* 页面头部 */}
      <Card className="mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Button
              icon={<IconLeft />}
              onClick={() => navigate('/growth/habits')}
            >
              返回
            </Button>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Title heading={4} className="mb-0">
                  {habit.name}
                </Title>
                <Badge
                  status={statusConfig?.color as any}
                  text={statusConfig?.label}
                />
              </div>
              {habit.description && (
                <Text type="secondary">{habit.description}</Text>
              )}
            </div>
          </div>

          <Space>
            {/* 状态操作按钮 */}
            {habit.status === HabitStatus.ACTIVE && (
              <>
                <Button
                  type="primary"
                  icon={<IconCheck />}
                  loading={actionLoading}
                  onClick={() => handleHabitAction('complete')}
                >
                  完成
                </Button>
                <Button
                  icon={<IconPause />}
                  loading={actionLoading}
                  onClick={() => handleHabitAction('pause')}
                >
                  暂停
                </Button>
              </>
            )}

            {habit.status === HabitStatus.PAUSED && (
              <Button
                type="primary"
                icon={<IconPlayArrow />}
                loading={actionLoading}
                onClick={() => handleHabitAction('resume')}
              >
                恢复
              </Button>
            )}

            {(habit.status === HabitStatus.ACTIVE ||
              habit.status === HabitStatus.PAUSED) && (
              <Button
                icon={<IconClose />}
                loading={actionLoading}
                onClick={() => handleHabitAction('abandon')}
              >
                放弃
              </Button>
            )}

            <Button icon={<IconEdit />}>编辑</Button>
            <Button
              type="primary"
              status="danger"
              icon={<IconDelete />}
              onClick={handleDelete}
            >
              删除
            </Button>
          </Space>
        </div>
      </Card>

      {/* 主要内容 */}
      <Row gutter={16}>
        {/* 左侧：基本信息和统计 */}
        <Col span={16}>
          <Tabs defaultActiveTab="info">
            <TabPane key="info" title="基本信息">
              <Card>
                <Descriptions
                  column={2}
                  data={[
                    {
                      label: '习惯名称',
                      value: habit.name,
                    },
                    {
                      label: '状态',
                      value: (
                        <Badge
                          status={statusConfig?.color as any}
                          text={statusConfig?.label}
                        />
                      ),
                    },
                    {
                      label: '重要程度',
                      value: habit.importance ? `${habit.importance}/5` : '-',
                    },
                    {
                      label: '难度等级',
                      value: difficultyConfig ? (
                        <Tag color={difficultyConfig.color}>
                          {difficultyConfig.label}
                        </Tag>
                      ) : (
                        '-'
                      ),
                    },
                    {
                      label: '开始时间',
                      value: habit.startAt
                        ? new Date(habit.startAt).toLocaleDateString()
                        : '-',
                    },
                    {
                      label: '目标时间',
                      value: habit.endAt
                        ? new Date(habit.endAt).toLocaleDateString()
                        : '长期习惯',
                    },
                    {
                      label: '创建时间',
                      value: new Date(habit.createdAt).toLocaleString(),
                    },
                    {
                      label: '更新时间',
                      value: new Date(habit.updatedAt).toLocaleString(),
                    },
                  ]}
                />

                {habit.description && (
                  <div className="mt-4">
                    <Text className="font-medium">描述：</Text>
                    <Paragraph className="mt-2">{habit.description}</Paragraph>
                  </div>
                )}

                {habit.tags && habit.tags.length > 0 && (
                  <div className="mt-4">
                    <Text className="font-medium">标签：</Text>
                    <div className="mt-2">
                      {habit.tags.map((tag, index) => (
                        <Tag key={index} className="mr-2 mb-2">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabPane>

            <TabPane key="goals" title="关联目标">
              <Card>
                {habit.goals && habit.goals.length > 0 ? (
                  <div className="space-y-4">
                    {habit.goals.map((goal) => (
                      <Card key={goal.id} size="small" hoverable>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Text className="font-medium">{goal.name}</Text>
                            {goal.description && (
                              <Text type="secondary" className="block mt-1">
                                {goal.description}
                              </Text>
                            )}
                          </div>
                          <div className="ml-4 text-right">
                            <Text className="text-sm text-gray-500">进度</Text>
                            <div className="mt-1">
                              <Progress
                                percent={(goal as any).progress || 0}
                                size="small"
                                width={100}
                              />
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Text>暂无关联目标</Text>
                  </div>
                )}
              </Card>
            </TabPane>
          </Tabs>
        </Col>

        {/* 右侧：统计信息 */}
        <Col span={8}>
          <Card title="统计信息">
            {/* 完成率 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <Text>完成率</Text>
                <Text className="font-medium">{completionRate}%</Text>
              </div>
              <Progress percent={completionRate} />
            </div>

            {/* 关键指标 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {habit.currentStreak || 0}
                </div>
                <div className="text-sm text-gray-600">当前连续天数</div>
              </div>
              <div className="text-center bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">
                  {habit.longestStreak || 0}
                </div>
                <div className="text-sm text-gray-600">最长连续天数</div>
              </div>
              <div className="text-center bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {habit.completedCount || 0}
                </div>
                <div className="text-sm text-gray-600">总完成次数</div>
              </div>
              <div className="text-center bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">
                  {habit.goals?.length || 0}
                </div>
                <div className="text-sm text-gray-600">关联目标数</div>
              </div>
            </div>

            {/* 时间信息 */}
            <div className="space-y-2 text-sm">
              {habit.startAt && (
                <div className="flex justify-between">
                  <Text type="secondary">开始时间:</Text>
                  <Text>{new Date(habit.startAt).toLocaleDateString()}</Text>
                </div>
              )}
              {habit.endAt && (
                <div className="flex justify-between">
                  <Text type="secondary">目标时间:</Text>
                  <Text>{new Date(habit.endAt).toLocaleDateString()}</Text>
                </div>
              )}
              {habit.doneAt && (
                <div className="flex justify-between">
                  <Text type="secondary">完成时间:</Text>
                  <Text>{new Date(habit.doneAt).toLocaleDateString()}</Text>
                </div>
              )}
              {habit.abandonedAt && (
                <div className="flex justify-between">
                  <Text type="secondary">放弃时间:</Text>
                  <Text>
                    {new Date(habit.abandonedAt).toLocaleDateString()}
                  </Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HabitDetailPage;
