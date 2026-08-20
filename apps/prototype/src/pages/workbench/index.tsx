import { Button, Card, Col, Flex, Row, Statistic } from '@sue/design-web-react';
import { CheckCircle2, CircleDot, Flame, Plus } from 'lucide-react';
import { PriorityTag } from '../../shared/components';
import { productRef } from '../../product-wiki';
import { TODAY } from '../../shared/mock-data';
import type { Goal, Habit, Task, Todo } from '../../shared/types';
import { compareTodoPlan, formatTodoPlan, goalName, repeatLabel } from '../../shared/utils';
import styles from './index.module.css';

type Props = {
  goals: Goal[];
  tasks: Task[];
  todos: Todo[];
  habits: Habit[];
  onNavigate: (path: string) => void;
  completeTodo: (todo: Todo) => void;
  markTodoIncomplete: (todo: Todo) => void;
};

export function Workbench({ goals, tasks, todos, habits, onNavigate, completeTodo, markTodoIncomplete }: Props) {
  const due = todos.filter((todo) => todo.status !== 'done' && todo.planned <= TODAY).sort(compareTodoPlan);
  const taskCompleted = tasks.filter((task) => task.status === 'done').length;
  const todoCompleted = todos.filter((todo) => todo.status === 'done').length;
  const activeHabits = habits.filter((habit) => habit.status === 'active').length;
  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <div data-product-ref={productRef('growth.goal.overview')}>
            <Card>
              <Statistic title="活跃目标" value={goals.filter((goal) => goal.status === 'doing').length} suffix="个" />
            </Card>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div data-product-ref={productRef('growth.todo.overview')}>
            <Card>
              <Statistic title="今日待办" value={due.length} suffix="项" />
            </Card>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div data-product-ref={productRef('growth.track-time.overview')}>
            <Card>
              <Statistic
                title="专注投入"
                value={Math.round(tasks.reduce((sum, task) => sum + task.actual, 0) * 10) / 10}
                suffix="小时"
              />
            </Card>
          </div>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <div data-product-ref={productRef('growth.habit.metrics')}>
            <Card>
              <Statistic title="习惯连续" value={Math.max(0, ...habits.map((habit) => habit.streak))} suffix="天" />
            </Card>
          </div>
        </Col>
      </Row>
      <section className={styles.statistics} aria-label="执行概览">
        <h2>执行概览</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card title="任务">
              <div className={styles.statGrid}>
                <Statistic title="完成率" value={Math.round(taskCompleted / Math.max(1, tasks.length) * 100)} suffix="%" />
                <Statistic title="进行中" value={tasks.filter((task) => task.status === 'doing').length} suffix="项" />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="待办">
              <div className={styles.statGrid}>
                <Statistic title="完成率" value={Math.round(todoCompleted / Math.max(1, todos.length) * 100)} suffix="%" />
                <Statistic title="待处理" value={todos.filter((todo) => todo.status === 'todo').length} suffix="项" />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="习惯">
              <div className={styles.statGrid}>
                <Statistic title="活跃" value={activeHabits} suffix="个" />
                <Statistic title="已完成" value={habits.filter((habit) => habit.status === 'completed').length} suffix="个" />
              </div>
            </Card>
          </Col>
        </Row>
      </section>
      <Row gutter={[16, 16]} className={styles.sectionRow}>
        <Col xs={24} lg={14}>
          <div data-product-ref={productRef('growth.todo.overview')}>
            <Card
              title="今日待办"
              extra={
                <Flex align="center" gap={8}>
                  <Button size="small" icon={<Plus size={15} />} onClick={() => onNavigate('/todos')}>新建待办</Button>
                  <Button type="link" onClick={() => onNavigate('/todos')}>全部待办</Button>
                </Flex>
              }
            >
              <div className={styles.list}>
                {due.map((todo) => (
                  <Flex className={styles.listRow} align="center" gap={10} key={todo.id}>
                    <span data-product-ref={productRef('growth.todo.interaction')}>
                      <Button
                        type="text"
                        shape="circle"
                        icon={todo.status === 'done' ? <CheckCircle2 size={17} /> : <CircleDot size={17} />}
                        onClick={() => completeTodo(todo)}
                      />
                    </span>
                    <Flex vertical className={styles.listItemContent} gap={4}>
                      <b>{todo.title}</b>
                      <small>
                        {formatTodoPlan(todo)}
                      </small>
                    </Flex>
                    <span data-product-ref={productRef('growth.todo.priority')}>
                      <PriorityTag importance={todo.importance} urgency={todo.urgency} />
                    </span>
                  </Flex>
                ))}
              </div>
            </Card>
          </div>
        </Col>
        <Col xs={24} lg={10}>
          <div data-product-ref={productRef('growth.habit.overview')}>
            <Card
              title="习惯打卡"
              extra={
                <Button type="link" onClick={() => onNavigate('/habits')}>
                  查看习惯
                </Button>
              }
            >
              <div className={styles.list}>
                {habits.map((habit) => (
                  <Flex className={styles.listRow} align="center" gap={10} key={habit.id}>
                    <span className={styles.habitIcon}>
                      <Flame size={16} />
                    </span>
                    <Flex vertical className={styles.listItemContent} gap={4}>
                      <b>{habit.title}</b>
                      <small>
                        {repeatLabel(habit.repeat)} · 连续 {habit.streak} 天 · {goalName(goals, habit.goalIds[0])}
                      </small>
                    </Flex>
                    <HabitTodoActions habit={habit} todos={todos} completeTodo={completeTodo} markTodoIncomplete={markTodoIncomplete} />
                  </Flex>
                ))}
              </div>
            </Card>
          </div>
        </Col>
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
  return <span data-product-ref={productRef('growth.habit.interaction')}>
    <Flex gap={6}>
      <Button size="small" type="primary" onClick={() => completeTodo(todo)}>完成</Button>
      <Button size="small" onClick={() => markTodoIncomplete(todo)}>未完成</Button>
    </Flex>
  </span>;
}
