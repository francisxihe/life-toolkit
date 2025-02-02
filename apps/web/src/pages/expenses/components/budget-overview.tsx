"use client"

import { useState } from 'react'
import * as z from 'zod'
import { Card, Progress, Button, Form, Input, Select, Space } from '@arco-design/web-react'
import { useExpenses } from '../context/expenses-context'
import { DEFAULT_CATEGORIES, BUDGET_PERIODS } from '../constants'

const FormItem = Form.Item
const Option = Select.Option

const budgetSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  amount: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number"
  }),
  period: z.enum(['monthly', 'yearly'])
})

interface BudgetOverviewProps {
  showForm?: boolean
}

export function BudgetOverview({ showForm = false }: BudgetOverviewProps) {
  const { budgets, addBudget } = useExpenses()
  const [showBudgetForm, setShowBudgetForm] = useState(showForm)

  const [formData, setFormData] = useState<z.infer<typeof budgetSchema>>({});

  function onSubmit(values: z.infer<typeof budgetSchema>) {
    addBudget({
      category: values.category,
      period: values.period,
      amount: Number(values.amount),
      startDate: new Date()
    })
    setFormData({
      ...budgetSchema.parse({}),
      category: '',
      amount: '',
      period: 'monthly'
    });
    setShowBudgetForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Budgets</h2>
        {!showBudgetForm && (
          <Button type="primary" onClick={() => setShowBudgetForm(true)}>
            Add Budget
          </Button>
        )}
      </div>

      {showBudgetForm && (
        <Card title="New Budget">
          <Form layout="vertical" onSubmit={onSubmit}>
            <FormItem label="Category" required>
              <Select
                placeholder="Select category"
                onChange={value => setFormData({ ...formData, category: value })}
              >
                {Object.entries(DEFAULT_CATEGORIES)
                  .filter(([_, cat]) => cat.type === 'expense')
                  .map(([key, cat]) => (
                    <Option key={key} value={key}>
                      {cat.name}
                    </Option>
                  ))}
              </Select>
            </FormItem>

            <FormItem label="Amount" required>
              <Input
                type="number"
                step="0.01"
                placeholder="Enter amount"
                onChange={value => setFormData({ ...formData, amount: value })}
              />
            </FormItem>

            <FormItem label="Period" required>
              <Select
                placeholder="Select period"
                onChange={value => setFormData({ ...formData, period: value })}
              >
                {Object.entries(BUDGET_PERIODS).map(([key, label]) => (
                  <Option key={key} value={key}>{label}</Option>
                ))}
              </Select>
            </FormItem>

            <Space>
              <Button type="primary" htmlType="submit">
                Add Budget
              </Button>
              <Button onClick={() => setShowBudgetForm(false)}>
                Cancel
              </Button>
            </Space>
          </Form>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgets.map(budget => {
          const percentage = (budget.spent / budget.amount) * 100
          const category = DEFAULT_CATEGORIES[budget.category]

          return (
            <Card key={budget.id}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">
                  {category?.name || budget.category}
                </span>
                <span className="text-sm text-gray-500">
                  {budget.period}
                </span>
              </div>
              <div className="text-2xl font-bold mb-2">
                ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
              </div>
              <Progress
                percent={percentage}
                status={percentage > 100 ? 'error' : 'normal'}
                formatText={() => `${percentage.toFixed(1)}%`}
              />
            </Card>
          )
        })}
      </div>
    </div>
  )
}