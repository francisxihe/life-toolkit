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
import { GoalPageFiltersVo, GoalStatus, GoalType } from '@life-toolkit/vo/growth';
import { useGoalAllContext } from './context';

const DatePickerRange = DatePicker.RangePicker;
const { Row, Col } = Grid;

export function GoalFilters() {
  const { getGoalPage, filters, setFilters, clearFilters } =
    useGoalAllContext();

  return (
    <Space className="w-full my-3" direction="vertical" size="large">
      <Row gutter={[16, 16]}>
        <Col span={4}>
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
        <Col span={8}>
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
        <Col span={4}>
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
        <Col span={4}>
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
        <Col span={4}>
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
        <Col span={4}>
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
        <Col span={4}></Col>
        <Col span={4}></Col>
        <Col span={4}></Col>
        <Col span={8} className="flex justify-end">
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
