import React from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Space,
  Grid,
} from '@arco-design/web-react';
import { IconSearch, IconRefresh } from '@arco-design/web-react/icon';
import { HabitPageFiltersVo, GoalVo } from '@life-toolkit/vo/growth';
import { HABIT_STATUS_OPTIONS, HABIT_DIFFICULTY_OPTIONS } from '../constants';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Row, Col } = Grid;

interface HabitFilterProps {
  filters: HabitPageFiltersVo;
  goals: GoalVo[];
  onChange: (filters: HabitPageFiltersVo) => void;
  onReset: () => void;
}

export const HabitFilter: React.FC<HabitFilterProps> = ({
  filters,
  goals,
  onChange,
  onReset,
}) => {
  const [form] = Form.useForm();

  // 处理筛选条件变更
  const handleFilterChange = (field: string, value: any) => {
    const newFilters = { ...filters, [field]: value };
    onChange(newFilters);
    form.setFieldValue(field, value);
  };

  // 处理日期范围变更
  const handleDateRangeChange = (dates: any[]) => {
    const newFilters = {
      ...filters,
      startAtFrom: dates?.[0]?.format('YYYY-MM-DD'),
      startAtTo: dates?.[1]?.format('YYYY-MM-DD'),
    };
    onChange(newFilters);
  };

  // 处理重要程度范围变更
  const handleImportanceRangeChange = (
    field: 'importanceMin' | 'importanceMax',
    value: number,
  ) => {
    const newFilters = { ...filters, [field]: value };
    onChange(newFilters);
  };

  // 重置筛选条件
  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Form form={form} layout="vertical" autoComplete="off">
      <Row gutter={16}>
        {/* 关键词搜索 */}
        <Col span={6}>
          <Form.Item label="关键词搜索" field="keyword">
            <Input
              placeholder="搜索习惯名称或描述"
              prefix={<IconSearch />}
              value={filters.keyword}
              onChange={(value) => handleFilterChange('keyword', value)}
              allowClear
            />
          </Form.Item>
        </Col>

        {/* 状态筛选 */}
        <Col span={6}>
          <Form.Item label="状态" field="statusList">
            <Select
              mode="multiple"
              placeholder="选择状态"
              value={filters.statusList}
              onChange={(value) => handleFilterChange('statusList', value)}
              allowClear
            >
              {HABIT_STATUS_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  <Space>
                    <span style={{ color: option.color }}>●</span>
                    {option.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* 难度筛选 */}
        <Col span={6}>
          <Form.Item label="难度" field="difficultyList">
            <Select
              mode="multiple"
              placeholder="选择难度"
              value={filters.difficultyList}
              onChange={(value) => handleFilterChange('difficultyList', value)}
              allowClear
            >
              {HABIT_DIFFICULTY_OPTIONS.map((option) => (
                <Option key={option.value} value={option.value}>
                  <Space>
                    <span style={{ color: option.color }}>●</span>
                    {option.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        {/* 关联目标 */}
        <Col span={6}>
          <Form.Item label="关联目标" field="goalIds">
            <Select
              mode="multiple"
              placeholder="选择目标"
              value={filters.goalIds}
              onChange={(value) => handleFilterChange('goalIds', value)}
              allowClear
            >
              {goals.map((goal) => (
                <Option key={goal.id} value={goal.id}>
                  {goal.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 重要程度范围 */}
        <Col span={8}>
          <Form.Item label="重要程度">
            <Space>
              <InputNumber
                placeholder="最小值"
                min={1}
                max={5}
                value={filters.importanceMin}
                onChange={(value) =>
                  handleImportanceRangeChange('importanceMin', value)
                }
                style={{ width: 80 }}
              />
              <span>-</span>
              <InputNumber
                placeholder="最大值"
                min={1}
                max={5}
                value={filters.importanceMax}
                onChange={(value) =>
                  handleImportanceRangeChange('importanceMax', value)
                }
                style={{ width: 80 }}
              />
            </Space>
          </Form.Item>
        </Col>

        {/* 开始日期范围 */}
        <Col span={8}>
          <Form.Item label="开始日期范围" field="dateRange">
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
            />
          </Form.Item>
        </Col>

        {/* 排序设置 */}
        <Col span={8}>
          <Form.Item label="排序方式">
            <Space>
              <Select
                placeholder="排序字段"
                value={filters.sortBy}
                onChange={(value) => handleFilterChange('sortBy', value)}
                style={{ width: 120 }}
              >
                <Option value="createdAt">创建时间</Option>
                <Option value="updatedAt">更新时间</Option>
                <Option value="name">名称</Option>
                <Option value="importance">重要程度</Option>
                <Option value="currentStreak">当前连续</Option>
                <Option value="longestStreak">最长连续</Option>
                <Option value="completedCount">完成次数</Option>
              </Select>
              <Select
                placeholder="排序方向"
                value={filters.sortOrder}
                onChange={(value) => handleFilterChange('sortOrder', value)}
                style={{ width: 80 }}
              >
                <Option value="DESC">降序</Option>
                <Option value="ASC">升序</Option>
              </Select>
            </Space>
          </Form.Item>
        </Col>
      </Row>

      {/* 操作按钮 */}
      <Row>
        <Col span={24}>
          <Space>
            <Button icon={<IconRefresh />} onClick={handleReset}>
              重置筛选
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );
};

export default HabitFilter;
