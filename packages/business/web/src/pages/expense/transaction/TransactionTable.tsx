'use client';

import { format } from 'date-fns';
import { Table, Tag } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table/interface';
import { useExpenses } from '../context';
import { DEFAULT_CATEGORIES } from '../constants';
import type { TransactionVo } from '@life-toolkit/vo';

export default function TransactionTable() {
  const { transactionList } = useExpenses();

  const columns: ColumnProps<TransactionVo>[] = [
    {
      title: '日期',
      dataIndex: 'transactionDateTime',
      render: (date: string) => date,
    },
    {
      title: '交易类型',
      dataIndex: 'type',
      render: (type: 'income' | 'expense') => (
        <Tag color={type === 'income' ? 'green' : 'red'}>{type}</Tag>
      ),
    },
    {
      title: '金额',
      dataIndex: 'amount',
      render: (amount: number, record: TransactionVo) => (
        <span
          style={{
            color: record.type === 'income' ? '#52c41a' : '#f5222d',
          }}
        >
          {record.type === 'income' ? '+' : '-'}${amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: '类别',
      dataIndex: 'category',
      render: (category: string) =>
        DEFAULT_CATEGORIES[category]?.name || category,
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
            <Tag key={index} bordered>
              {tag}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={transactionList} rowKey="id" />;
}
