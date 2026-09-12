import { useEffect, useState } from 'react';
import { Button, DatePicker, Flex, Form, Input, InputNumber, Modal, Select, message } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { PurchaseStatus } from '@true-north/enum';
import type { CreatePurchaseVo, PurchaseVo } from '@true-north/vo';
import { PurchaseController } from '../../client';
import dayjs from 'dayjs';

const STATUS_LABEL: Record<string, string> = {
  [PurchaseStatus.PENDING]: '待购',
  [PurchaseStatus.PURCHASED]: '已购',
  [PurchaseStatus.CANCELLED]: '取消',
};

export default function PurchasePage() {
  const [list, setList] = useState<PurchaseVo[]>([]);
  const [status, setStatus] = useState<string>();
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<CreatePurchaseVo>();

  const load = async () => {
    const result = await PurchaseController.list({ status: status as PurchaseVo['status'] | undefined });
    setList(result?.list || []);
  };

  useEffect(() => {
    void load();
  }, [status]);

  const submit = async () => {
    const values = await form.validateFields();
    await PurchaseController.create({
      ...values,
      neededAt: values.neededAt ? dayjs(values.neededAt).format('YYYY-MM-DD') : undefined,
    });
    message.success('已加入采购清单');
    setOpen(false);
    form.resetFields();
    await load();
  };

  return (
    <ProductSurface id={productRef('purchase.view.list')}>
      <Flex vertical container="full" className="p-5 gap-4">
        <Flex justify="space-between" align="center">
          <h1 className="text-title-2 font-medium">家庭采购</h1>
          <Button type="primary" onClick={() => setOpen(true)}>添加</Button>
        </Flex>
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 160 }}
          value={status}
          onChange={setStatus}
          options={Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <Flex vertical gap={8}>
          {list.map((item) => (
            <Flex key={item.id} justify="space-between" align="center" className="rounded-lg bg-bg-2 p-4">
              <div>
                <strong>{item.name}</strong>
                <p className="text-text-3 text-xs m-0">
                  {STATUS_LABEL[item.status]}
                  {item.neededAt ? ` · 需要 ${item.neededAt}` : ''}
                  {item.quantity ? ` · ${item.quantity}${item.unit || ''}` : ''}
                </p>
              </div>
              <Flex gap={8}>
                {item.status === PurchaseStatus.PENDING ? (
                  <>
                    <Button size="small" onClick={() => PurchaseController.update(item.id, { status: PurchaseStatus.PURCHASED }).then(load)}>
                      已购
                    </Button>
                    <Button size="small" onClick={() => PurchaseController.update(item.id, { status: PurchaseStatus.CANCELLED }).then(load)}>
                      取消
                    </Button>
                  </>
                ) : null}
              </Flex>
            </Flex>
          ))}
          {!list.length ? <p className="text-text-3">还没有采购项。</p> : null}
        </Flex>
        <Modal title="添加采购" open={open} onCancel={() => setOpen(false)} onOk={() => void submit()}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="名称" rules={[{ required: true }]}>
              <Input placeholder="例如：滤芯" />
            </Form.Item>
            <Flex gap={8}>
              <Form.Item name="quantity" label="数量">
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item name="unit" label="单位">
                <Input placeholder="个" />
              </Form.Item>
            </Flex>
            <Form.Item name="neededAt" label="需要时间">
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item name="note" label="备注">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Form>
        </Modal>
      </Flex>
    </ProductSurface>
  );
}
