'use client';

import { useMemo } from 'react';
import { Card, Grid, Typography } from '@arco-design/web-react';
import { useTodoContext } from './context';

const { Row, Col } = Grid;
const { Title, Text } = Typography;

export function TodoStats() {
  const { todoList } = useTodoContext();

  const stats = useMemo(() => {
    const total = todoList.length;
    const completed = todoList.filter((todo) => todo.status === 'done').length;
    const pending = total - completed;
    const highPriority = todoList.filter(
      (todo) => todo.importance === 1 && todo.urgency === 1
    ).length;

    return { total, completed, pending, highPriority };
  }, [todoList]);

  return (
    <Row gutter={[16, 16]}>
      <Col span={6}>
        <Card className="bg-bg-2 border-border-1">
          <Title heading={6} className="text-text-1">Total Tasks</Title>
          <Text style={{ fontSize: 24, fontWeight: 600 }} className="text-text-1">{stats.total}</Text>
        </Card>
      </Col>
      <Col span={6}>
        <Card className="bg-bg-2 border-border-1">
          <Title heading={6} className="text-text-1">Completed</Title>
          <Text style={{ fontSize: 24, fontWeight: 600 }} className="text-success">
            {stats.completed}
          </Text>
        </Card>
      </Col>
      <Col span={6}>
        <Card className="bg-bg-2 border-border-1">
          <Title heading={6} className="text-text-1">Pending</Title>
          <Text style={{ fontSize: 24, fontWeight: 600 }} className="text-warning">{stats.pending}</Text>
        </Card>
      </Col>
      <Col span={6}>
        <Card className="bg-bg-2 border-border-1">
          <Title heading={6} className="text-text-1">High Priority</Title>
          <Text style={{ fontSize: 24, fontWeight: 600 }} className="text-danger">
            {stats.highPriority}
          </Text>
        </Card>
      </Col>
    </Row>
  );
}
