'use client';

import { useMemo } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Card, Grid, Typography, Space, Progress, Tag } from '@arco-design/web-react';
import { TodoVo } from '@life-toolkit/vo/growth';
import styles from './style/index.module.less';
import { TodoProvider, useTodoContext } from './context';
import { TodoChart } from './TodoChart';
import { TodoPriorityMatrix } from './TodoPriorityMatrix';
import { RecentTodos } from './RecentTodos';

const { Row, Col } = Grid;
const { Title, Text } = Typography;

export default function TodoDashboardPage() {
  return (
    <TodoProvider>
      <TodoDashboardContent />
    </TodoProvider>
  );
}

function TodoDashboardContent() {
  const { todoList, loading } = useTodoContext();

  // 统计数据
  const stats = useMemo(() => {
    const total = todoList.length;
    const completed = todoList.filter((todo) => todo.status === 'done').length;
    const pending = todoList.filter((todo) => todo.status === 'todo').length;
    const abandoned = todoList.filter((todo) => todo.status === 'abandoned').length;
    
    // 优先级统计
    const highPriority = todoList.filter(
      (todo) => todo.importance === 1 && todo.urgency === 1 && todo.status === 'todo'
    ).length;
    const mediumPriority = todoList.filter(
      (todo) => ((todo.importance === 1 && todo.urgency === 2) || 
                 (todo.importance === 2 && todo.urgency === 1)) && todo.status === 'todo'
    ).length;
    
    // 今日完成
    const today = new Date();
    const todayCompleted = todoList.filter((todo) => {
      if (todo.status !== 'done' || !todo.doneAt) return false;
      const doneDate = new Date(todo.doneAt);
      return doneDate >= startOfDay(today) && doneDate <= endOfDay(today);
    }).length;
    
    // 本周完成
    const weekStart = subDays(today, 7);
    const weekCompleted = todoList.filter((todo) => {
      if (todo.status !== 'done' || !todo.doneAt) return false;
      const doneDate = new Date(todo.doneAt);
      return doneDate >= weekStart;
    }).length;
    
    // 完成率
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // 逾期任务
    const overdue = todoList.filter((todo) => {
      if (todo.status !== 'todo') return false;
      const planDate = new Date(todo.planDate);
      return planDate < startOfDay(today);
    }).length;

    return {
      total,
      completed,
      pending,
      abandoned,
      highPriority,
      mediumPriority,
      todayCompleted,
      weekCompleted,
      completionRate,
      overdue,
    };
  }, [todoList]);

  // 图表数据
  const chartData = useMemo(() => {
    const data: { date: string; completed: number; created: number }[] = [];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'yyyy-MM-dd');
    });

    last7Days.forEach((dateStr) => {
      const completed = todoList.filter((todo) => {
        if (todo.status !== 'done' || !todo.doneAt) return false;
        return format(new Date(todo.doneAt), 'yyyy-MM-dd') === dateStr;
      }).length;

      const created = todoList.filter((todo) => {
        return format(new Date(todo.createdAt), 'yyyy-MM-dd') === dateStr;
      }).length;

      data.push({
        date: format(new Date(dateStr), 'MM/dd'),
        completed,
        created,
      });
    });

    return data;
  }, [todoList]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title heading={3}>待办看板</Title>
        <Text type="secondary">
          总览您的任务完成情况和效率统计
        </Text>
      </div>

      <Space size={24} direction="vertical" style={{ width: '100%' }}>
        {/* 核心统计卡片 */}
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{stats.total}</div>
                <div className={styles.statLabel}>总任务数</div>
                <div className={styles.statExtra}>
                  <Tag color="blue" size="small">全部</Tag>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statNumber} style={{ color: '#00b42a' }}>
                  {stats.completed}
                </div>
                <div className={styles.statLabel}>已完成</div>
                <div className={styles.statExtra}>
                  <Progress 
                    percent={stats.completionRate} 
                    size="mini" 
                    showText={false}
                    color="#00b42a"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {stats.completionRate}%
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statNumber} style={{ color: '#ff7d00' }}>
                  {stats.pending}
                </div>
                <div className={styles.statLabel}>待处理</div>
                <div className={styles.statExtra}>
                  {stats.overdue > 0 && (
                    <Tag color="red" size="small">
                      {stats.overdue} 逾期
                    </Tag>
                  )}
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statNumber} style={{ color: '#f53f3f' }}>
                  {stats.highPriority}
                </div>
                <div className={styles.statLabel}>高优先级</div>
                <div className={styles.statExtra}>
                  <Tag color="red" size="small">紧急重要</Tag>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 今日和本周统计 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card title="今日完成" className={styles.dailyCard}>
              <div className={styles.dailyStats}>
                <div className={styles.dailyNumber}>{stats.todayCompleted}</div>
                <div className={styles.dailyLabel}>个任务</div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="本周完成" className={styles.dailyCard}>
              <div className={styles.dailyStats}>
                <div className={styles.dailyNumber}>{stats.weekCompleted}</div>
                <div className={styles.dailyLabel}>个任务</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 图表和矩阵 */}
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <TodoChart data={chartData} loading={loading} />
          </Col>
          <Col span={8}>
            <TodoPriorityMatrix todoList={todoList} />
          </Col>
        </Row>

        {/* 最近任务 */}
        <RecentTodos todoList={todoList} />
      </Space>
    </div>
  );
}
