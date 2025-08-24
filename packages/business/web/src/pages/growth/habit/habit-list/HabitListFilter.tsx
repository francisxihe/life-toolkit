import { Button, Input, Message, Select, Grid } from '@arco-design/web-react';
import { IconRefresh, IconPlus, IconSearch } from '@arco-design/web-react/icon';
import { TableFilter } from '@/components/Layout/TableFilter';
import { HabitPageFiltersVo } from '@life-toolkit/vo/growth/habit';
import { useState } from 'react';
import { HABIT_STATUS_OPTIONS } from '../constants';

const { Row, Col } = Grid;

export default function HabitListFilter({
  handleRefresh,
  loading,
}: {
  handleRefresh: (filters: HabitPageFiltersVo) => Promise<void>;
  loading: boolean;
}) {
  const [filters, setFilters] = useState<HabitPageFiltersVo>({
    pageNum: 1,
    pageSize: 12,
  });

  return (
    <TableFilter
      clearFilters={async () => {
        await handleRefresh({
          pageNum: 1,
          pageSize: 12,
        });
      }}
      search={async () =>
        await handleRefresh({
          pageNum: 1,
          pageSize: 12,
        })
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Select
            placeholder="状态"
            options={HABIT_STATUS_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
          />
        </Col>
      </Row>
    </TableFilter>
  );
}
