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
import { productRef } from '../../../product-wiki';
import type { AiSuggestion, SaveEntity, Task, TaskDecomposePayload } from '../../../shared/types';
import { drawerPaddedBodyStyles } from '../../../shared/drawerStyles';
import styles from '../style.module.css';

type Props = {
  payload: TaskDecomposePayload;
  taskId?: string;
  tasks: Task[];
  saveEntity: SaveEntity;
  setDraft: (value: string) => void;
};

const kindLabel = { task: '子任务', todo: '待办' } as const;

function recalculateConflict(suggestion: AiSuggestion, tasks: Task[]): string | undefined {
  if (suggestion.kind !== 'task' || !suggestion.parentId) return undefined;
  const title = suggestion.title.trim();
  if (!title) return undefined;
  const clash = tasks.some(
    (item) =>
      item.parentId === suggestion.parentId &&
      (item.title === title || item.title.includes(title) || title.includes(item.title)),
  );
  return clash ? '已存在相近子任务' : undefined;
}

export function TaskDecomposeWorkspace({ payload, taskId, tasks, saveEntity, setDraft }: Props) {
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>(payload.suggestions);
  const [selected, setSelected] = useState<string[]>([]);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [batchOpen, setBatchOpen] = useState(false);
  const [editing, setEditing] = useState<AiSuggestion | null>(null);
  const [editDraft, setEditDraft] = useState<AiSuggestion | null>(null);
  const target =
    tasks.find((task) => task.id === taskId) ||
    tasks.find((task) => {
      const hint = payload.suggestions[0];
      return hint ? task.id === hint.taskId || task.id === hint.parentId : false;
    });

  useEffect(() => {
    setSuggestions(payload.suggestions);
    setSelected([]);
    setAccepted([]);
    setEditing(null);
    setEditDraft(null);
  }, [payload]);

  if (!target) {
    return <Alert type="warning" showIcon title="未找到绑定任务，无法审阅拆解建议。" />;
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
      conflict: recalculateConflict(editDraft, tasks),
    };
    setSuggestions((items) => items.map((item) => (item.id === next.id ? next : item)));
    setEditing(null);
    setEditDraft(null);
    message.success('已更新建议预览');
  };

  const adopt = (suggestion: AiSuggestion) => {
    if (suggestion.conflict) return message.warning('该建议存在重复冲突，请先跳过或调整');
    const id = `${suggestion.kind[0]}${Date.now()}${Math.random().toString(16).slice(2, 5)}`;
    if (suggestion.kind === 'task') {
      saveEntity('task', {
        id,
        title: suggestion.title,
        description: suggestion.reason || '由 AI 任务拆解建议创建。',
        goalId: target.goalId,
        parentId: target.id,
        status: 'todo',
        importance: suggestion.importance,
        difficulty: suggestion.difficulty,
        plannedStart: suggestion.planned,
        plannedEnd: suggestion.planned,
        start: target.start,
        end: target.end,
        estimated: 1,
        actual: 0,
      });
    }
    if (suggestion.kind === 'todo') {
      saveEntity('todo', {
        id,
        title: suggestion.title,
        description: suggestion.reason || '由 AI 任务拆解建议创建。',
        taskId: target.id,
        goalId: target.goalId,
        status: 'todo',
        importance: suggestion.importance,
        urgency: 3,
        planned: suggestion.planned,
        plannedStartTime: '09:00',
        plannedEndTime: '09:00',
        history: ['AI 建议采纳'],
      });
    }
    setAccepted((items) => [...items, suggestion.id]);
    setSelected((items) => items.filter((itemId) => itemId !== suggestion.id));
  };

  const askSelected = () => {
    const picked = suggestions.filter((item) => selected.includes(item.id) && !accepted.includes(item.id) && !item.conflict);
    if (!picked.length) return message.warning('请先勾选可追问的建议');
    const lines = picked.map((item) => {
      const label = item.kind === 'todo' ? kindLabel.todo : kindLabel.task;
      return `- [${label}] ${item.title}（计划 ${item.planned}，重要 ${item.importance}）`;
    });
    setDraft(`请针对以下建议进一步说明或优化：\n${lines.join('\n')}\n`);
    message.success('已预填到对话输入框，确认后发送');
  };

  return (
    <div data-product-ref={productRef('growth.task.view.ai-decomposition')}>
      <Flex vertical gap={16}>
        <Flex className={styles.aiControls} justify="space-between" align="center" wrap="wrap" gap={12}>
          <Tag color="blue">当前任务：{target.title}</Tag>
          <Space wrap>
            <Button
              disabled={!selected.length}
              onClick={askSelected}
              data-product-ref={productRef('growth.task.rule.ai-decompose-followup')}
            >
              对已选追问 {selected.length || ''}
            </Button>
            <Button disabled={!selected.length} onClick={() => setBatchOpen(true)}>
              采纳已选 {selected.length}
            </Button>
          </Space>
        </Flex>
        <Alert className={styles.aiAlert} type="info" showIcon title={payload.analysisSummary} />
        <Flex vertical className={styles.aiSuggestions} gap={12} data-product-ref={productRef('growth.task.rule.ai-decompose-adopt')}>
          {suggestions.map((suggestion) => {
            const isAccepted = accepted.includes(suggestion.id);
            const label = suggestion.kind === 'todo' ? kindLabel.todo : kindLabel.task;
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
                      <Tag color={suggestion.kind === 'todo' ? 'gold' : 'blue'}>{label}</Tag>
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
          <p>将按各条当前预览逐条校验并创建子任务或待办。存在冲突的建议无法被勾选。</p>
        </Modal>
      </Flex>

      {editing && editDraft ? (
        <Drawer
          open
          title={`编辑${editDraft.kind === 'todo' ? kindLabel.todo : kindLabel.task}建议`}
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
