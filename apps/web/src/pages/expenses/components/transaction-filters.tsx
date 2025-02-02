'use client';

import { useState } from 'react';
import { Select } from '@arco-design/web-react';
import { DatePicker } from '@arco-design/web-react';
import { IconCalendar } from '@arco-design/web-react/icon';
import { useExpenses } from '../context/expenses-context';
import { PERIODS } from '../constants';
import { TagInput } from '../../todo/components/TagInput';
import { Dayjs } from 'dayjs';

export function TransactionFilters() {
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
      <div className="flex flex-wrap gap-4">
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

        <Select
          className="w-[200px]"
          value={filters.type}
          onChange={(value) => setFilters({ ...filters, type: value })}
          placeholder="All types"
        >
          <Select.Option value="income">Income</Select.Option>
          <Select.Option value="expense">Expense</Select.Option>
        </Select>

        <DatePicker
          className="w-[200px]"
          value={date}
          onChange={(dateString: string, date: Dayjs) => {
            handleDateSelect(dateString, date?.toDate());
          }}
          placeholder="Pick a date"
          prefix={<IconCalendar />}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="w-full">
          <TagInput
            value={filters.tags}
            onChange={(tags) => setFilters({ ...filters, tags })}
            placeholder="Filter by tags..."
          />
        </div>
      </div>
    </div>
  );
}
