import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Drawer,
  Flex,
  Input,
  Modal,
  Space,
  Spin,
  Tag,
  message,
} from '@sue/design-web-react';
import {
  Difficulty,
  GoalStatus,
  GoalType,
  Importance,
  TodoRelatedType,
  TodoStatus,
} from '@true-north/enum';
import type { AiSuggestionVo } from '@true-north/vo';
import { AiService, GoalService, HabitService, TaskService, TodoService } from '@true-north/web-service';
import { createDefaultRepeatSetting } from '@true-north/components-repeat';
import { RepeatEndMode, RepeatMode } from '@true-north/components-repeat/types';
import dayjs from 'dayjs';
import { drawerPaddedBodyStyles } from '@/utils/drawerStyles';
import styles from './style.module.less';

type SuggestionKind = 'goal' | 'task' | 'todo' | 'habit';

const KIND_LABEL: Record<SuggestionKind, string> = {
  goal: '子目标',
  task: '任务',
  todo: '待办',
  habit: '习惯',
};

const KIND_COLOR: Record<SuggestionKind, string> = {
  goal: 'purple',
  task: 'blue',
  todo: 'gold',
  habit: 'green',
};

export default function GoalAiDecomposition({
  open,
  goal,
  onClose,
  onSaved,
}: {
  open: boolean;
  goal: any;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState('');
  const [suggestions, setSuggestions] = useState<AiSuggestionVo[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [batchOpen, setBatchOpen] = useState(false);

  const resetSession = () => {
    setSelected([]);
    setAccepted([]);
    setTitles({});
    setError(null);
    setRunId(null);
    setAnalysisSummary('');
    setSuggestions([]);
  };

  const applyResponse = (data: {
    runId: string;
    analysisSummary: string;
    suggestions: AiSuggestionVo[];
  }) => {
    setRunId(data.runId);
    setAnalysisSummary(data.analysisSummary);
    setSuggestions(data.suggestions);
    setTitles({});
    setSelected([]);
    setAccepted([]);
    setError(null);
  };

  const loadDecompose = async (forceRefresh = false) => {
    if (!goal?.id) return;
    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const result = await AiService.decomposeGoal({ goalId: goal.id, forceRefresh });
      if (result.ok === false) {
        setError(result.message);
        setSuggestions([]);
        return;
      }
      applyResponse(result.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !goal?.id) return;
    resetSession();
    void loadDecompose(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when drawer opens for a goal
  }, [open, goal?.id]);

  const adopt = async (suggestion: AiSuggestionVo) => {
    if (!goal) return;
    if (suggestion.conflict) {
      message.warning('该建议存在重复冲突，请先跳过或调整');
      return;
    }
    if (accepted.includes(suggestion.id)) return;

    const title = (titles[suggestion.id] || suggestion.title).trim();
    if (!title) {
      message.warning('请输入建议名称');
      return;
    }

    const importance = (suggestion.importance || goal.importance || Importance.Core) as Importance;
    const difficulty = (suggestion.difficulty || goal.difficulty || Difficulty.Challenger) as Difficulty;
    const planned = suggestion.planned || dayjs().add(1, 'day').format('YYYY-MM-DD');
    const kind = suggestion.kind as SuggestionKind;

    const silent = { silent: true as const };
    let created: unknown;
    if (kind === 'goal') {
      created = await GoalService.create(
        {
          name: title,
          type: GoalType.RESULT,
          parentId: goal.id,
          status: GoalStatus.TODO,
          importance,
          difficulty,
          startAt: goal.startAt,
          endAt: goal.endAt,
          description: '由目标 AI 拆解创建。',
        },
        silent
      );
    } else if (kind === 'task') {
      created = await TaskService.create(
        {
          name: title,
          description: '由目标 AI 拆解创建。',
          tags: [],
          importance,
          difficulty,
          urgency: 3,
          goalId: goal.id,
          startAt: goal.startAt,
          endAt: goal.endAt,
          estimateTime: 3600,
        },
        silent
      );
    } else if (kind === 'todo') {
      created = await TodoService.create(
        {
          name: title,
          description: '由目标 AI 拆解创建。',
          status: TodoStatus.TODO,
          planDate: planned,
          importance,
          urgency: 3,
          relatedType: TodoRelatedType.GOAL,
          relatedId: goal.id,
        },
        silent
      );
    } else {
      const repeatSetting = createDefaultRepeatSetting(planned);
      created = await HabitService.create(
        {
          name: title,
          description: '由目标 AI 拆解创建。',
          importance,
          difficulty,
          tags: [],
          goalIds: [goal.id],
          ...repeatSetting,
          repeatMode: RepeatMode.DAILY,
          repeatEndMode: RepeatEndMode.FOREVER,
        },
        silent
      );
    }

    if (!created) {
      throw new Error(`采纳「${title}」失败`);
    }
    setAccepted((items) => [...items, suggestion.id]);
  };

  const saveSuggestions = async (items: AiSuggestionVo[]) => {
    setSaving(true);
    try {
      for (const suggestion of items) {
        if (suggestion.conflict || accepted.includes(suggestion.id)) continue;
        await adopt(suggestion);
      }
      setSelected([]);
      await onSaved();
      message.success('已采纳所选建议');
    } catch (err) {
      console.error('采纳 AI 建议失败:', err);
      message.error(err instanceof Error ? err.message : '采纳 AI 建议失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      title="AI 拆解"
      size="large"
      onClose={onClose}
      destroyOnHidden
      styles={drawerPaddedBodyStyles}
    >
      <Flex vertical gap={16}>
        <Flex className={styles.aiControls} justify="space-between" align="center" wrap="wrap" gap={12}>
          <Space wrap>
            <Tag color="blue">当前目标：{goal?.name || '未选择'}</Tag>
            {runId && <Tag>run: {runId.slice(0, 8)}</Tag>}
          </Space>
          <Space wrap>
            <Button disabled={loading || !goal} onClick={() => void loadDecompose(true)}>
              重新生成
            </Button>
            <Button
              type="primary"
              disabled={!selected.length || loading}
              loading={saving}
              onClick={() => setBatchOpen(true)}
            >
              采纳已选 {selected.length}
            </Button>
          </Space>
        </Flex>

        {loading && (
          <Flex vertical align="center" gap={8} style={{ padding: 32 }}>
            <Spin />
            <span>正在生成拆解建议…</span>
          </Flex>
        )}

        {!loading && error && (
          <Flex vertical gap={8}>
            <Alert type="error" showIcon title={error} />
            <Space>
              <Button size="small" onClick={() => void loadDecompose(false)}>
                重试
              </Button>
            </Space>
          </Flex>
        )}

        {!loading && !error && analysisSummary && (
          <Alert className={styles.aiAlert} type="info" showIcon title={analysisSummary} />
        )}

        {!loading && suggestions.length > 0 && (
          <Flex vertical className={styles.aiSuggestions} gap={12}>
            {suggestions.map((suggestion) => {
              const kind = suggestion.kind as SuggestionKind;
              const isAccepted = accepted.includes(suggestion.id);
              const blocked = Boolean(suggestion.conflict) || isAccepted;
              return (
                <Flex
                  key={suggestion.id}
                  className={`${styles.aiSuggestion} ${isAccepted ? styles.accepted : ''}`}
                  align="start"
                  gap={10}
                >
                  <Checkbox
                    checked={selected.includes(suggestion.id)}
                    disabled={blocked}
                    onChange={(event) =>
                      setSelected((items) =>
                        event.target.checked
                          ? [...items, suggestion.id]
                          : items.filter((id) => id !== suggestion.id)
                      )
                    }
                  />
                  <Flex vertical gap={6} className={styles.aiSuggestionBody}>
                    <Tag color={KIND_COLOR[kind]}>{KIND_LABEL[kind]}</Tag>
                    <Input
                      value={titles[suggestion.id] ?? suggestion.title}
                      disabled={isAccepted}
                      onChange={(event) =>
                        setTitles((items) => ({ ...items, [suggestion.id]: event.target.value }))
                      }
                    />
                    <span className={styles.aiReason}>{suggestion.reason}</span>
                    <small className={styles.aiMeta}>
                      {suggestion.impact} · 计划 {suggestion.planned} · 重要 {suggestion.importance}
                    </small>
                    {suggestion.conflict && (
                      <Alert type="warning" showIcon title={suggestion.conflict} />
                    )}
                    <Button
                      size="small"
                      type="primary"
                      disabled={blocked}
                      loading={saving}
                      onClick={() => void saveSuggestions([suggestion])}
                    >
                      {isAccepted ? '已采纳' : '采纳'}
                    </Button>
                  </Flex>
                </Flex>
              );
            })}
          </Flex>
        )}
      </Flex>

      <Modal
        title="批量采纳 AI 建议"
        open={batchOpen}
        onCancel={() => setBatchOpen(false)}
        onOk={() => {
          const items = suggestions.filter((item) => selected.includes(item.id));
          setBatchOpen(false);
          void saveSuggestions(items);
        }}
        okText="确认创建"
        cancelText="取消"
        confirmLoading={saving}
      >
        <p>将逐条校验并创建所选建议。存在冲突的建议无法被勾选。</p>
      </Modal>
    </Drawer>
  );
}
