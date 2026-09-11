import { Flex } from '@sue/design-web-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import type { GrowthArea } from '@true-north/plugin-growth/contract';
import { growthHref } from '@true-north/plugin-growth/contract';
import useLocale from '@/utils/useLocale';
import TodoPage from './todo';
import TaskPage from './task';
import HabitPage from './habit';
import GoalPage from './goal';
import { useGrowthView } from './view';
import styles from './GrowthApp.module.less';

const AREAS: Array<{ area: GrowthArea; nameKey: string }> = [
  { area: 'todo', nameKey: 'menu.todo' },
  { area: 'task', nameKey: 'menu.task' },
  { area: 'habit', nameKey: 'menu.habit' },
  { area: 'goal', nameKey: 'menu.goal' },
];

export default function GrowthApp() {
  const t = useLocale();
  const navigate = useNavigate();
  const { area, tab, id } = useGrowthView();

  return (
    <Flex vertical container="full" className={styles.page}>
      <Flex align="center" gap={4} className={styles.tabs}>
        {AREAS.map((item) => {
          const active = area === item.area;
          return (
            <button
              key={item.area}
              type="button"
              className={clsx(styles.tab, active && styles.tabActive)}
              onClick={() => {
                if (!active) navigate(growthHref({ area: item.area }));
              }}
            >
              {t[item.nameKey] || item.nameKey}
            </button>
          );
        })}
      </Flex>
      <Flex container="fill" className={styles.stage}>
        {area === 'todo' ? <TodoPage tab={tab} /> : null}
        {area === 'task' ? <TaskPage tab={tab} /> : null}
        {area === 'habit' ? <HabitPage tab={tab} id={id} /> : null}
        {area === 'goal' ? <GoalPage /> : null}
      </Flex>
    </Flex>
  );
}
