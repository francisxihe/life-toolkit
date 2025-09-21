import { Select, Grid } from '@arco-design/web-react';
import { TableFilter } from '@/components/Layout/TableFilter';
import { HabitPageFilterVo } from '@life-toolkit/vo';
import { useState } from 'react';
import { HABIT_STATUS_OPTIONS } from '../constants';
import { useHabitListContext } from './context';

const { Row, Col } = Grid;

export default function HabitListFilter() {
  const { handleRefresh } = useHabitListContext();
  const [filters, setFilters] = useState<HabitPageFilterVo>({
    pageNum: 1,
    pageSize: 12,
  });

  return (
    <TableFilter
      clearFilters={async () => {
        await handleRefresh();
      }}
      search={async () => {
        await handleRefresh();
      }}
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
            allowClear
          />
        </Col>
      </Row>
    </TableFilter>
  );
}
