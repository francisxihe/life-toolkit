import React from 'react';
import {
  Button,
  Space,
  Typography,
  Tag,
  Progress,
  Table,
} from '@arco-design/web-react';
import { HabitModelVo } from '@life-toolkit/vo/growth';
import { HabitStatus, Difficulty } from '@life-toolkit/enum';
import { HABIT_STATUS_OPTIONS, HABIT_DIFFICULTY_OPTIONS } from '../constants';
import { useHabitContext } from '../context';
import { HabitListProvider, useHabitListContext } from './context';

const { Text } = Typography;

export default function HabitListTable() {
  const {
    habits,
    loading,
    pagination,
    handlePageChange,
    handleHabitComplete,
    handleHabitDelete,
  } = useHabitListContext();

  // 表格列配置
  const columns = [
    {
      title: '习惯名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record: HabitModelVo) => (
        <div>
          <div className="font-medium">{name}</div>
          {record.description && (
            <Text type="secondary" className="text-sm">
              {record.description}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: HabitStatus) => {
        const statusConfig = HABIT_STATUS_OPTIONS.find(
          (option) => option.value === status,
        );
        return <Tag color={statusConfig?.color}>{statusConfig?.label}</Tag>;
      },
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 100,
      render: (difficulty: Difficulty) => {
        const difficultyConfig = HABIT_DIFFICULTY_OPTIONS.find(
          (option) => option.value === difficulty,
        );
        return difficultyConfig ? (
          <Tag color={difficultyConfig.color} size="small">
            {difficultyConfig.label}
          </Tag>
        ) : null;
      },
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      width: 150,
      render: (_: any, record: HabitModelVo) => {
        const completionRate =
          record.completedCount && record.currentStreak
            ? Math.round(
                (record.completedCount /
                  (record.currentStreak + record.completedCount)) *
                  100,
              )
            : 0;
        return (
          <div>
            <div className="flex justify-between items-center mb-1">
              <Text className="text-sm font-medium">{completionRate}%</Text>
            </div>
            <Progress percent={completionRate} size="small" />
          </div>
        );
      },
    },
    {
      title: '当前连续',
      dataIndex: 'currentStreak',
      key: 'currentStreak',
      width: 100,
      align: 'center' as const,
      render: (currentStreak: number) => (
        <div className="text-lg font-bold text-blue-600">
          {currentStreak || 0}
        </div>
      ),
    },
    {
      title: '最长连续',
      dataIndex: 'longestStreak',
      key: 'longestStreak',
      width: 100,
      align: 'center' as const,
      render: (longestStreak: number) => (
        <div className="text-lg font-bold text-green-600">
          {longestStreak || 0}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: HabitModelVo) => (
        <Space>
          {record.status === HabitStatus.ACTIVE && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleHabitComplete(record.id)}
            >
              完成
            </Button>
          )}
          <Button
            size="small"
            onClick={() => handleHabitDelete(record.id)}
            status="danger"
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={habits}
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: handlePageChange,
        showTotal: (total, range) =>
          `第 ${range[0]}-${range[1]} 项，共 ${total} 项`,
        showJumper: true,
        sizeCanChange: true,
        sizeOptions: [12, 24, 48],
      }}
      rowKey="id"
      scroll={{ x: 900 }}
    />
  );
};
