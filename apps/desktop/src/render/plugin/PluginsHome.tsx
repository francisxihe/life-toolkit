import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, Input } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { ChevronRight, Search } from 'lucide-react';
import { getRendererRuntime } from '@true-north/plugin-sdk';
import type { PluginRuntimeEntry } from '@true-north/plugin-sdk';
import useLocale from '@/utils/useLocale';
import { ActivityTimeline } from './activity/ActivityTimeline';
import styles from './PluginsHome.module.less';

function entryLabel(t: Record<string, string>, entry: PluginRuntimeEntry) {
  return t[entry.nameKey] || entry.nameKey;
}

function entryDescription(t: Record<string, string>, entry: PluginRuntimeEntry) {
  return entry.descriptionKey ? t[entry.descriptionKey] || '' : '';
}

function matchesQuery(t: Record<string, string>, entry: PluginRuntimeEntry, query: string) {
  if (!query) return true;
  const haystack = [
    entryLabel(t, entry),
    entryDescription(t, entry),
    entry.pluginId,
    ...(entry.keywords || []),
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export default function PluginsHome() {
  const t = useLocale();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const entries = getRendererRuntime().plugins;
  const normalized = query.trim().toLowerCase();
  const filtered = useMemo(
    () => entries.filter((entry) => matchesQuery(t, entry, normalized)),
    [entries, normalized, t],
  );
  const grouped = useMemo(() => {
    const map = new Map<string, PluginRuntimeEntry[]>();
    for (const entry of filtered) {
      const key = entry.categoryKey || 'plugins.category.builtin';
      const bucket = map.get(key) || [];
      bucket.push(entry);
      map.set(key, bucket);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <Flex vertical className={styles.page} gap={28}>
      <ProductSurface id={productRef('plugins.view.catalog')}>
        <Flex vertical gap={20}>
          <header className={styles.hero}>
            <h1 className={styles.title}>{t['plugins.hub.title']}</h1>
            <p className={styles.subtitle}>{t['plugins.hub.subtitle']}</p>
          </header>
          <Input
            allowClear
            className={styles.search}
            prefix={<Search size={16} />}
            placeholder={t['plugins.hub.search']}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <section>
            <h2 className={styles.sectionTitle}>{t['plugins.hub.enabled']}</h2>
            <Flex className={styles.strip} gap={16} wrap>
              {filtered.map((entry) => {
                const Icon = entry.icon;
                return (
                  <button
                    key={entry.pluginId}
                    type="button"
                    className={styles.iconBtn}
                    title={entryLabel(t, entry)}
                    onClick={() => navigate(entry.path)}
                  >
                    <span className={styles.iconTile}>
                      {Icon ? <Icon size={22} strokeWidth={1.75} /> : entry.pluginId.slice(0, 1)}
                    </span>
                    <span className={styles.iconLabel}>{entryLabel(t, entry)}</span>
                  </button>
                );
              })}
            </Flex>
          </section>
          {grouped.map(([categoryKey, items]) => (
            <section key={categoryKey}>
              <h2 className={styles.sectionTitle}>{t[categoryKey] || categoryKey}</h2>
              <div className={styles.grid}>
                {items.map((entry) => {
                  const Icon = entry.icon;
                  return (
                    <button
                      key={entry.pluginId}
                      type="button"
                      className={styles.row}
                      onClick={() => navigate(entry.path)}
                    >
                      <span className={styles.rowIcon}>
                        {Icon ? <Icon size={20} strokeWidth={1.75} /> : entry.pluginId.slice(0, 1)}
                      </span>
                      <span className={styles.rowCopy}>
                        <strong>{entryLabel(t, entry)}</strong>
                        {entryDescription(t, entry) ? <em>{entryDescription(t, entry)}</em> : null}
                      </span>
                      <ChevronRight size={16} className={styles.chevron} />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
          {!filtered.length ? <p className={styles.empty}>{t['plugins.hub.empty']}</p> : null}
        </Flex>
      </ProductSurface>
      <ActivityTimeline />
    </Flex>
  );
}
