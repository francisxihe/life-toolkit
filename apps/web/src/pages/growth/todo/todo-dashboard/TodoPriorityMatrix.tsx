'use client';

import { Card, Typography, Tag, Space } from '@arco-design/web-react';
import { TodoVo } from '@life-toolkit/vo/growth';
import styles from './style/priority-matrix.module.less';

const { Title, Text } = Typography;

interface TodoPriorityMatrixProps {
  todoList: TodoVo[];
}

export function TodoPriorityMatrix({ todoList }: TodoPriorityMatrixProps) {
  // 按优先级分类任务
  const priorityMatrix = {
    urgent_important: todoList.filter(
      (todo) => todo.importance === 1 && todo.urgency === 1 && todo.status === 'todo'
    ),
    urgent_not_important: todoList.filter(
      (todo) => todo.importance === 2 && todo.urgency === 1 && todo.status === 'todo'
    ),
    not_urgent_important: todoList.filter(
      (todo) => todo.importance === 1 && todo.urgency === 2 && todo.status === 'todo'
    ),
    not_urgent_not_important: todoList.filter(
      (todo) => todo.importance === 2 && todo.urgency === 2 && todo.status === 'todo'
    ),
  };

  const MatrixItem = ({ 
    title, 
    color, 
    tasks, 
    description 
  }: { 
    title: string; 
    color: string; 
    tasks: TodoVo[]; 
    description: string;
  }) => (
    <div className={styles.matrixItem}>
      <div className={styles.matrixHeader}>
        <Tag color={color} size="small">
          {tasks.length}
        </Tag>
        <Text style={{ fontSize: 12, fontWeight: 500 }}>
          {title}
        </Text>
      </div>
      <Text type="secondary" style={{ fontSize: 11 }}>
        {description}
      </Text>
      <div className={styles.taskList}>
        {tasks.slice(0, 3).map((task) => (
          <div key={task.id} className={styles.taskItem}>
            <Text ellipsis style={{ fontSize: 11 }}>
              {task.name}
            </Text>
          </div>
        ))}
        {tasks.length > 3 && (
          <Text type="secondary" style={{ fontSize: 10 }}>
            +{tasks.length - 3} 更多
          </Text>
        )}
      </div>
    </div>
  );

  return (
    <Card title="优先级矩阵" style={{ height: 400 }}>
      <div className={styles.matrix}>
        <div className={styles.matrixRow}>
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
        </div>
        <div className={styles.matrixRow}>
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
    </Card>
  );
} 