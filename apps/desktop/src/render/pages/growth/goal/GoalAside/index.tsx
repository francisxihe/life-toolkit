import React, { useMemo, useState } from 'react';
import {
  Button,
  Flex,
  Tooltip,
} from '@sue/design-web-react';
import { Plus, SlidersHorizontal, X } from 'lucide-react';

import GoalFilters from './GoalFilters';
import GoalTree from './GoalTree';
import { useGoalContext } from '../context';
import { useGoalDetail } from '../../components/GoalDetail';
import styles from './style.module.less';

export default function GoalAside() {
  const { refreshData, searchValue, filters, clearFilters, setSearchValue } =
    useGoalContext();
  const { openCreateDrawer } = useGoalDetail();
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  const hasFilters = useMemo(() => {
    return Boolean(
      searchValue ||
        filters.status?.length ||
        filters.type ||
        filters.importance ||
        filters.difficulty ||
        filters.dateRange?.length,
    );
  }, [searchValue, filters]);

  const handleClearFilters = () => {
    clearFilters();
    setSearchValue('');
  };

  return (
    <Flex vertical container="full" gap={12} className={styles.aside}>
      <Flex
        container="fixed"
        className={styles.header}
        justify="space-between"
        align="center"
      >
        <span className={styles.title}>目标树</span>
        <Flex container="fixed" align="center" gap={0}>
          {hasFilters && (
            <Tooltip title="清空筛选">
              <Button
                type="text"
                size="small"
                icon={<X size={16} />}
                aria-label="清空筛选"
                onClick={handleClearFilters}
              />
            </Tooltip>
          )}
          <Tooltip title={filtersExpanded ? '收起筛选' : '展开筛选'}>
            <Button
              type={hasFilters ? 'primary' : 'text'}
              size="small"
              icon={<SlidersHorizontal size={14} />}
              aria-label={filtersExpanded ? '收起筛选' : '展开筛选'}
              aria-expanded={filtersExpanded}
              onClick={() => setFiltersExpanded((value) => !value)}
            />
          </Tooltip>
          <Tooltip title="新建目标">
            <Button
              type="text"
              size="small"
              icon={<Plus size={16} />}
              aria-label="新建目标"
              onClick={() =>
                openCreateDrawer({
                  title: '新建目标',
                  contentProps: {
                    afterSubmit: refreshData,
                  },
                })
              }
            />
          </Tooltip>
        </Flex>
      </Flex>

      {filtersExpanded && (
        <Flex container="fixed" className={styles.filters}>
          <GoalFilters />
        </Flex>
      )}

      <Flex container="fill" className={styles.treeArea}>
        <GoalTree />
      </Flex>
    </Flex>
  );
}
