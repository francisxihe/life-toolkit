import { Flex } from '@sue/design-web-react';
import { Goal as GoalIcon } from 'lucide-react';
import { productRef } from '../../product-wiki';
import type { Goal, Task } from '../../shared/types';
import { GoalManagementHeader } from './GoalManagementHeader';
import styles from './index.module.css';

export function MindMapPage({ goals, tasks }: { goals: Goal[]; tasks: Task[] }) {
  const rootGoal = goals[0];
  const childGoals = goals.filter((goal) => goal.parentId === rootGoal?.id);

  return (
    <>
      <GoalManagementHeader />
      <Flex className={styles.mindmap} align="center" justify="center" gap={72} data-product-ref={productRef('growth.goal.view.mindmap')}>
        <Flex className={styles.mapRoot} align="center" gap={10}>
          <GoalIcon size={20} />
          <b>{rootGoal?.title}</b>
        </Flex>
        <Flex vertical className={styles.mapBranches} gap={18}>
          {childGoals.map((goal) => (
            <Flex vertical className={styles.mapBranch} gap={6} key={goal.id}>
              <b>{goal.title}</b>
              {tasks.filter((task) => task.goalId === goal.id).map((task) => <span key={task.id}>{task.title}</span>)}
            </Flex>
          ))}
        </Flex>
      </Flex>
    </>
  );
}
