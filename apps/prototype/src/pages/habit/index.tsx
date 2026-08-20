import { Button, Card, Col, Flex, Progress, Row, Space, Statistic } from '@sue/design-web-react';
import { Flame, Plus } from 'lucide-react';
import { StateTag } from '../../shared/components';
import { productRef } from '../../product-wiki';
import type { DrawerState, Goal, Habit, Todo } from '../../shared/types';
import { goalName, repeatLabel } from '../../shared/utils';
import styles from './index.module.css';

type Props = {
  habits: Habit[];
  goals: Goal[];
  todos: Todo[];
  setDrawer: (drawer: DrawerState) => void;
  completeTodo: (todo: Todo) => void;
  markTodoIncomplete: (todo: Todo) => void;
};
export function HabitsPage({ habits, goals, todos, setDrawer, completeTodo, markTodoIncomplete }: Props) {
  return (
    <>
      <Flex className={styles.habitToolbar} align="center" justify="end" data-product-ref={productRef('growth.habit.interaction')}>
        <Button type="primary" icon={<Plus size={15} />} onClick={() => setDrawer({ kind: 'habit' })}>新建习惯</Button>
      </Flex>
      <Row gutter={[16, 16]}>
        {habits.map((habit) => (
          <Col xs={24} md={12} xl={8} key={habit.id}>
            <div data-product-ref={productRef('growth.habit.view.list')}>
              <Card title={habit.title} extra={<StateTag status={habit.status} />}>
                <p data-product-ref={productRef('growth.habit.rules')} className={styles.habitGoal}>
                  {habit.goalIds.map((id) => goalName(goals, id)).join(' · ')}
                </p>
                <p data-product-ref={productRef('growth.habit.rules')} className={styles.habitFrequency}>
                  执行规则：{repeatLabel(habit.repeat)}
                </p>
                <div data-product-ref={productRef('growth.habit.metrics')}>
                  <Statistic title="当前连续" value={habit.streak} suffix="天" prefix={<Flame size={16} />} />
                  <Progress percent={Math.min(100, habit.streak * 7)} showInfo={false} />
                </div>
                <Flex justify="space-between" align="center" className={styles.cardActions}>
                  <span data-product-ref={productRef('growth.habit.interaction')}>
                    <HabitTodoActions habit={habit} todos={todos} completeTodo={completeTodo} markTodoIncomplete={markTodoIncomplete} />
                  </span>
                  <span data-product-ref={productRef('growth.habit.interaction')}>
                    <Button type="link" onClick={() => setDrawer({ kind: 'habit', id: habit.id })}>
                      编辑
                    </Button>
                  </span>
                </Flex>
              </Card>
            </div>
          </Col>
        ))}
      </Row>
    </>
  );
}

function HabitTodoActions({ habit, todos, completeTodo, markTodoIncomplete }: { habit: Habit; todos: Todo[]; completeTodo: (todo: Todo) => void; markTodoIncomplete: (todo: Todo) => void }) {
  const todo = todos.find((item) => item.habitId === habit.id && item.status !== 'done' && item.status !== 'abandoned');
  if (habit.status === 'completed') return <span>执行规则已结束</span>;
  if (habit.status === 'paused') return <span>已暂停打卡</span>;
  if (habit.status === 'abandoned') return <span>已放弃习惯</span>;
  if (!todo) return <span>下一次待办已安排</span>;
  return <Space>
    <Button size="small" type="primary" onClick={() => completeTodo(todo)}>完成</Button>
    <Button size="small" onClick={() => markTodoIncomplete(todo)}>未完成</Button>
  </Space>;
}
