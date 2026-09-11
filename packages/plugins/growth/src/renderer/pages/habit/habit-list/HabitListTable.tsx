import { Button, Col, Empty, Flex, Row, Spin } from '@sue/design-web-react';
import { useNavigate } from 'react-router-dom';
import { HabitStatus } from '@true-north/enum';
import { HabitVo } from '@true-north/vo';
import HabitCard from '../components/HabitCard';
import { growthHref } from '@true-north/plugin-growth/contract';
import { useHabitListContext } from './context';
import styles from './HabitListTable.module.less';

export default function HabitListTable() {
  const navigate = useNavigate();
  const {
    habits,
    loading,
    pagination,
    handlePageChange,
    handleHabitComplete,
    handleHabitIncomplete,
    handleHabitDelete,
  } = useHabitListContext();
  const canPrevious = pagination.current > 1;
  const canNext = pagination.current * pagination.pageSize < pagination.total;
  const goalLabel = (habit: (typeof habits)[number]) =>
    ((habit as HabitVo).goals || []).map((goal) => goal.name).join(' · ');

  if (loading && !habits.length) {
    return (
      <Flex container="full" className={styles.loading} align="center" justify="center">
        <Spin />
      </Flex>
    );
  }
  if (!habits.length) {
    return (
      <Flex container="full" className={styles.empty} align="center" justify="center">
        <Empty description="暂无习惯，开始建立一个可持续的行动吧" />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={16} className={styles.wrapper}>
      <Row gutter={[16, 16]}>
        {habits.map((habit) => (
          <Col key={habit.id} xs={24} md={12} xl={8}>
            <HabitCard
              habit={habit}
              goalLabel={goalLabel(habit)}
              onComplete={
                habit.status === HabitStatus.ACTIVE && habit.cycleTodoId
                  ? () => handleHabitComplete(habit.id)
                  : undefined
              }
              onIncomplete={
                habit.status === HabitStatus.ACTIVE && habit.cycleTodoId
                  ? () => handleHabitIncomplete(habit.id)
                  : undefined
              }
              onDelete={() => handleHabitDelete(habit.id)}
              onEdit={() => navigate(growthHref({ area: 'habit', tab: 'detail', id: habit.id }))}
            />
          </Col>
        ))}
      </Row>
      <Flex className={styles.pagination} align="center" justify="space-between">
        <span>
          第 {pagination.current} 页，共 {pagination.total} 个习惯
        </span>
        <Flex gap={8}>
          <Button
            size="small"
            disabled={!canPrevious}
            onClick={() => handlePageChange(pagination.current - 1, pagination.pageSize)}
          >
            上一页
          </Button>
          <Button
            size="small"
            disabled={!canNext}
            onClick={() => handlePageChange(pagination.current + 1, pagination.pageSize)}
          >
            下一页
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
