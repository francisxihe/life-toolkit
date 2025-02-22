import {
  Form,
  Input,
  Select,
  Space,
  Button,
  InputNumber,
  DatePicker,
} from '@arco-design/web-react';
import { BUDGET_PERIODS, DEFAULT_CATEGORIES } from '../constants';
import { useState, useRef } from 'react';
import { openModal } from '@/hooks/OpenModal';
import { CreateBudgetVo } from '@life-toolkit/vo/expense';
import dayjs from 'dayjs';

const FormItem = Form.Item;

type CreateBudgetFormData = {
  category?: CreateBudgetVo['category'];
  amount?: CreateBudgetVo['amount'];
  period?: CreateBudgetVo['period'];
  startDate?: CreateBudgetVo['startDate'];
  endDate?: CreateBudgetVo['endDate'];
};

function CreateBudget({
  initialValues,
  onChange,
}: {
  initialValues: CreateBudgetFormData;
  onChange: (formData: Partial<CreateBudgetFormData>) => void;
}) {
  return (
    <Form
      initialValues={initialValues}
      onValuesChange={(changedValues) => {
        onChange({ ...changedValues });
      }}
    >
      <FormItem label="类别" required field={'category'}>
        <Select
          placeholder="Select category"
          options={Object.entries(DEFAULT_CATEGORIES)
            .filter(([_, cat]) => cat.type === 'expense')
            .map(([key, cat]) => ({
              label: cat.name,
              value: key,
            }))}
        ></Select>
      </FormItem>

      <FormItem label="金额" required field={'amount'}>
        <InputNumber step={1} placeholder="Enter amount" />
      </FormItem>

      <FormItem label="周期" required field={'period'}>
        <Select
          placeholder="Select period"
          options={Object.entries(BUDGET_PERIODS).map(([key, label]) => ({
            label,
            value: key,
          }))}
        ></Select>
      </FormItem>

      <FormItem label="开始日期" required field={'startDate'}>
        <DatePicker allowClear showTime format="YYYY-MM-DD HH:mm:ss" />
      </FormItem>

      <FormItem label="结束日期" required field={'endDate'}>
        <DatePicker allowClear showTime format="YYYY-MM-DD HH:mm:ss" />
      </FormItem>
    </Form>
  );
}

export function useCreateBudget({
  onConfirm,
}: {
  onConfirm: (values: CreateBudgetVo) => void;
}) {
  const initialValues: CreateBudgetFormData = {
    category: '',
    amount: undefined,
    period: 'monthly' as const,
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
  };

  const formDataRef = useRef<CreateBudgetFormData>();

  const openCreateModal = () => {
    formDataRef.current = initialValues;
    openModal({
      title: <div className="text-body-3">添加预算</div>,
      content: (
        <CreateBudget
          initialValues={initialValues}
          onChange={(formData) => {
            formDataRef.current = { ...formDataRef.current, ...formData };
          }}
        />
      ),
      onOk: () => {
        onConfirm(formDataRef.current as CreateBudgetVo);
      },
    });
  };

  return {
    openCreateModal,
  };
}
