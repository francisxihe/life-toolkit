"use client"

import { format } from 'date-fns'
import { Table, Tag } from '@arco-design/web-react'
import type { ColumnProps } from '@arco-design/web-react/es/Table/interface'
import { useExpenses } from '../context/expenses-context'
import { DEFAULT_CATEGORIES } from '../constants'
import type { Transaction } from '../types'

interface TransactionListProps {
  limit?: number
}

export function TransactionList({ limit }: TransactionListProps) {
  const { transactions, filters } = useExpenses()

  let displayTransactions = transactions
  if (limit) {
    displayTransactions = transactions.slice(0, limit)
  }

  if (displayTransactions.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No transactions found
      </div>
    )
  }

  const columns: ColumnProps<Transaction>[] = [
    {
      title: 'Date',
      dataIndex: 'date',
      render: (date: string) => format(new Date(date), 'PP'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type: 'income' | 'expense') => (
        <Tag
          color={type === 'income' ? 'green' : 'red'}
        >
          {type}
        </Tag>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      render: (category: string) => 
        DEFAULT_CATEGORIES[category]?.name || category,
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Tags',
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
    {
      title: 'Amount',
      dataIndex: 'amount',
      align: 'right' as const,
      render: (amount: number, record: Transaction) => (
        <span style={{ 
          color: record.type === 'income' ? '#52c41a' : '#f5222d'
        }}>
          {record.type === 'income' ? '+' : '-'}${amount.toFixed(2)}
        </span>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={displayTransactions}
      rowKey="id"
      borderCell={true}
    />
  )
}