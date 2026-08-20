import React, { useEffect, useState } from 'react';
import { Button, Col, Flex, Row, Space, Statistic, Tag } from '@sue/design-web-react';
import dayjs from 'dayjs';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoalContext } from '../context';
import { useGoalDetailContext } from '../../components/GoalDetail/context';
import { HabitService } from '@true-north/web-service';
import { IMPORTANCE_MAP } from '../../constants';
import styles from './style.module.less';

const GoalOverview: React.FC = () => {
  const navigate = useNavigate();
  const { selectedGoal } = useGoalContext();
  const { currentGoal } = useGoalDetailContext();
  const [habitCount, setHabitCount] = useState(0);

  const goal = selectedGoal;
  const taskCount =
    currentGoal?.id === goal?.id
      ? (currentGoal?.taskList?.length ?? goal?.taskList?.length ?? 0)
      : (goal?.taskList?.length ?? 0);

  useEffect(() => {
    let cancelled = false;
    async function loadHabits() {
      if (!goal?.id) {
        setHabitCount(0);
        return;
      }
      try {
        const habits = await HabitService.findByFilter({ goalId: goal.id });
        if (!cancelled) {
          setHabitCount(Array.isArray(habits) ? habits.length : 0);
        }
      } catch {
        if (!cancelled) setHabitCount(0);
      }
    }
    loadHabits();
    return () => {
      cancelled = true;
    };
  }, [goal?.id]);

  if (!goal) return null;

  const importance = IMPORTANCE_MAP.get(goal.importance);
  const start = goal.startAt ? dayjs(goal.startAt).format('YYYY-MM-DD') : '未设置';
  const end = goal.endAt ? dayjs(goal.endAt).format('YYYY-MM-DD') : '未设置';

  return (
    <Flex vertical gap={16} className={styles.overview}>
      <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
        <Space>
          {importance && <Tag color={importance.color}>{importance.label}</Tag>}
          <small className={styles.timeRange}>{`时间范围：${start} 至 ${end}`}</small>
        </Space>
        <Button
          icon={<Sparkles size={15} />}
          onClick={() => navigate(`/ai?goalId=${encodeURIComponent(goal.id)}`)}
        >
          AI 拆解
        </Button>
      </Flex>

      {goal.description ? (
        <p className={styles.goalDescription}>{goal.description}</p>
      ) : (
        <p className={styles.goalDescriptionMuted}>暂无描述</p>
      )}

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic title="关联任务" value={taskCount} suffix="项" />
        </Col>
        <Col span={12}>
          <Statistic title="关联习惯" value={habitCount} suffix="项" />
        </Col>
      </Row>
    </Flex>
  );
};

export default GoalOverview;
