import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  InputNumber,
} from '@arco-design/web-react';
import { DEFAULT_CATEGORIES } from '../constants';
import { TagEditor } from '../../../components/TagSelector';
import { useEffect, useRef } from 'react';
import { openModal } from '@/hooks/OpenModal';
import { CreateTransactionVo } from '@life-toolkit/vo/expense';

const FormItem = Form.Item;

type CreateTransactionFormData = {
  type?: CreateTransactionVo['type'];
  amount?: CreateTransactionVo['amount'];
  description?: CreateTransactionVo['description'];
  category?: CreateTransactionVo['category'];
  tags?: CreateTransactionVo['tags'];
  transactionDateTime?: CreateTransactionVo['transactionDateTime'];
};

export function TransactionForm({
  initialValues,
  onChange,
}: {
  initialValues: CreateTransactionFormData;
  onChange: (data: Partial<CreateTransactionFormData>) => void;
}) {
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onValuesChange={(changedValues) => {
        console.log('changedValues', changedValues);
        onChange({ ...changedValues });
      }}
      validateTrigger={['onBlur']}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem label="类型" field={'type'} required>
          <Select
            placeholder="请选择类型"
            options={[
              {
                label: '收入',
                value: 'income',
              },
              {
                label: '支出',
                value: 'expense',
              },
            ]}
          ></Select>
        </FormItem>

        <FormItem label="金额" field={'amount'} rules={[{ required: true }]}>
          <InputNumber step={1} placeholder="请输入金额" />
        </FormItem>

        <FormItem label="分类" field={'category'} rules={[{ required: true }]}>
          <Select
            placeholder="请选择分类"
            options={Object.entries(DEFAULT_CATEGORIES)
              .filter(([_, cat]) => cat.type === initialValues.type)
              .map(([key, cat]) => ({
                label: cat.name,
                value: key,
              }))}
          ></Select>
        </FormItem>

        <FormItem
          label="交易时间"
          field={'transactionDateTime'}
          rules={[{ required: true }]}
        >
          <DatePicker allowClear showTime format="YYYY-MM-DD HH:mm:ss" />
        </FormItem>
      </div>

      <FormItem label="描述" field={'description'}>
        <Input placeholder="请输入描述" />
      </FormItem>

      <FormItem label="标签" field={'tags'}>
        <TagEditor
          multiple={true}
          value={initialValues.tags}
          onChange={(value) => onChange({ tags: value })}
        />
      </FormItem>
    </Form>
  );
}

export function useCreateTransaction({
  onConfirm,
}: {
  onConfirm: (values: CreateTransactionVo) => void;
}) {
  const initialValues: CreateTransactionFormData = {
    type: 'expense' as const,
    amount: undefined,
    description: undefined,
    category: undefined,
    tags: [],
    transactionDateTime: undefined,
  };

  const formDataRef = useRef<CreateTransactionFormData>();

  const openCreateModal = () => {
    formDataRef.current = initialValues;
    openModal({
      title: <div className="text-body-3">添加交易</div>,
      content: (
        <TransactionForm
          initialValues={initialValues}
          onChange={(data) => {
            formDataRef.current = { ...formDataRef.current, ...data };
          }}
        />
      ),
      onOk: async () => {
        onConfirm(formDataRef.current as CreateTransactionVo);
      },
    });
  };

  return {
    openCreateModal,
  };
}
