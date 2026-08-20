import { format } from 'date-fns';
import { Table, Tag, type TableColumnProps } from '@sue/design-web-react';

import { useExpenses } from '../context';
import type { BudgetVo } from '@true-north/vo';
import dayjs from 'dayjs';

export default function BudgetTable() {
  const { budgetList } = useExpenses();

  const columns: TableColumnProps<BudgetVo>[] = [
    {
      title: '类别',
      dataIndex: 'category',
    },
    {
      title: '金额',
      dataIndex: 'amount',
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags?.map((tag, index) => (
            <Tag key={index} bordered>
              {tag}
            </Tag>
          ))}
        </div>
      ),
    },
  ];

  return <Table columns={columns} dataSource={budgetList} rowKey="id" />;
}
