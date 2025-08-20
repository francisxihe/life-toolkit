'use client';

import { Input, Select, Grid, DatePicker } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { IMPORTANCE_MAP } from '../constants';
import {
  GoalPageFiltersVo,
  GoalStatus,
  GoalType,
} from '@life-toolkit/vo/growth';
import { useGoalAllContext } from './context';
import { TableFilter } from '@/components/Layout/TableFilter';

const DatePickerRange = DatePicker.RangePicker;
const { Row, Col } = Grid;

export function GoalFilters() {
  const { getGoalPage, filters, setFilters, clearFilters } =
    useGoalAllContext();

  return (
    <TableFilter
      clearFilters={async () => {
        await clearFilters();
      }}
      search={async () => {
        await getGoalPage();
      }}
    >
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Input
            prefix={<IconSearch />}
            placeholder="关键字"
            value={filters.keyword}
            onChange={(value) => {
              setFilters((prev: GoalPageFiltersVo) => ({
                ...prev,
                keyword: value,
              }));
            }}
          />
        </Col>
        <Col span={12}>
          <DatePickerRange
            className="w-full"
            placeholder={['开始时间', '结束时间']}
            format="YYYY-MM-DD"
            value={[filters.startAt, filters.endAt]}
            onChange={(value) => {
              setFilters((prev: GoalPageFiltersVo) => ({
                ...prev,
                startAt: value[0],
                endAt: value[1],
              }));
            }}
          />
        </Col>
        <Col span={6}>
          <Select
            value={filters.type}
            onChange={(value) => {
              setFilters((prev: GoalPageFiltersVo) => ({
                ...prev,
                type: value,
              }));
            }}
            allowClear
            placeholder="请选择目标类型"
            options={[
              {
                label: '规划目标',
                value: GoalType.OBJECTIVE,
              },
              {
                label: '成果目标',
                value: GoalType.KEY_RESULT,
              },
            ]}
          />
        </Col>
        <Col span={6}>
          <Select
            value={filters.status}
            onChange={(value) => {
              setFilters((prev: GoalPageFiltersVo) => ({
                ...prev,
                status: value,
              }));
            }}
            allowClear
            placeholder="目标状态"
            options={[
              {
                label: '未完成',
                value: GoalStatus.TODO,
              },
              {
                label: '进行中',
                value: GoalStatus.IN_PROGRESS,
              },
              {
                label: '已完成',
                value: GoalStatus.DONE,
              },
              {
                label: '已放弃',
                value: GoalStatus.ABANDONED,
              },
            ]}
          />
        </Col>
        <Col span={6}>
          <Select
            value={filters.importance}
            onChange={(value) => {
              setFilters((prev: GoalPageFiltersVo) => ({
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
      </Row>
    </TableFilter>
  );
}
