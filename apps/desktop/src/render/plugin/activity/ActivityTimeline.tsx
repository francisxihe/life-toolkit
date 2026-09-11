import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DatePicker, Flex, Input, Select } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { ActivityDomain } from '@true-north/enum';
import type { ActivityVo, HomeTodayVo } from '@true-north/vo';
import { ActivityController } from '@true-north/web-service';
import { getRendererRuntimeOptional } from '@true-north/plugin-sdk';
import dayjs from 'dayjs';
import useLocale from '@/utils/useLocale';
import { pluginPaths } from '../paths';
import styles from './ActivityTimeline.module.less';

function openLink(navigate: ReturnType<typeof useNavigate>, link: ActivityVo['links'][number]) {
  const presenters = getRendererRuntimeOptional()?.entityPresenters || [];
  const presenter = presenters.find((item) => {
    if (link.pluginId && link.entityType) {
      return item.pluginId === link.pluginId && item.entityType === link.entityType;
    }
    return item.entityType === String(link.domain);
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

export function ActivityTimeline() {
  const t = useLocale();
  const navigate = useNavigate();
  const [list, setList] = useState<ActivityVo[]>([]);
  const [today, setToday] = useState<HomeTodayVo | null>(null);
  const [keyword, setKeyword] = useState('');
  const [domain, setDomain] = useState<string>();
  const [date, setDate] = useState<string>(() => dayjs().format('YYYY-MM-DD'));

  useEffect(() => {
    void ActivityController.homeToday().then(setToday);
  }, []);

  useEffect(() => {
    void ActivityController.list({
      keyword: keyword || undefined,
      domain: domain as ActivityVo['links'][number]['domain'] | undefined,
      from: date ? dayjs(date).startOf('day').toISOString() : undefined,
      to: date ? dayjs(date).endOf('day').toISOString() : undefined,
    }).then((result) => setList(result?.list || []));
  }, [keyword, domain, date]);

  return (
    <Flex vertical className={styles.section} gap={16}>
      <h2 className={styles.heading}>{t['plugins.hub.recent']}</h2>
      <ProductSurface id={productRef('activity.view.today-summary')}>
        <Flex gap={16} wrap className={styles.summary}>
          <span>{t['plugins.hub.spent']} {today?.spent ?? 0}</span>
          <span>{t['plugins.hub.pendingPurchases']} {today?.pendingPurchases ?? 0}</span>
          <span>{t['plugins.hub.focus']} {formatDuration(today?.focusSeconds, t)}</span>
          <span>{t['plugins.hub.bookmarks']} {today?.bookmarkCount ?? 0}</span>
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
              value={domain}
              onChange={setDomain}
              options={[
                { label: t['menu.todo'] || '待办', value: ActivityDomain.TODO },
                { label: t['menu.expense'] || '记账', value: ActivityDomain.EXPENSE },
                { label: t['menu.purchase'] || '采购', value: ActivityDomain.PURCHASE },
                { label: t['menu.library'] || '收藏', value: ActivityDomain.BOOKMARK },
              ]}
            />
          </Flex>
          <Flex vertical gap={12}>
            {list.map((item) => (
              <Flex key={item.id} vertical className={styles.card} gap={8}>
                <strong>{item.title}</strong>
                <span className={styles.time}>{dayjs(item.occurredAt).format('YYYY-MM-DD HH:mm')}</span>
                <Flex gap={8} wrap>
                  {item.links.map((link) => (
                    <Button key={link.id} size="small" onClick={() => openLink(navigate, link)}>
                      {link.label || link.domain}
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
