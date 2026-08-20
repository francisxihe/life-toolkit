'use client';

import { Input, Select, DatePicker, Row, Col, SearchOutlined } from '@sue/design-web-react';
import dayjs from 'dayjs';

import { IMPORTANCE_MAP, URGENCY_MAP } from '../../constants';
import { useTodoAllContext } from './context';
import { TodoPageFilterVo } from '@true-north/vo';
import { TableFilter } from '@/components/Layout/TableFilter';
import { TodoStatus } from '@true-north/enum';

const DatePickerRange = DatePicker.RangePicker;

export function TodoFilters() {
  const { getTodoPage, filters, setFilters, clearFilters } =
    useTodoAllContext();

  return (
    <TableFilter
      clearFilters={async () => {
        await clearFilters();
      }}
      search={async () => {
        await getTodoPage();
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="关键字"
            value={filters.keyword}
            onChange={(event) => {
              setFilters((prev: TodoPageFilterVo) => ({
                ...prev,
                keyword: event.target.value,
              }));
            }}
          />
        </Col>
        <Col span={12}>
          <DatePickerRange
            placeholder={['计划开始日期', '计划结束日期']}
            value={filters.planDateStart && filters.planDateEnd ? [dayjs(filters.planDateStart), dayjs(filters.planDateEnd)] : undefined}
            className="w-full"
            onChange={(value) => {
              setFilters((prev: TodoPageFilterVo) => ({
                ...prev,
                planDateStart: value?.[0]?.format('YYYY-MM-DD'),
                planDateEnd: value?.[1]?.format('YYYY-MM-DD'),
              }));
            }}
          />
        </Col>
        <Col span={6}>
          <Select
            value={filters.importance}
            onChange={(value) => {
              setFilters((prev: TodoPageFilterVo) => ({
                ...prev,
                importance: value,
              }));
            }}
            allowClear
            placeholder="重要程度"
          >
            {[...Array.from(IMPORTANCE_MAP.entries())].map(
              ([key, { label }]) => (
                <Select.Option key={key} value={key}>
                  {label}
                </Select.Option>
              ),
            )}
          </Select>
        </Col>
        <Col span={6}>
          <Select
            value={filters.urgency}
            onChange={(value) => {
              setFilters((prev: TodoPageFilterVo) => ({
                ...prev,
                urgency: value,
              }));
            }}
            allowClear
            placeholder="紧急程度"
          >
            {[...Array.from(URGENCY_MAP.entries())].map(([key, { label }]) => (
              <Select.Option key={key} value={key}>
                {label}
              </Select.Option>
            ))}
          </Select>
        </Col>
        <Col span={6}>
          <Select
            value={filters.status}
            onChange={(value) => {
              setFilters((prev: TodoPageFilterVo) => ({
                ...prev,
                status: value,
              }));
            }}
            allowClear
            placeholder="待办状态"
          >
            <Select.Option value={TodoStatus.TODO}>未完成</Select.Option>
            <Select.Option value={TodoStatus.DONE}>已完成</Select.Option>
            <Select.Option value={TodoStatus.ABANDONED}>已放弃</Select.Option>
          </Select>
        </Col>
      </Row>
    </TableFilter>
  );
}
