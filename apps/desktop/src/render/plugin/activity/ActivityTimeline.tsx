import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DatePicker, Flex, Input, Select } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import type { ActivityVo, HomeTodayVo } from '@true-north/vo';
import { ActivityController } from '@true-north/web-service';
import { useRendererPlatform } from '@true-north/plugin-sdk/renderer';
import dayjs from 'dayjs';
import useLocale from '@/utils/useLocale';
import { pluginPaths } from '../paths';
import styles from './ActivityTimeline.module.less';

function openLink(
  navigate: ReturnType<typeof useNavigate>,
  platform: ReturnType<typeof useRendererPlatform>,
  link: ActivityVo['links'][number],
) {
  const presenter = platform.entityPresenters.find((item) => {
    if (link.pluginId && link.entityType) {
      return item.pluginId === link.pluginId && item.entityType === link.entityType;
    }
    return false;
  });
  navigate(presenter?.openPath(link.entityId) || pluginPaths.root);
}

function formatDuration(totalSeconds: number | undefined, t: Record<string, string>) {
  const seconds = Math.max(0, totalSeconds || 0);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} ${t['plugins.hub.hours']} ${minutes} ${t['plugins.hub.minutes']}`;
  return `${minutes} ${t['plugins.hub.minutes']}`;
}

function metricValue(today: HomeTodayVo | null, id: string) {
  return today?.sections.find((section) => section.id === id && section.kind === 'metric')?.value ?? 0;
}

export function ActivityTimeline() {
  const t = useLocale();
  const navigate = useNavigate();
  const platform = useRendererPlatform();
  const [list, setList] = useState<ActivityVo[]>([]);
  const [today, setToday] = useState<HomeTodayVo | null>(null);
  const [keyword, setKeyword] = useState('');
  const [pluginId, setPluginId] = useState<string>();
  const [date, setDate] = useState<string>(() => dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    void ActivityController.homeToday().then(setToday);
  }, []);

  useEffect(() => {
    void ActivityController.list({
      keyword: keyword || undefined,
      pluginId: pluginId || undefined,
      from: date ? dayjs(date).startOf('day').toISOString() : undefined,
      to: date ? dayjs(date).endOf('day').toISOString() : undefined,
    }).then((result) => setList(result?.list || []));
  }, [keyword, pluginId, date]);

  return (
    <Flex vertical className={styles.section} gap={16}>
      <h2 className={styles.heading}>{t['plugins.hub.recent']}</h2>
      <ProductSurface id={productRef('activity.view.today-summary')}>
        <Flex gap={16} wrap className={styles.summary}>
          <span>{t['plugins.hub.spent']} {metricValue(today, 'expense.spent')}</span>
          <span>{t['plugins.hub.pendingPurchases']} {metricValue(today, 'purchase.pending')}</span>
          <span>{t['plugins.hub.focus']} {formatDuration(metricValue(today, 'growth.focus'), t)}</span>
          <span>{t['plugins.hub.bookmarks']} {metricValue(today, 'library.bookmarks')}</span>
        </Flex>
      </ProductSurface>
      <ProductSurface id={productRef('activity.view.timeline')}>
        <Flex vertical gap={12}>
          <Flex gap={8} wrap>
            <Input
              allowClear
              placeholder={t['plugins.hub.searchActivity']}
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <DatePicker
              allowClear
              value={date ? dayjs(date) : undefined}
              onChange={(value) => setDate(value ? value.format('YYYY-MM-DD') : undefined)}
            />
            <Select
              allowClear
              placeholder={t['plugins.hub.filterType']}
              style={{ width: 140 }}
              value={pluginId}
              onChange={setPluginId}
              options={platform.plugins.map((plugin) => ({
                label: t[plugin.nameKey] || plugin.pluginId,
                value: plugin.pluginId,
              }))}
            />
          </Flex>
          <Flex vertical gap={12}>
            {list.map((item) => (
              <Flex key={item.id} vertical className={styles.card} gap={8}>
                <strong>{item.title}</strong>
                <span className={styles.time}>{dayjs(item.occurredAt).format('YYYY-MM-DD HH:mm')}</span>
                <Flex gap={8} wrap>
                  {item.links.map((link) => (
                    <Button key={link.id} size="small" onClick={() => openLink(navigate, platform, link)}>
                      {link.label || link.entityType || link.pluginId}
                    </Button>
                  ))}
                </Flex>
              </Flex>
            ))}
            {!list.length ? <p className={styles.empty}>{t['plugins.hub.emptyActivity']}</p> : null}
          </Flex>
        </Flex>
      </ProductSurface>
    </Flex>
  );
}

export default ActivityTimeline;
