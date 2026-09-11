import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover, Badge, Button, Flex, Spin } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { TodoRelatedType } from '@true-north/enum';
import type { HomeTodayVo } from '@true-north/vo';
import { ActivityController, TodoService } from '@true-north/web-service';
import { getRendererRuntimeOptional, requestOpenFocus } from '@true-north/plugin-sdk';
import useLocale from '../../utils/useLocale';
import styles from './style/index.module.less';

function openPresenter(navigate: ReturnType<typeof useNavigate>, pluginId: string, entityType: string, entityId: string) {
  const presenter = getRendererRuntimeOptional()?.entityPresenters.find(
    (item) => item.pluginId === pluginId && item.entityType === entityType,
  );
  navigate(presenter?.openPath(entityId) || '/plugins');
}

function pendingCount(today: HomeTodayVo | null): number {
  if (!today) return 0;
  return (
    today.todos.length +
    today.habits.length +
    today.purchases.length +
    (today.runningFocus ? 1 : 0)
  );
}

function TodayContent({
  today,
  loading,
  onCompleteTodo,
  onCheckHabit,
}: {
  today: HomeTodayVo | null;
  loading: boolean;
  onCompleteTodo: (id: string) => void;
  onCheckHabit: (cycleTodoId?: string) => void;
}) {
  const t = useLocale();
  const navigate = useNavigate();
  const empty = pendingCount(today) === 0;

  return (
    <ProductSurface id={productRef('notification.view.today')}>
      <div className={styles['message-box']}>
        <Spin spinning={loading} style={{ display: 'block' }}>
          <Flex vertical className={styles.today}>
            <strong className={styles.heading}>{t['today.title']}</strong>
            {empty && !loading ? <p className={styles.empty}>{t['today.empty']}</p> : null}
            {today?.runningFocus ? (
              <Flex justify="space-between" align="center" gap={8}>
                <span>
                  {t['today.focus']} · {today.runningFocus.label || t['today.focus']}
                </span>
                <Button size="small" onClick={() => requestOpenFocus({})}>
                  {t['today.continue']}
                </Button>
              </Flex>
            ) : null}
            {today?.todos.map((todo) => (
              <Flex key={todo.id} justify="space-between" align="center" gap={8}>
                <span>
                  {todo.overdue ? `${t['today.overdue']} · ` : ''}
                  {todo.name}
                </span>
                <Flex gap={8}>
                  <Button size="small" onClick={() => onCompleteTodo(todo.id)}>
                    {t['today.complete']}
                  </Button>
                  <Button size="small" type="link" onClick={() => openPresenter(navigate, 'growth', 'todo', todo.id)}>
                    {t['today.open']}
                  </Button>
                </Flex>
              </Flex>
            ))}
            {today?.habits.map((habit) => (
              <Flex key={habit.id} justify="space-between" align="center" gap={8}>
                <span>
                  {t['today.habit']} · {habit.name}
                </span>
                <Flex gap={8}>
                  <Button
                    size="small"
                    disabled={!habit.cycleTodoId}
                    onClick={() => onCheckHabit(habit.cycleTodoId)}
                  >
                    {t['today.checkin']}
                  </Button>
                  <Button size="small" type="link" onClick={() => openPresenter(navigate, 'growth', 'habit', habit.id)}>
                    {t['today.open']}
                  </Button>
                </Flex>
              </Flex>
            ))}
            {today?.purchases.map((item) => (
              <Flex key={item.id} justify="space-between" align="center" gap={8}>
                <span>
                  {t['today.purchase']} · {item.name}
                </span>
                <Button size="small" type="link" onClick={() => openPresenter(navigate, 'purchase', 'purchase', item.id)}>
                  {t['today.open']}
                </Button>
              </Flex>
            ))}
          </Flex>
        </Spin>
      </div>
    </ProductSurface>
  );
}

function MessageBox({ children }: { children: ReactNode }) {
  const [today, setToday] = useState<HomeTodayVo | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      setToday(await ActivityController.homeToday());
    } catch (error) {
      console.error(error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const completeTodo = async (id: string) => {
    await TodoService.done(TodoRelatedType.NONE, id);
    await load();
  };

  const checkHabit = async (cycleTodoId?: string) => {
    if (!cycleTodoId) return;
    await TodoService.done(TodoRelatedType.HABIT, cycleTodoId);
    await load();
  };

  return (
    <Popover
      trigger="click"
      content={
        <TodayContent
          today={today}
          loading={loading}
          onCompleteTodo={(id) => void completeTodo(id)}
          onCheckHabit={(cycleTodoId) => void checkHabit(cycleTodoId)}
        />
      }
      placement="rightTop"
      destroyOnHidden={false}
      onOpenChange={(open) => {
        if (open) void load(true);
      }}
    >
      <Badge count={pendingCount(today)} dot={false}>
        {children}
      </Badge>
    </Popover>
  );
}

export default MessageBox;
