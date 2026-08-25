import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Drawer,
  Flex,
  Space,
  Tag,
  Progress,
  Descriptions,
  Tabs,
  Spin,
  message,
  Modal,
  Badge,
  Row,
  Col,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  LeftOutlined,
} from '@sue/design-web-react';
import { CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import { HabitService, TodoController, GoalController } from '@true-north/web-service';
import { HabitVo } from '@true-north/vo';
import { HABIT_STATUS_OPTIONS } from './constants';
import { useHabitContext } from './context';
import { HabitStatus, TodoRelatedType } from '@true-north/enum';
import { DIFFICULTY_MAP } from '../constants';
import { drawerPaddedBodyStyles } from '@/utils/drawerStyles';
import { CreateHabit } from './components/CreateHabit';
import { emitHabitChanged } from '../events';
import { ProductSurface } from '@ylib/product-server';
import { productRef } from '@true-north/product-wiki';
import styles from './style.module.less';

export const HabitDetailPage: React.FC = () => {
  const { id } = useParams<{id: string;}>();
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
      const response = await HabitService.find(id);
      setHabit(response);
    } catch (error) {
      console.error('获取习惯详情失败:', error);
      message.error('获取习惯详情失败');
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
            if (!habit.cycleTodoId) throw new Error('当前没有可结算的习惯待办');
            await TodoController.done(TodoRelatedType.HABIT, habit.cycleTodoId);
            message.success('本次打卡已完成');
            break;
          case 'pause':
            await HabitService.pause(habit.id);
            message.success('习惯已暂停');
            break;
          case 'resume':
            await HabitService.activate(habit.id);
            message.success('习惯已开始');
            break;
          case 'abandon':
            await HabitService.abandon(habit.id);
            message.success('习惯已放弃');
            break;
          default:
            return;
        }

        fetchHabitDetail();
        refreshHabits();
        emitHabitChanged();
      } catch (error) {
        console.error(`${action}习惯失败:`, error);
        message.error(`${action}习惯失败`);
      } finally {
        setActionLoading(false);
      }
    },
    [habit, fetchHabitDetail, refreshHabits]
  );

  // 处理删除习惯
  const handleDelete = useCallback(() => {
    if (!habit) return;

    Modal.confirm({
      title: '确认删除习惯',
      content: '删除后无法恢复，确定要删除这个习惯吗？',
      onOk: async () => {
        try {
          await HabitService.delete(habit.id);
          message.success('习惯已删除');
          navigate('/growth/habit/habit-list');
          refreshHabits();
          emitHabitChanged();
        } catch (error) {
          console.error('删除习惯失败:', error);
          message.error('删除习惯失败');
        }
      }
    });
  }, [habit, navigate, refreshHabits]);

  const handleEdit = useCallback(async () => {
    if (!habit) return;
    try {
      const response = await GoalController.findByFilter({});
      const instance = Drawer.open({
        title: '编辑习惯',
        size: 800,
        styles: drawerPaddedBodyStyles,
        content: (
          <CreateHabit
            habit={habit}
            goals={response.list}
            onSuccess={async () => {
              await fetchHabitDetail();
              refreshHabits();
              instance.destroy();
            }}
            onCancel={() => instance.destroy()}
          />
        ),
      });
    } catch (error) {
      console.error('获取目标列表失败:', error);
      message.error('无法打开习惯编辑');
    }
  }, [fetchHabitDetail, habit, refreshHabits]);

  // 获取状态配置
  const statusConfig = habit ?
  HABIT_STATUS_OPTIONS.find((option) => option.value === habit.status) :
  null;
  const difficultyConfig = habit ? DIFFICULTY_MAP.get(habit.difficulty) : null;

  // 计算完成率
  const completionRate =
  habit?.completedCount && habit?.currentStreak ?
  Math.round(
    habit.completedCount / (
    habit.currentStreak + habit.completedCount) *
    100
  ) :
  0;

  if (loading) {
    return (
      <Flex align="center" justify="center" className={styles.loading}>
        <Spin size={40} />
      </Flex>
    );
  }

  if (!habit) {
    return (
      <Flex align="center" justify="center" className={styles.emptyState}>
        <span>习惯不存在或已被删除</span>
      </Flex>
    );
  }

  return (
    <ProductSurface id={productRef('growth.habit.view.detail')}>
    <div className={styles.legacyPage}>
      {/* 页面头部 */}
      <Card className="mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Button
              icon={<LeftOutlined />}
              onClick={() => navigate('/growth/habit/habit-list')}>

              返回
            </Button>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-title-1 font-medium mb-0">
                  {habit.name}
                </h4>
                <Badge
                  status={statusConfig?.color as any}
                  text={statusConfig?.label} />

              </div>
              {habit.description &&
              <span className="text-text-3">{habit.description}</span>
              }
            </div>
          </div>

          <Space>
            {/* 状态操作按钮 */}
            {habit.status === HabitStatus.ACTIVE &&
            <>
                <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={actionLoading}
                onClick={() => handleHabitAction('complete')}>

                  完成
                </Button>
                <Button
                icon={<PauseOutlined />}
                loading={actionLoading}
                onClick={() => handleHabitAction('pause')}>

                  暂停
                </Button>
              </>
            }

            {(habit.status === HabitStatus.ABANDONED || habit.status === HabitStatus.PAUSED) &&
            <Button
              type="primary"
              icon={<CaretRightOutlined />}
              loading={actionLoading}
              onClick={() => handleHabitAction('resume')}>

                恢复
              </Button>
            }

            {(habit.status === HabitStatus.ACTIVE ||
            habit.status === HabitStatus.PAUSED) &&
            <Button
              icon={<CloseOutlined />}
              loading={actionLoading}
              onClick={() => handleHabitAction('abandon')}>

                放弃
              </Button>
            }

            <Button icon={<EditOutlined />} onClick={handleEdit}>编辑</Button>
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}>

              删除
            </Button>
          </Space>
        </div>
      </Card>

      {/* 主要内容 */}
      <Row gutter={16}>
        {/* 左侧：基本信息和统计 */}
        <Col span={16}>
          <Tabs
            defaultActiveKey="info"
            items={[
            {
              key: 'info',
              label: '基本信息',
              children:
              <Card>
                    <Descriptions
                  column={2}
                  items={[
                  {
                    key: 'name',
                    label: '习惯名称',
                    children: habit.name
                  },
                  {
                    key: 'status',
                    label: '状态',
                    children:
                    <Badge
                      status={statusConfig?.color as any}
                      text={statusConfig?.label} />

                  },
                  {
                    key: 'importance',
                    label: '重要程度',
                    children: habit.importance ?
                    `${habit.importance}/5` :
                    '-'
                  },
                  {
                    key: 'difficulty',
                    label: '难度等级',
                    children: difficultyConfig ?
                    <Tag color={difficultyConfig.color}>
                              {difficultyConfig.label}
                            </Tag> :

                    '-'

                  },
                  {
                    key: 'repeatStartDate',
                    label: '开始时间',
                    children: habit.repeatStartDate ?
                    new Date(habit.repeatStartDate).toLocaleDateString() :
                    '-'
                  },
                  {
                    key: 'repeatEndDate',
                    label: '目标时间',
                    children: habit.repeatEndDate ?
                    new Date(habit.repeatEndDate).toLocaleDateString() :
                    '长期习惯'
                  },
                  {
                    key: 'createdAt',
                    label: '创建时间',
                    children: new Date(habit.createdAt).toLocaleString()
                  },
                  {
                    key: 'updatedAt',
                    label: '更新时间',
                    children: new Date(habit.updatedAt).toLocaleString()
                  }]
                  } />

                    {habit.description &&
                <div className="mt-4">
                        <span className="font-medium">描述：</span>
                        <p className="mt-2">
                          {habit.description}
                        </p>
                      </div>
                }

                    {habit.tags && habit.tags.length > 0 &&
                <div className="mt-4">
                        <span className="font-medium">标签：</span>
                        <div className="mt-2">
                          {habit.tags.map((tag, index) =>
                    <Tag key={index} className="mr-2 mb-2">
                              {tag}
                            </Tag>
                    )}
                        </div>
                      </div>
                }
                  </Card>

            },
            {
              key: 'goals',
              label: '关联目标',
              children:
              <Card>
                    {habit.goals && habit.goals.length > 0 ?
                <div className="space-y-4">
                        {habit.goals.map((goal) =>
                  <Card key={goal.id} size="small" hoverable>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <span className="font-medium">{goal.name}</span>
                                {goal.description &&
                        <span className="text-text-3 block mt-1">
                                    {goal.description}
                                  </span>
                        }
                              </div>
                              <div className="ml-4 text-right">
                                <span className="text-sm text-gray-500">
                                  进度
                                </span>
                                <div className="mt-1">
                                  <Progress
                            percent={(goal as any).progress || 0}
                            size="small"
                            style={{ width: 100 }} />

                                </div>
                              </div>
                            </div>
                          </Card>
                  )}
                      </div> :

                <div className="text-center py-8 text-gray-500">
                        <span>暂无关联目标</span>
                      </div>
                }
                  </Card>

            }]
            } />

        </Col>

        {/* 右侧：统计信息 */}
        <Col span={8}>
          <Card title="统计信息">
            {/* 完成率 */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span>完成率</span>
                <span className="font-medium">{completionRate}%</span>
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
              {habit.repeatStartDate &&
              <div className="flex justify-between">
                  <span className="text-text-3">开始时间:</span>
                  <span>{new Date(habit.repeatStartDate).toLocaleDateString()}</span>
                </div>
              }
              {habit.repeatEndDate &&
              <div className="flex justify-between">
                  <span className="text-text-3">目标时间:</span>
                  <span>{new Date(habit.repeatEndDate).toLocaleDateString()}</span>
                </div>
              }
              {habit.doneAt &&
              <div className="flex justify-between">
                  <span className="text-text-3">完成时间:</span>
                  <span>{new Date(habit.doneAt).toLocaleDateString()}</span>
                </div>
              }
              {habit.abandonedAt &&
              <div className="flex justify-between">
                  <span className="text-text-3">放弃时间:</span>
                  <span>
                    {new Date(habit.abandonedAt).toLocaleDateString()}
                  </span>
                </div>
              }
            </div>
          </Card>
        </Col>
      </Row>
    </div>
    </ProductSurface>
    );

};

export default HabitDetailPage;
