import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Tag,
  message,
} from '@sue/design-web-react';
import dayjs from 'dayjs';
import { Difficulty, Importance, TodoRelatedType, TodoStatus } from '@true-north/enum';
import type { AiDecomposePayloadVo, AiWorkspaceSuggestionVo } from '@true-north/vo';
import { TaskService, TodoService } from '@true-north/web-service';
import { drawerPaddedBodyStyles } from '@/utils/drawerStyles';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import styles from '../style.module.less';

const KIND_LABEL = { task: '子任务', todo: '待办' } as const;

function normalizeTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function recalculateConflict(suggestion: AiWorkspaceSuggestionVo, childTitles: string[]): string | undefined {
  if (suggestion.kind !== 'task') return undefined;
  const normalized = normalizeTitle(suggestion.title);
  if (!normalized) return undefined;
  for (const child of childTitles) {
    const childNorm = normalizeTitle(child);
    if (!childNorm) continue;
    if (normalized === childNorm || normalized.includes(childNorm) || childNorm.includes(normalized)) {
      return '已存在相近子任务';
    }
  }
  return undefined;
}

type Props = {
  payload: AiDecomposePayloadVo;
  messageId: string;
  taskId?: string;
  task?: any;
  setDraft: (value: string) => void;
  patchWorkspace: (
    messageId: string,
    suggestions: AiWorkspaceSuggestionVo[],
    analysisSummary?: string
  ) => Promise<boolean>;
};

export function TaskDecomposeWorkspace({
  payload,
  messageId,
  task,
  setDraft,
  patchWorkspace,
}: Props) {
  const [suggestions, setSuggestions] = useState<AiWorkspaceSuggestionVo[]>(payload.suggestions);
  const [selected, setSelected] = useState<string[]>([]);
  const [batchOpen, setBatchOpen] = useState(false);
  const [editing, setEditing] = useState<AiWorkspaceSuggestionVo | null>(null);
  const [editDraft, setEditDraft] = useState<AiWorkspaceSuggestionVo | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSuggestions(payload.suggestions);
    setSelected([]);
    setEditing(null);
    setEditDraft(null);
  }, [payload]);

  if (!task) {
    return <Alert type="warning" showIcon title="未找到任务，无法审阅拆解建议。" />;
  }

  const persist = async (next: AiWorkspaceSuggestionVo[]) => {
    setSuggestions(next);
    await patchWorkspace(messageId, next, payload.analysisSummary);
  };

  const openEdit = (suggestion: AiWorkspaceSuggestionVo) => {
    setEditing(suggestion);
    setEditDraft({ ...suggestion });
  };

  const saveEdit = async () => {
    if (!editDraft || !editing) return;
    if (!editDraft.title.trim()) {
      message.warning('请输入名称');
      return;
    }
    const nextItem: AiWorkspaceSuggestionVo = {
      ...editDraft,
      conflict: recalculateConflict(editDraft, []),
    };
    const next = suggestions.map((item) => (item.id === nextItem.id ? nextItem : item));
    await persist(next);
    setEditing(null);
    setEditDraft(null);
    message.success('已更新建议预览');
  };

  const adopt = async (suggestion: AiWorkspaceSuggestionVo) => {
    if (suggestion.conflict) {
      message.warning('该建议存在重复冲突，请先跳过或调整');
      return;
    }
    if (suggestion.accepted) return;

    const title = suggestion.title.trim();
    if (!title) {
      message.warning('请输入建议名称');
      return;
    }

    const importance = (suggestion.importance || task.importance || Importance.Core) as Importance;
    const difficulty = (suggestion.difficulty || task.difficulty || Difficulty.Challenger) as Difficulty;
    const planned = suggestion.planned || dayjs().add(1, 'day').format('YYYY-MM-DD');
    const silent = { silent: true as const };

    let created: unknown;
    if (suggestion.kind === 'task') {
      created = await TaskService.create(
        {
          name: title,
          description: '由任务 AI 拆解创建。',
          tags: [],
          importance,
          difficulty,
          urgency: task.urgency ?? 3,
          parentId: task.id,
          goalId: undefined,
          startAt: task.startAt,
          endAt: task.endAt,
          estimateTime: 3600,
        },
        silent
      );
    } else if (suggestion.kind === 'todo') {
      created = await TodoService.create(
        {
          name: title,
          description: '由任务 AI 拆解创建。',
          status: TodoStatus.TODO,
          planDate: planned,
          importance,
          urgency: 3,
          relatedType: TodoRelatedType.TASK,
          relatedId: task.id,
        },
        silent
      );
    } else {
      message.warning('任务拆解仅支持子任务与待办');
      return;
    }

    if (!created) {
      throw new Error(`采纳「${title}」失败`);
    }

    const next = suggestions.map((item) =>
      item.id === suggestion.id ? { ...item, accepted: true } : item
    );
    await persist(next);
    setSelected((items) => items.filter((id) => id !== suggestion.id));
  };

  const askSelected = () => {
    const picked = suggestions.filter(
      (item) => selected.includes(item.id) && !item.accepted && !item.conflict
    );
    if (!picked.length) {
      message.warning('请先勾选可追问的建议');
      return;
    }
    const lines = picked.map((item) => {
      const label = item.kind === 'todo' ? KIND_LABEL.todo : KIND_LABEL.task;
      return `- [${label}] ${item.title}（计划 ${item.planned}，重要 ${item.importance}）`;
    });
    setDraft(`请针对以下建议进一步说明或优化：\n${lines.join('\n')}\n`);
    message.success('已预填到对话输入框，确认后发送');
  };

  return (
    <ProductSurface id={productRef('growth.task.view.ai-decomposition')}>
    <div>
      <Flex vertical gap={16}>
        <Flex className={styles.aiControls} justify="space-between" align="center" wrap="wrap" gap={12}>
          <Tag color="blue">当前任务：{task.name}</Tag>
          <Space wrap>
            <Button disabled={!selected.length} onClick={askSelected}>
              对已选追问 {selected.length || ''}
            </Button>
            <Button disabled={!selected.length} onClick={() => setBatchOpen(true)}>
              采纳已选 {selected.length}
            </Button>
          </Space>
        </Flex>
        <Alert className={styles.aiAlert} type="info" showIcon title={payload.analysisSummary} />
        <Flex vertical className={styles.aiSuggestions} gap={12}>
          {suggestions.map((suggestion) => {
            const isAccepted = Boolean(suggestion.accepted);
            const label = suggestion.kind === 'todo' ? KIND_LABEL.todo : KIND_LABEL.task;
            return (
              <Card size="small" key={suggestion.id} className={isAccepted ? styles.accepted : undefined}>
                <Flex justify="space-between" align="start" gap={12}>
                  <Space align="start">
                    <Checkbox
                      checked={selected.includes(suggestion.id)}
                      disabled={Boolean(suggestion.conflict) || isAccepted}
                      onChange={(event) =>
                        setSelected((items) =>
                          event.target.checked
                            ? [...items, suggestion.id]
                            : items.filter((id) => id !== suggestion.id)
                        )
                      }
                    />
                    <div className={isAccepted ? styles.acceptedPreview : undefined}>
                      <Tag color={suggestion.kind === 'todo' ? 'gold' : 'blue'}>{label}</Tag>
                      <h3>{suggestion.title}</h3>
                      <p>{suggestion.reason}</p>
                      <small>
                        {suggestion.impact} · 计划 {suggestion.planned} · 重要 {suggestion.importance}
                      </small>
                      {suggestion.conflict ? (
                        <Alert type="warning" showIcon title={suggestion.conflict} />
                      ) : null}
                    </div>
                  </Space>
                  <Space vertical>
                    <Button size="small" onClick={() => openEdit(suggestion)} disabled={isAccepted}>
                      编辑
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      disabled={Boolean(suggestion.conflict) || isAccepted || saving}
                      onClick={() => {
                        setSaving(true);
                        void adopt(suggestion)
                          .catch((err) => {
                            message.error(err instanceof Error ? err.message : '采纳失败');
                          })
                          .finally(() => setSaving(false));
                      }}
                    >
                      {isAccepted ? '已采纳' : '采纳'}
                    </Button>
                  </Space>
                </Flex>
              </Card>
            );
          })}
        </Flex>
        <Modal
          title="批量采纳 AI 建议"
          open={batchOpen}
          onCancel={() => setBatchOpen(false)}
          onOk={() => {
            setSaving(true);
            void (async () => {
              try {
                for (const suggestion of suggestions) {
                  if (!selected.includes(suggestion.id) || suggestion.conflict || suggestion.accepted) {
                    continue;
                  }
                  await adopt(suggestion);
                }
                setSelected([]);
                setBatchOpen(false);
                message.success('已采纳所选建议');
              } catch (err) {
                message.error(err instanceof Error ? err.message : '批量采纳失败');
              } finally {
                setSaving(false);
              }
            })();
          }}
          okText="确认创建"
          cancelText="取消"
          confirmLoading={saving}
        >
          <p>将按各条当前预览逐条校验并创建子任务或待办。存在冲突的建议无法被勾选。</p>
        </Modal>
      </Flex>

      {editing && editDraft ? (
        <Drawer
          open
          title={`编辑${editDraft.kind === 'todo' ? KIND_LABEL.todo : KIND_LABEL.task}建议`}
          onClose={() => {
            setEditing(null);
            setEditDraft(null);
          }}
          size="large"
          destroyOnHidden
          styles={drawerPaddedBodyStyles}
          extra={
            <Button type="primary" onClick={() => void saveEdit()}>
              保存
            </Button>
          }
        >
          <Form layout="vertical">
            <Form.Item label="名称" required>
              <Input
                value={editDraft.title}
                onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })}
              />
            </Form.Item>
            <Form.Item label="理由">
              <Input.TextArea
                rows={3}
                value={editDraft.reason}
                onChange={(event) => setEditDraft({ ...editDraft, reason: event.target.value })}
              />
            </Form.Item>
            <Form.Item label="影响">
              <Input.TextArea
                rows={2}
                value={editDraft.impact}
                onChange={(event) => setEditDraft({ ...editDraft, impact: event.target.value })}
              />
            </Form.Item>
            <Form.Item label="计划日期">
              <DatePicker
                style={{ width: '100%' }}
                value={editDraft.planned ? dayjs(editDraft.planned) : null}
                onChange={(value) =>
                  setEditDraft({
                    ...editDraft,
                    planned: value ? value.format('YYYY-MM-DD') : editDraft.planned,
                  })
                }
              />
            </Form.Item>
            <Form.Item label="重要度">
              <InputNumber
                min={1}
                max={5}
                style={{ width: '100%' }}
                value={editDraft.importance}
                onChange={(value) => setEditDraft({ ...editDraft, importance: Number(value) || 1 })}
              />
            </Form.Item>
            <Form.Item label="难度">
              <InputNumber
                min={1}
                max={5}
                style={{ width: '100%' }}
                value={editDraft.difficulty}
                onChange={(value) => setEditDraft({ ...editDraft, difficulty: Number(value) || 1 })}
              />
            </Form.Item>
            <Alert type="info" showIcon title="保存仅更新工作台预览，不会创建实体；采纳时使用当前预览。" />
          </Form>
        </Drawer>
      ) : null}
    </div>
    </ProductSurface>
  );
}
