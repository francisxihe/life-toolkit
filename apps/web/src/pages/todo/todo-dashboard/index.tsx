'use client';

import { useMemo, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, Grid, Typography, Statistic } from '@arco-design/web-react';
import { TodoVo } from '@life-toolkit/vo/todo';
import ApiService from '../service';
import styles from './style/index.module.less';
import { Space } from '@arco-design/web-react';
import Overview from './overview';


const { Row, Col } = Grid;
const { Title } = Typography;

export default function TodoDashboardPage() {
  const [todoList, setTodoList] = useState<TodoVo[]>([]);

  useEffect(() => {
    async function initData() {
      const { list } = await ApiService.getTodoList();
      setTodoList(list);
    }
    initData();
  }, []);

  const chartData = useMemo(() => {
    const data: { date: string; completed: number }[] = [];
    const grouped = todoList.reduce(
      (acc, todo) => {
        if (todo.status !== 'done') return acc;
        const date = format(new Date(todo.doneAt), 'yyyy-MM-dd');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

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
      (todo) => todo.importance === 1 && todo.urgency === 1,
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
    <div className={styles.wrapper}>
      <Space size={16} direction="vertical" className={styles.left}>
        <Overview />
        {/* <Row gutter={gutter}>
          <Col span={12}>
            <PopularContents />
          </Col>
          <Col span={12}>
            <ContentPercentage />
          </Col>
        </Row>
      </Space>
      <Space className={styles.right} size={16} direction="vertical">
        <Shortcuts />
        <Carousel />
        <Announcement />
        <Docs /> */}
      </Space>
    </div>
    // <div className="space-y-6">
    //   <Title heading={3}>待办看板</Title>

    //   <Row gutter={16}>
    //     <Col span={8}>
    //       <Card>
    //         <Statistic title="总完成" value={stats.total} />
    //       </Card>
    //     </Col>

    //     <Col span={8}>
    //       <Card>
    //         <Statistic title="高优先级完成" value={stats.highPriority} />
    //       </Card>
    //     </Col>

    //     <Col span={8}>
    //       <Card>
    //         <Statistic
    //           title="平均完成时间"
    //           value={stats.avgCompletionTime}
    //           suffix="天"
    //         />
    //       </Card>
    //     </Col>
    //   </Row>
    // </div>
  );
}
