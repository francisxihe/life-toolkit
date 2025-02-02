'use client';

import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, Grid, Typography, Statistic } from '@arco-design/web-react';
import { Todo } from '../service/types';
import ApiService from '../service/api';
// 引入 ECharts
import ReactECharts from 'echarts-for-react';

const { Row, Col } = Grid;
const { Title } = Typography;

export default function TodoDashboardPage() {
  const [todoList, setTodoList] = useState<Todo[]>([]);

  useEffect(() => {
    async function initData() {
      const todos = await ApiService.getTodoList();
      setTodoList(todos);
    }
    initData();
  }, []);

  const chartData = useMemo(() => {
    const data: { date: string; completed: number }[] = [];
    const grouped = todoList.reduce((acc, todo) => {
      if (todo.status !== 'done') return acc;
      const date = format(new Date(todo.doneAt), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(grouped).forEach(([date, count]) => {
      data.push({
        date: format(new Date(date), 'MMM d'),
        completed: count,
      });
    });

    return data
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  }, [todoList]);

  const stats = useMemo(() => {
    const total = todoList.length;
    const highPriority = todoList.filter(
      (todo) => todo.importance === 1 && todo.urgency === 1
    ).length;
    const avgCompletionTime =
      todoList.reduce((acc, todo) => {
        const start = new Date(todo.planDate);
        const end = new Date(todo.doneAt);
        return acc + (end.getTime() - start.getTime());
      }, 0) / (total || 1);

    return {
      total,
      highPriority,
      avgCompletionTime: Math.round(avgCompletionTime / (1000 * 60 * 60 * 24)), // Convert to days
    };
  }, [todoList]);

  return (
    <div className="space-y-6">
      <Title heading={3}>待办看板</Title>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="总完成" value={stats.total} />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic title="高优先级完成" value={stats.highPriority} />
          </Card>
        </Col>

        <Col span={8}>
          <Card>
            <Statistic
              title="平均完成时间"
              value={stats.avgCompletionTime}
              suffix="天"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Title heading={5}>Completion Trend</Title>
        <div style={{ height: 300 }}>
          <ReactECharts
            option={{
              xAxis: {
                data: chartData.map((item) => item.date),
              },
              yAxis: {
                data: chartData.map((item) => item.completed),
              },
            }}
          />
        </div>
      </Card>
    </div>
  );
}
