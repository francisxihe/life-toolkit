'use client';

import {
  Input,
  Select,
  Button,
  Space,
  Grid,
  DatePicker,
} from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { IMPORTANCE_MAP, URGENCY_MAP } from '../constants';
import { GoalPageFiltersVo, GoalStatus } from '@life-toolkit/vo/goal';
import { useGoalAllContext } from './context';

const DatePickerRange = DatePicker.RangePicker;
const { Row, Col } = Grid;

export function GoalFilters() {
  const { getGoalPage, filters, setFilters, clearFilters } =
    useGoalAllContext();

  return (
    <Space className="w-full my-3" direction="vertical" size="large">
      <Row gutter={[16, 16]}>
        <Col flex="auto" span={6}>
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
        <Col flex="auto" span={12}>
          <DatePickerRange
            placeholder={['计划开始日期', '计划结束日期']}
            value={[filters.planDateStart, filters.planDateEnd]}
            onChange={(value) => {
              setFilters((prev: GoalPageFiltersVo) => ({
                ...prev,
                planDateStart: value[0],
                planDateEnd: value[1],
              }));
            }}
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
        <Col span={6}>
          <Select
            value={filters.urgency}
            onChange={(value) => {
              setFilters((prev: GoalPageFiltersVo) => ({
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
              setFilters((prev: GoalPageFiltersVo) => ({
                ...prev,
                status: value,
              }));
            }}
            allowClear
            placeholder="目标状态"
          >
            <Select.Option value={GoalStatus.TODO}>未完成</Select.Option>
            <Select.Option value={GoalStatus.DONE}>已完成</Select.Option>
            <Select.Option value={GoalStatus.ABANDONED}>已放弃</Select.Option>
          </Select>
        </Col>
        <Col span={6} className="">
          <div className="flex justify-end gap-2">
            <Button
              onClick={async () => {
                clearFilters();
              }}
            >
              重置
            </Button>
            <Button
              type="primary"
              onClick={async () => {
                await getGoalPage();
              }}
            >
              查询
            </Button>
          </div>
        </Col>
      </Row>
    </Space>
  );
}
