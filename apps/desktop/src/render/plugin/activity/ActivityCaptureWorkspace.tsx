import { useMemo, useState } from 'react';
import { Button, Checkbox, Flex, Input, InputNumber, Select, message } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import type { CapturePayloadVo, CaptureSuggestionVo, AiWorkspacePayloadVo } from '@true-north/vo';
import { ActivityController } from '@true-north/web-service';
import type { WorkbenchToolProps } from '@true-north/plugin-sdk';

const KIND_LABEL: Record<CaptureSuggestionVo['kind'], string> = {
  todo: '待办',
  expense: '支出',
  purchase: '采购',
  bookmark: '收藏',
};

export function ActivityCaptureWorkspace({
  payload,
  messageId,
  actions,
}: WorkbenchToolProps<CapturePayloadVo>) {
  const [items, setItems] = useState<CaptureSuggestionVo[]>(
    payload.suggestions.map((item) => ({ ...item, selected: item.selected !== false })),
  );
  const [busy, setBusy] = useState(false);
  const selected = useMemo(() => items.filter((item) => item.selected && !item.accepted), [items]);

  const update = (id: string, patch: Partial<CaptureSuggestionVo>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const persist = async (next: CaptureSuggestionVo[]) => {
    setItems(next);
    await actions.updatePayload({
      ...payload,
      suggestions: next,
    } as unknown as AiWorkspacePayloadVo);
  };

  const adopt = async () => {
    if (!selected.length) {
      message.warning('请至少选择一条建议');
      return;
    }
    setBusy(true);
    try {
      await ActivityController.adopt({
        messageId,
        suggestions: items,
        sourceText: payload.sourceText,
        analysisSummary: payload.analysisSummary,
        runId: payload.runId,
      });
      const next = items.map((item) =>
        item.selected && !item.accepted ? { ...item, accepted: true } : item,
      );
      await persist(next);
      message.success('已写入对应领域');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '采纳失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProductSurface id={productRef('workbench.view.capture-review')}>
      <Flex vertical gap={12} className="p-4">
        <p>{payload.analysisSummary}</p>
        {items.map((item) => (
          <Flex key={item.id} vertical gap={8} className="rounded-lg border border-solid border-border-2 p-3">
            <Flex align="center" gap={8}>
              <Checkbox
                checked={item.selected !== false}
                disabled={item.accepted}
                onChange={(event) => void persist(items.map((entry) => (
                  entry.id === item.id ? { ...entry, selected: event.target.checked } : entry
                )))}
              />
              <Select
                disabled={item.accepted}
                value={item.kind}
                style={{ width: 100 }}
                options={Object.entries(KIND_LABEL).map(([value, label]) => ({ value, label }))}
                onChange={(kind) => update(item.id, { kind: kind as CaptureSuggestionVo['kind'] })}
              />
              <Input
                disabled={item.accepted}
                value={item.title}
                onChange={(event) => update(item.id, { title: event.target.value })}
                onBlur={() => void persist(items)}
              />
              {item.accepted ? <span className="text-text-3">已采纳</span> : null}
            </Flex>
            {item.kind === 'expense' ? (
              <Flex gap={8}>
                <InputNumber
                  disabled={item.accepted}
                  value={item.amount}
                  placeholder="金额"
                  onChange={(value) => update(item.id, { amount: Number(value || 0) })}
                  onBlur={() => void persist(items)}
                />
                <Select
                  disabled={item.accepted}
                  value={item.transactionType || 'expense'}
                  options={[
                    { value: 'expense', label: '支出' },
                    { value: 'income', label: '收入' },
                  ]}
                  onChange={(value) => void persist(items.map((entry) => (
                    entry.id === item.id ? { ...entry, transactionType: value } : entry
                  )))}
                />
              </Flex>
            ) : null}
            {item.kind === 'bookmark' ? (
              <Input
                disabled={item.accepted}
                value={item.url}
                placeholder="网址"
                onChange={(event) => update(item.id, { url: event.target.value })}
                onBlur={() => void persist(items)}
              />
            ) : null}
            {item.conflict ? <span className="text-orange-600 text-xs">{item.conflict}</span> : null}
          </Flex>
        ))}
        <Button type="primary" loading={busy} disabled={!selected.length} onClick={() => void adopt()}>
          确认采纳
        </Button>
      </Flex>
    </ProductSurface>
  );
}
