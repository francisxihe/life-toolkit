import React, { useState, useCallback } from 'react';
import {
  Input,
  Select,
  DatePicker,
  Flex,
  Row,
  Col,
} from '@sue/design-web-react';

import { IMPORTANCE_MAP, DIFFICULTY_MAP } from '../../constants';
import { GoalStatus, GoalType } from '@true-north/enum';
import { useGoalContext } from '../context';
import { debounce } from 'lodash-es';
import dayjs from 'dayjs';
import styles from './style.module.less';

const DatePickerRange = DatePicker.RangePicker;

const GoalFilters: React.FC = () => {
  const { searchValue, setSearchValue, filters, setFilters } = useGoalContext();
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);

  const debouncedSetSearchValue = useCallback(
    debounce((value: string) => {
      setSearchValue(value);
    }, 300),
    [setSearchValue],
  );

  return (
    <Flex vertical gap={8} className={styles.filterPanel}>
      <Input
        value={localSearchValue}
        placeholder="搜索目标名称"
        allowClear
        onChange={(event) => {
          const value = event.target.value;
          setLocalSearchValue(value);
          debouncedSetSearchValue(value);
        }}
      />
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <Select
            mode="multiple"
            allowClear
            size="small"
            placeholder="全部状态"
            value={filters.status}
            onChange={(value) => {
              setFilters({ ...filters, status: value });
            }}
            className={styles.filterControl}
          >
            <Select.Option value={GoalStatus.TODO}>待开始</Select.Option>
            <Select.Option value={GoalStatus.DOING}>进行中</Select.Option>
            <Select.Option value={GoalStatus.DONE}>已完成</Select.Option>
            <Select.Option value={GoalStatus.ABANDONED}>已放弃</Select.Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select
            allowClear
            size="small"
            placeholder="全部类型"
            value={filters.type}
            onChange={(value) => {
              setFilters({ ...filters, type: value });
            }}
            className={styles.filterControl}
          >
            <Select.Option value={GoalType.VISION}>愿景</Select.Option>
            <Select.Option value={GoalType.RESULT}>成果</Select.Option>
          </Select>
        </Col>
        <Col span={12}>
          <Select
            allowClear
            size="small"
            placeholder="重要程度"
            value={filters.importance}
            onChange={(value) => {
              setFilters({ ...filters, importance: value });
            }}
            className={styles.filterControl}
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
        <Col span={12}>
          <Select
            allowClear
            size="small"
            placeholder="完成难度"
            value={filters.difficulty}
            onChange={(value) => {
              setFilters({ ...filters, difficulty: value });
            }}
            className={styles.filterControl}
          >
            {[...Array.from(DIFFICULTY_MAP.entries())].map(
              ([key, { label }]) => (
                <Select.Option key={key} value={key}>
                  {label}
                </Select.Option>
              ),
            )}
          </Select>
        </Col>
        <Col span={24}>
          <DatePickerRange
            allowClear
            size="small"
            placeholder={['开始日期', '结束日期']}
            className={styles.filterControl}
            value={filters.dateRange?.map((date) => dayjs(date)) as any}
            onChange={(value) => {
              setFilters({
                ...filters,
                dateRange:
                  value?.[0] && value?.[1]
                    ? [
                        value[0].format('YYYY-MM-DD'),
                        value[1].format('YYYY-MM-DD'),
                      ]
                    : undefined,
              });
            }}
          />
        </Col>
      </Row>
    </Flex>
  );
};

export default GoalFilters;
