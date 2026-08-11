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
import { createDefaultRepeatSetting } from '@true-north/components-repeat';
import { productRef } from '../../../product-wiki';
import type { AiSuggestion, DrawerKind, Goal, GoalDecomposePayload, SaveEntity } from '../../../shared/types';
import { drawerPaddedBodyStyles } from '../../../shared/drawerStyles';
import styles from '../style.module.css';

type Props = {
  payload: GoalDecomposePayload;
  goalId?: string;
  goals: Goal[];
  saveEntity: SaveEntity;
  setDraft: (value: string) => void;
};

const kindLabel: Record<DrawerKind, string> = {
  goal: '子目标',
  task: '任务',
  todo: '待办',
  habit: '习惯',
};

function recalculateConflict(suggestion: AiSuggestion, goals: Goal[]): string | undefined {
  if (suggestion.kind !== 'goal' || !suggestion.parentId) return undefined;
  const title = suggestion.title.trim();
  if (!title) return undefined;
  const clash = goals.some(
    (item) =>
      item.parentId === suggestion.parentId &&
      (item.title === title || item.title.includes(title) || title.includes(item.title)),
  );
  return clash ? '已存在相近子目标' : undefined;
}

export function GoalDecomposeWorkspace({ payload, goalId, goals, saveEntity, setDraft }: Props) {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>(payload.suggestions);
  const [selected, setSelected] = useState<string[]>([]);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [batchOpen, setBatchOpen] = useState(false);
  const [editing, setEditing] = useState<AiSuggestion | null>(null);
  const [editDraft, setEditDraft] = useState<AiSuggestion | null>(null);
  const target =
    goals.find((goal) => goal.id === goalId) || goals.find((goal) => goal.id === payload.suggestions[0]?.goalId);

  useEffect(() => {
    setSuggestions(payload.suggestions);
    setSelected([]);
    setAccepted([]);
    setEditing(null);
    setEditDraft(null);
  }, [payload]);

  if (!target) {
    return <Alert type="warning" showIcon title="未找到绑定目标，无法审阅拆解建议。" />;
  }

  const openEdit = (suggestion: AiSuggestion) => {
    setEditing(suggestion);
    setEditDraft({ ...suggestion });
  };

  const saveEdit = () => {
    if (!editDraft || !editing) return;
    if (!editDraft.title.trim()) {
      message.warning('请输入名称');
      return;
    }
    const next: AiSuggestion = {
      ...editDraft,
      conflict: recalculateConflict(editDraft, goals),
    };
    setSuggestions((items) => items.map((item) => (item.id === next.id ? next : item)));
    setEditing(null);
    setEditDraft(null);
    message.success('已更新建议预览');
  };

  const adopt = (suggestion: AiSuggestion) => {
    if (suggestion.conflict) return message.warning('该建议存在重复冲突，请先跳过或调整');
    const id = `${suggestion.kind[0]}${Date.now()}${Math.random().toString(16).slice(2, 5)}`;
    if (suggestion.kind === 'goal') {
      saveEntity('goal', {
        id,
        title: suggestion.title,
        description: suggestion.reason || '由 AI 分层拆解建议创建。',
        parentId: suggestion.parentId,
        type: 'result',
        status: 'todo',
        importance: suggestion.importance,
        difficulty: suggestion.difficulty,
        start: target.start,
        end: target.end,
        history: ['AI 建议采纳'],
      });
    }
    if (suggestion.kind === 'task') {
      saveEntity('task', {
        id,
        title: suggestion.title,
        description: suggestion.reason || '由 AI 拆解当前目标生成。',
        goalId: target.id,
        status: 'todo',
        importance: suggestion.importance,
        difficulty: suggestion.difficulty,
        plannedStart: suggestion.planned,
        plannedEnd: suggestion.planned,
        start: target.start,
        end: target.end,
        estimated: 2,
        actual: 0,
      });
    }
    if (suggestion.kind === 'todo') {
      saveEntity('todo', {
        id,
        title: suggestion.title,
        description: suggestion.reason || '由 AI 拆解当前目标生成。',
        goalId: target.id,
        status: 'todo',
        importance: suggestion.importance,
        urgency: 3,
        planned: suggestion.planned,
        plannedStartTime: '09:00',
        plannedEndTime: '09:00',
        history: ['AI 建议采纳'],
      });
    }
    if (suggestion.kind === 'habit') {
      saveEntity('habit', {
        id,
        title: suggestion.title,
        goalIds: [target.id],
        status: 'active',
        importance: suggestion.importance,
        difficulty: suggestion.difficulty,
        repeat: createDefaultRepeatSetting(suggestion.planned),
        streak: 0,
        longest: 0,
        logs: [],
      });
    }
    setAccepted((items) => [...items, suggestion.id]);
    setSelected((items) => items.filter((itemId) => itemId !== suggestion.id));
  };

  const askSelected = () => {
    const picked = suggestions.filter((item) => selected.includes(item.id) && !accepted.includes(item.id) && !item.conflict);
    if (!picked.length) return message.warning('请先勾选可追问的建议');
    const lines = picked.map((item) => `- [${kindLabel[item.kind]}] ${item.title}（计划 ${item.planned}，重要 ${item.importance}）`);
    setDraft(`请针对以下建议进一步说明或优化：\n${lines.join('\n')}\n`);
    message.success('已预填到对话输入框，确认后发送');
  };

  return (
    <div data-product-ref={productRef('growth.goal.view.ai-decomposition')}>
      <Flex vertical gap={16}>
        <Flex className={styles.aiControls} justify="space-between" align="center" wrap="wrap" gap={12}>
          <Tag color="blue">当前目标：{target.title}</Tag>
          <Space wrap>
            <Button disabled={!selected.length} onClick={askSelected} data-product-ref={productRef('growth.goal.rule.ai-decompose-followup')}>
              对已选追问 {selected.length || ''}
            </Button>
            <Button disabled={!selected.length} onClick={() => setBatchOpen(true)}>
              采纳已选 {selected.length}
            </Button>
          </Space>
        </Flex>
        <Alert className={styles.aiAlert} type="info" showIcon title={payload.analysisSummary} />
        <Flex vertical className={styles.aiSuggestions} gap={12} data-product-ref={productRef('growth.goal.rule.ai-decompose-adopt')}>
          {suggestions.map((suggestion) => {
            const isAccepted = accepted.includes(suggestion.id);
            return (
              <Card size="small" key={suggestion.id} className={isAccepted ? styles.accepted : undefined}>
                <Flex justify="space-between" align="start" gap={12}>
                  <Space align="start">
                    <Checkbox
                      checked={selected.includes(suggestion.id)}
                      disabled={Boolean(suggestion.conflict) || isAccepted}
                      onChange={(event) =>
                        setSelected((items) =>
                          event.target.checked ? [...items, suggestion.id] : items.filter((id) => id !== suggestion.id),
                        )
                      }
                    />
                    <div className={isAccepted ? styles.acceptedPreview : undefined}>
                      <Tag
                        color={
                          suggestion.kind === 'goal'
                            ? 'purple'
                            : suggestion.kind === 'task'
                              ? 'blue'
                              : suggestion.kind === 'todo'
                                ? 'gold'
                                : 'green'
                        }
                      >
                        {kindLabel[suggestion.kind]}
                      </Tag>
                      <h3>{suggestion.title}</h3>
                      <p>{suggestion.reason}</p>
                      <small>
                        {suggestion.impact} · 计划 {suggestion.planned} · 重要 {suggestion.importance}
                      </small>
                      {suggestion.conflict ? <Alert type="warning" showIcon title={suggestion.conflict} /> : null}
                    </div>
                  </Space>
                  <Space vertical>
                    <Button size="small" onClick={() => openEdit(suggestion)} disabled={isAccepted}>
                      编辑
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      disabled={Boolean(suggestion.conflict) || isAccepted}
                      onClick={() => adopt(suggestion)}
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
            suggestions.filter((suggestion) => selected.includes(suggestion.id)).forEach(adopt);
            setSelected([]);
            setBatchOpen(false);
          }}
          okText="确认创建"
          cancelText="取消"
        >
          <p>将按各条当前预览逐条校验并创建。存在冲突的建议无法被勾选。</p>
        </Modal>
      </Flex>

      {editing && editDraft ? (
        <Drawer
          open
          title={`编辑${kindLabel[editDraft.kind]}建议`}
          onClose={() => {
            setEditing(null);
            setEditDraft(null);
          }}
          size="large"
          destroyOnHidden
          styles={drawerPaddedBodyStyles}
          extra={
            <Button type="primary" onClick={saveEdit}>
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
                  setEditDraft({ ...editDraft, planned: value ? value.format('YYYY-MM-DD') : editDraft.planned })
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
  );
}
