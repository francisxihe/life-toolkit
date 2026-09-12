import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Popover, Badge, Button, Flex, Spin } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import type { HomeTodayVo } from '@true-north/vo';
import type { TodayCommand, TodayListItemAction, TodaySectionSnapshot } from '@true-north/plugin-sdk';
import { ActivityController } from '@true-north/web-service';
import { useHostActions, usePluginIpc, useRendererPlatform } from '@true-north/plugin-sdk/renderer';
import useLocale from '../../utils/useLocale';
import styles from './style/index.module.less';

function openPresenter(
  navigate: ReturnType<typeof useNavigate>,
  platform: ReturnType<typeof useRendererPlatform>,
  pluginId: string | undefined,
  entityType: string | undefined,
  entityId: string,
  href?: string,
) {
  if (href) {
    navigate(href);
    return;
  }
  const presenter = platform.entityPresenters.find(
    (item) => item.pluginId === pluginId && item.entityType === entityType,
  );
  navigate(presenter?.openPath(entityId) || '/plugins');
}

function pendingCount(today: HomeTodayVo | null): number {
  if (!today) return 0;
  return today.sections.reduce((sum, section) => {
    if (section.kind === 'timer') return sum + (section.timer ? 1 : 0);
    if (section.kind === 'list') return sum + (section.items?.length || 0);
    return sum;
  }, 0);
}

async function runCommand(
  ipc: ReturnType<typeof usePluginIpc>,
  command: TodayCommand,
) {
  const method = command.method.toLowerCase();
  if (method === 'get') return ipc.get(command.path, command.payload);
  if (method === 'post') return ipc.post(command.path, command.payload);
  if (method === 'put') return ipc.put(command.path, command.payload);
  return ipc.remove(command.path, command.payload);
}

function TodayContent({
  today,
  loading,
  onAction,
}: {
  today: HomeTodayVo | null;
  loading: boolean;
  onAction: (action: TodayListItemAction) => void;
}) {
  const t = useLocale();
  const navigate = useNavigate();
  const platform = useRendererPlatform();
  const empty = pendingCount(today) === 0;
  const sections = (today?.sections || []) as TodaySectionSnapshot[];

  return (
    <ProductSurface id={productRef('notification.view.today')}>
      <div className={styles['message-box']}>
        <Spin spinning={loading} style={{ display: 'block' }}>
          <Flex vertical className={styles.today}>
            <strong className={styles.heading}>{t['today.title']}</strong>
            {empty && !loading ? <p className={styles.empty}>{t['today.empty']}</p> : null}
            {sections.map((section) => {
              if (section.kind === 'timer' && section.timer) {
                return (
                  <Flex key={section.id} justify="space-between" align="center" gap={8}>
                    <span>
                      {t[section.titleKey] || section.titleKey} · {section.timer.label || t[section.titleKey]}
                    </span>
                    {section.timer.hostAction ? (
                      <Button size="small" onClick={() => onAction({ id: 'continue', labelKey: 'today.continue', hostAction: section.timer?.hostAction })}>
                        {t['today.continue'] || '继续'}
                      </Button>
                    ) : null}
                  </Flex>
                );
              }
              if (section.kind !== 'list') return null;
              return (section.items || []).map((item) => (
                <Flex key={`${section.id}:${item.id}`} justify="space-between" align="center" gap={8}>
                  <span>
                    {item.overdue ? `${t['today.overdue'] || ''} · ` : ''}
                    {item.label}
                  </span>
                  <Flex gap={8}>
                    {(item.actions || []).map((action) => (
                      <Button
                        key={action.id}
                        size="small"
                        disabled={action.disabled}
                        onClick={() => onAction(action)}
                      >
                        {t[action.labelKey] || action.labelKey}
                      </Button>
                    ))}
                    <Button
                      size="small"
                      type="link"
                      onClick={() =>
                        openPresenter(navigate, platform, item.pluginId, item.entityType, item.id, item.href)
                      }
                    >
                      {t['today.open']}
                    </Button>
                  </Flex>
                </Flex>
              ));
            })}
          </Flex>
        </Spin>
      </div>
    </ProductSurface>
  );
}

function MessageBox({ children }: { children: ReactNode }) {
  const [today, setToday] = useState<HomeTodayVo | null>(null);
  const [loading, setLoading] = useState(false);
  const ipc = usePluginIpc();
  const hostActions = useHostActions();

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

  const runAction = async (action: TodayListItemAction) => {
    if (action.hostAction) await hostActions.invoke(action.hostAction);
    if (action.command) await runCommand(ipc, action.command);
    await load();
  };

  return (
    <Popover
      trigger="click"
      content={<TodayContent today={today} loading={loading} onAction={(action) => void runAction(action)} />}
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
