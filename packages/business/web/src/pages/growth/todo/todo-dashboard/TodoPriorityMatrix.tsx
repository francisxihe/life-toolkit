'use client';

import { Typography, Tag } from '@arco-design/web-react';
import { TodoVo } from '@life-toolkit/vo';

const { Title, Text } = Typography;

interface TodoPriorityMatrixProps {
  todoList: TodoVo[];
}

export function TodoPriorityMatrix({ todoList }: TodoPriorityMatrixProps) {
  // 按优先级分类任务
  const priorityMatrix = {
    urgent_important: todoList.filter(
      (todo) =>
        todo.importance === 1 && todo.urgency === 1 && todo.status === 'todo',
    ),
    urgent_not_important: todoList.filter(
      (todo) =>
        todo.importance === 2 && todo.urgency === 1 && todo.status === 'todo',
    ),
    not_urgent_important: todoList.filter(
      (todo) =>
        todo.importance === 1 && todo.urgency === 2 && todo.status === 'todo',
    ),
    not_urgent_not_important: todoList.filter(
      (todo) =>
        todo.importance === 2 && todo.urgency === 2 && todo.status === 'todo',
    ),
  };

  const MatrixItem = ({
    title,
    color,
    tasks,
    description,
  }: {
    title: string;
    color: string;
    tasks: TodoVo[];
    description: string;
  }) => (
    <div className="bg-fill-1 rounded-lg p-4 h-full">
      <div className="flex items-center justify-between mb-2">
        <Tag color={color} size="small">
          {tasks.length}
        </Tag>
        <Text style={{ fontSize: 12, fontWeight: 500 }} className="text-text-1">
          {title}
        </Text>
      </div>
      <Text
        type="secondary"
        style={{ fontSize: 11 }}
        className="block mb-3 text-text-3"
      >
        {description}
      </Text>
      <div className="space-y-1">
        {tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="bg-bg-2 rounded px-2 py-1">
            <Text ellipsis style={{ fontSize: 11 }} className="text-text-2">
              {task.name}
            </Text>
          </div>
        ))}
        {tasks.length > 3 && (
          <Text
            type="secondary"
            style={{ fontSize: 10 }}
            className="block text-center pt-1 text-text-3"
          >
            +{tasks.length - 3} 更多
          </Text>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-bg-2 rounded-xl p-6 shadow-sm border border-border-1 h-full">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 bg-link-light-1 rounded-lg flex items-center justify-center mr-3">
          <div className="w-5 h-5 bg-link rounded"></div>
        </div>
        <div>
          <Title heading={5} className="!mb-0">
            优先级矩阵
          </Title>
          <div className="text-sm text-text-3">
            基于艾森豪威尔矩阵的任务分类
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 h-64">
        <MatrixItem
          title="紧急重要"
          color="red"
          tasks={priorityMatrix.urgent_important}
          description="立即处理"
        />
        <MatrixItem
          title="紧急不重要"
          color="orange"
          tasks={priorityMatrix.urgent_not_important}
          description="委托他人"
        />
        <MatrixItem
          title="不紧急重要"
          color="blue"
          tasks={priorityMatrix.not_urgent_important}
          description="计划安排"
        />
        <MatrixItem
          title="不紧急不重要"
          color="gray"
          tasks={priorityMatrix.not_urgent_not_important}
          description="有空再做"
        />
      </div>
    </div>
  );
}
