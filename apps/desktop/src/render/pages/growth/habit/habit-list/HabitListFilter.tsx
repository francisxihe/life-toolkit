import { Select, Row, Col } from '@sue/design-web-react';

import { TableFilter } from '@/components/Layout/TableFilter';
import { HABIT_STATUS_OPTIONS } from '../constants';
import { useHabitListContext } from './context';

export default function HabitListFilter() {
  const { handleRefresh, filters, setFilters } = useHabitListContext();

  return (
    <TableFilter
      clearFilters={async () => {
        setFilters({ pageNum: 1, pageSize: 12 });
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
            onChange={(value) => setFilters((current) => ({ ...current, status: value, pageNum: 1 }))}
            allowClear
          />
        </Col>
      </Row>
    </TableFilter>
  );
}
