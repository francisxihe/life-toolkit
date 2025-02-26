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
import { TagSelector } from '../../../../components/TagSelector';
import type { TaskPageFiltersVo } from '@life-toolkit/vo/task';
import { useTaskAllContext } from './context';

const DatePickerRange = DatePicker.RangePicker;
const { Row, Col } = Grid;

export function TaskFilters() {
  const { getTaskPage, filters, setFilters, clearFilters } =
    useTaskAllContext();

  return (
    <Space className="w-full my-3" direction="vertical" size="large">
      <Row gutter={[16, 16]}>
        <Col flex="auto" span={6}>
          <Input
            prefix={<IconSearch />}
            placeholder="关键字"
            value={filters.keyword}
            onChange={(value) => {
              setFilters((prev: TaskPageFiltersVo) => ({
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
              setFilters((prev: TaskPageFiltersVo) => ({
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
              setFilters((prev: TaskPageFiltersVo) => ({
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
              setFilters((prev: TaskPageFiltersVo) => ({
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
              setFilters((prev: TaskPageFiltersVo) => ({
                ...prev,
                status: value,
              }));
            }}
            allowClear
            placeholder="任务状态"
          >
            <Select.Option value="todo">未完成</Select.Option>
            <Select.Option value="done">已完成</Select.Option>
            <Select.Option value="abandoned">已放弃</Select.Option>
          </Select>
        </Col>
        <Col span={6}>
          <TagSelector
            multiple={true}
            value={filters.tags}
            onChange={(value) => {
              setFilters((prev: TaskPageFiltersVo) => ({
                ...prev,
                tags: value,
              }));
            }}
          />
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
                await getTaskPage();
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
