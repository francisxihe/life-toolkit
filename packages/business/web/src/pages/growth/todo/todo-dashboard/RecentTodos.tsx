'use client';

import { Typography, List, Tag, Avatar } from '@arco-design/web-react';
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 最近完成 */}
      <div className="bg-bg-2 rounded-xl p-6 shadow-sm border border-border-1">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-success-light-1 rounded-lg flex items-center justify-center mr-3">
            <div className="w-5 h-5 bg-success rounded"></div>
          </div>
          <div>
            <Title heading={5} className="!mb-0">最近完成</Title>
            <div className="text-sm text-text-3">最近7天完成的任务</div>
          </div>
        </div>
        
        <List
          size="small"
          dataSource={recentCompleted}
          render={(todo) => (
            <List.Item key={todo.id} className="!px-0">
              <List.Item.Meta
                avatar={
                  <Avatar size={24} style={{ backgroundColor: '#10b981' }}>
                    <IconCheckCircle />
                  </Avatar>
                }
                title={
                  <Text ellipsis style={{ maxWidth: 200 }} className="text-text-1">
                    {todo.name}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 12 }} className="text-text-3">
                    {format(new Date(todo.doneAt!), 'MM/dd HH:mm')} 完成
                  </Text>
                }
              />
              {todo.tags && todo.tags.length > 0 && (
                <div className="flex gap-1">
                  {todo.tags.slice(0, 2).map((tag) => (
                    <Tag key={tag} size="small">
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </List.Item>
          )}
          noDataElement={
            <div className="text-center py-8">
              <Text type="secondary" className="text-text-3">暂无最近完成的任务</Text>
            </div>
          }
        />
      </div>

      {/* 即将到期 */}
      <div className="bg-bg-2 rounded-xl p-6 shadow-sm border border-border-1">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-warning-light-1 rounded-lg flex items-center justify-center mr-3">
            <div className="w-5 h-5 bg-warning rounded"></div>
          </div>
          <div>
            <Title heading={5} className="!mb-0">即将到期</Title>
            <div className="text-sm text-text-3">按计划日期排序的待办任务</div>
          </div>
        </div>
        
        <List
          size="small"
          dataSource={upcomingTasks}
          render={(todo) => (
            <List.Item key={todo.id} className="!px-0">
              <List.Item.Meta
                avatar={
                  <Avatar size={24} style={{ backgroundColor: '#3b82f6' }}>
                    {getPriorityIcon(todo.importance, todo.urgency)}
                  </Avatar>
                }
                title={
                  <Text ellipsis style={{ maxWidth: 200 }} className="text-text-1">
                    {todo.name}
                  </Text>
                }
                description={
                  <div className="flex gap-2">
                    <Tag color={getDateColor(todo.planDate)} size="small">
                      {getDateLabel(todo.planDate)}
                    </Tag>
                    {todo.importance === 1 && todo.urgency === 1 && (
                      <Tag color="red" size="small">
                        高优先级
                      </Tag>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
          noDataElement={
            <div className="text-center py-8">
              <Text type="secondary" className="text-text-3">暂无待处理任务</Text>
            </div>
          }
        />
      </div>
    </div>
  );
} 