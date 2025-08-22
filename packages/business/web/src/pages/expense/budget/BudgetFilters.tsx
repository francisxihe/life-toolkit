'use client';

import { useState } from 'react';
import { Select, DatePicker, Grid } from '@arco-design/web-react';
import { IconCalendar } from '@arco-design/web-react/icon';
import { useExpenses } from '../context';
import { PERIODS } from '../constants';
import { TagSelector } from '../../../components/TagSelector';
import { Dayjs } from 'dayjs';

const { Row, Col } = Grid;

export default function BudgetFilters() {
  const { filters, setFilters } = useExpenses();
  const [date, setDate] = useState<Date | undefined>(filters.dateRange.from);

  const handleDateSelect = (dateString: string, date: Date | undefined) => {
    setDate(date);
    if (date) {
      setFilters({
        ...filters,
        dateRange: {
          from: date,
          to: new Date(date.getFullYear(), date.getMonth() + 1, 0),
        },
      });
    }
  };

  return (
    <div className="space-y-4">
      <Row gutter={[16, 16]}>
        <Col flex="auto" span={6}>
          <Select
            className="w-[200px]"
            value={filters.period}
            onChange={(value) => setFilters({ ...filters, period: value })}
            placeholder="Select period"
          >
            {Object.entries(PERIODS).map(([key, label]) => (
              <Select.Option key={key} value={key}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Col>

        <Col flex="auto" span={12}>
          <DatePicker
            className="w-[200px]"
            value={date}
            onChange={(dateString: string, date: Dayjs) => {
              handleDateSelect(dateString, date?.toDate());
            }}
            placeholder="Pick a date"
            prefix={<IconCalendar />}
          />
        </Col>
        <Col flex="auto" span={6}>
          <TagSelector
            multiple={true}
            value={filters.tags}
            onChange={(tags) => setFilters({ ...filters, tags })}
          />
        </Col>
      </Row>
    </div>
  );
}
