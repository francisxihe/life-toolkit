'use client';

import { Card, Typography, List, Tag, Space, Avatar } from '@arco-design/web-react';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { TodoVo } from '@life-toolkit/vo/growth';
import { IconCheckCircle, IconClockCircle, IconExclamation } from '@arco-design/web-react/icon';

const { Title, Text } = Typography;

interface RecentTodosProps {
  todoList: TodoVo[];
}

export function RecentTodos({ todoList }: RecentTodosProps) {
  // 最近完成的任务（最近7天）
  const recentCompleted = todoList
    .filter((todo) => {
      if (todo.status !== 'done' || !todo.doneAt) return false;
      const doneDate = new Date(todo.doneAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return doneDate >= weekAgo;
    })
    .sort((a, b) => new Date(b.doneAt!).getTime() - new Date(a.doneAt!).getTime())
    .slice(0, 5);

  // 即将到期的任务
  const upcomingTasks = todoList
    .filter((todo) => todo.status === 'todo')
    .sort((a, b) => new Date(a.planDate).getTime() - new Date(b.planDate).getTime())
    .slice(0, 5);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return '今天';
    if (isTomorrow(date)) return '明天';
    if (isPast(date)) return '已逾期';
    return format(date, 'MM/dd');
  };

  const getDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isPast(date)) return 'red';
    if (isToday(date)) return 'orange';
    if (isTomorrow(date)) return 'blue';
    return 'gray';
  };

  const getPriorityIcon = (importance?: number, urgency?: number) => {
    if (importance === 1 && urgency === 1) {
      return <IconExclamation style={{ color: '#f53f3f' }} />;
    }
    return <IconClockCircle style={{ color: '#86909c' }} />;
  };

  return (
    <Space size={16} style={{ width: '100%' }}>
      <Card title="最近完成" style={{ flex: 1 }}>
        <List
          size="small"
          dataSource={recentCompleted}
          render={(todo) => (
            <List.Item key={todo.id}>
              <List.Item.Meta
                avatar={
                  <Avatar size={24} style={{ backgroundColor: '#00b42a' }}>
                    <IconCheckCircle />
                  </Avatar>
                }
                title={
                  <Text ellipsis style={{ maxWidth: 200 }}>
                    {todo.name}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {format(new Date(todo.doneAt!), 'MM/dd HH:mm')} 完成
                  </Text>
                }
              />
              {todo.tags && todo.tags.length > 0 && (
                <div>
                  {todo.tags.slice(0, 2).map((tag) => (
                    <Tag key={tag} size="small" style={{ marginLeft: 4 }}>
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </List.Item>
          )}
          noDataElement={
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Text type="secondary">暂无最近完成的任务</Text>
            </div>
          }
        />
      </Card>

      <Card title="即将到期" style={{ flex: 1 }}>
        <List
          size="small"
          dataSource={upcomingTasks}
          render={(todo) => (
            <List.Item key={todo.id}>
              <List.Item.Meta
                avatar={
                  <Avatar size={24} style={{ backgroundColor: '#165dff' }}>
                    {getPriorityIcon(todo.importance, todo.urgency)}
                  </Avatar>
                }
                title={
                  <Text ellipsis style={{ maxWidth: 200 }}>
                    {todo.name}
                  </Text>
                }
                description={
                  <Space size={8}>
                    <Tag color={getDateColor(todo.planDate)} size="small">
                      {getDateLabel(todo.planDate)}
                    </Tag>
                    {todo.importance === 1 && todo.urgency === 1 && (
                      <Tag color="red" size="small">
                        高优先级
                      </Tag>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
          noDataElement={
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Text type="secondary">暂无待处理任务</Text>
            </div>
          }
        />
      </Card>
    </Space>
  );
} 