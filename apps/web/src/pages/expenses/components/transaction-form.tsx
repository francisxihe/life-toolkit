'use client';

import { z, ZodObject } from 'zod';
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
} from '@arco-design/web-react';
import { useExpenses } from '../context/expenses-context';
import { DEFAULT_CATEGORIES } from '../constants';
import { TagInput } from '../../todo/components/TagInput';
import { useState } from 'react';

const FormItem = Form.Item;
const Option = Select.Option;

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  description: z.string().min(1, { message: 'Description is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  tags: z.array(z.string()),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Please enter a valid date',
  }),
  recurring: z
    .object({
      frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
      interval: z.number(),
    })
    .optional(),
});

export function TransactionForm() {
  const { addTransaction } = useExpenses();

  const [formData, setFormData] = useState<z.infer<typeof transactionSchema>>({
    type: 'expense',
    amount: '',
    description: '',
    category: '',
    tags: [],
    date: new Date().toISOString().split('T')[0],
  });

  const [form] = Form.useForm();

  function onSubmit(values: z.infer<typeof transactionSchema>) {
    addTransaction({
      ...values,
      amount: Number(values.amount),
      date: new Date(values.date),
    });
    setFormData({
      type: 'expense',
      amount: '',
      description: '',
      category: '',
      tags: [],
      date: new Date().toISOString().split('T')[0],
    });
  }
  const zodToArcoRules = (schema: ZodObject<any>, field: string) => {
    return [
      {
        validator: async (value: any, callback: (message?: string) => void) => {
          console.log({ [field]: value });

          const fieldSchema = schema.shape[field]; // 获取单个字段的 Zod schema
          const result = fieldSchema.safeParse(value);

          if (!result.success) {
            // 获取错误消息并抛出以便展示
            callback(result.error.errors[0].message);
            return;
          }
          callback();
        },
        validateTrigger: 'onBlur',
      },
    ];
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onSubmit={onSubmit}
      initialValues={formData}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem
          label="Type"
          rules={zodToArcoRules(transactionSchema, 'type')}
          field={'type'}
        >
          <Select placeholder="Select type" defaultValue="expense">
            <Option value="income">Income</Option>
            <Option value="expense">Expense</Option>
          </Select>
        </FormItem>

        <FormItem
          label="Amount"
          rules={zodToArcoRules(transactionSchema, 'amount')}
          field={'amount'}
        >
          <Input type="number" step="0.01" placeholder="Enter amount" />
        </FormItem>
      </div>

      <FormItem
        label="Description"
        rules={zodToArcoRules(transactionSchema, 'description')}
        field={'description'}
      >
        <Input placeholder="Enter description" />
      </FormItem>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem
          label="Category"
          rules={zodToArcoRules(transactionSchema, 'category')}
          field={'category'}
        >
          <Select placeholder="Select category">
            {Object.entries(DEFAULT_CATEGORIES)
              .filter(([_, cat]) => cat.type === formData.type)
              .map(([key, cat]) => (
                <Option key={key} value={key}>
                  {cat.name}
                </Option>
              ))}
          </Select>
        </FormItem>

        <FormItem
          label="Date"
          rules={zodToArcoRules(transactionSchema, 'date')}
          field={'date'}
        >
          <DatePicker allowClear showTime />
        </FormItem>
      </div>

      <FormItem
        label="Tags"
        rules={zodToArcoRules(transactionSchema, 'tags')}
        field={'tags'}
      >
        <TagInput
          value={formData.tags}
          onChange={(value) => setFormData({ ...formData, tags: value })}
          placeholder="Add tags..."
        />
      </FormItem>

      <Button type="primary" htmlType="submit">
        Add Transaction
      </Button>
    </Form>
  );
}
