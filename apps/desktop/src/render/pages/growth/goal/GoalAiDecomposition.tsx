import { useMemo, useState } from 'react';
import { Alert, Button, Checkbox, Drawer, Flex, Input, Tag, message } from '@sue/design-web-react';
import { GoalType, GoalStatus, Difficulty, Importance, TodoStatus } from '@true-north/enum';
import { GoalService, TaskService, TodoService, HabitService } from '@true-north/web-service';
import { RepeatMode, RepeatEndMode } from '@true-north/components-repeat/types';
import { createDefaultRepeatSetting } from '@true-north/components-repeat';
import dayjs from 'dayjs';
import { drawerPaddedBodyStyles } from '@/utils/drawerStyles';
import styles from './style.module.less';

type SuggestionKind = 'goal' | 'task' | 'todo' | 'habit';
type Suggestion = { id: string; kind: SuggestionKind; title: string; reason: string; conflict?: string };

export default function GoalAiDecomposition({ open, goal, onClose, onSaved }: { open: boolean; goal: any; onClose: () => void; onSaved: () => Promise<void> }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const suggestions = useMemo<Suggestion[]>(() => {
    if (!goal) return [];
    const next = dayjs().add(1, 'day').format('YYYY-MM-DD');
    return [
      { id: `${goal.id}-goal`, kind: 'goal', title: `${goal.name} · 用户验证`, reason: '把当前方向拆成可验证的阶段成果。' },
      { id: `${goal.id}-task`, kind: 'task', title: `为“${goal.name}”安排关键行动`, reason: '形成一个可以在近期执行的阶段动作。' },
      { id: `${goal.id}-todo`, kind: 'todo', title: `确认“${goal.name}”的下一步`, reason: '把目标推进落实为明日可执行待办。' },
      { id: `${goal.id}-habit`, kind: 'habit', title: `每日复盘“${goal.name}”进展`, reason: '建立稳定反馈回路，减少规划与执行脱节。' },
    ].map((item) => ({ ...item, title: `${item.title} · ${next}` }));
  }, [goal]);

  const adopt = async (suggestion: Suggestion) => {
    if (!goal) return;
    const title = (titles[suggestion.id] || suggestion.title).trim();
    if (!title) return message.warning('请输入建议名称');
    if (suggestion.kind === 'goal') {
      await GoalService.create({ name: title, type: GoalType.RESULT, parentId: goal.id, status: GoalStatus.TODO, importance: goal.importance || Importance.Core, difficulty: goal.difficulty || Difficulty.Challenger, startAt: goal.startAt, endAt: goal.endAt, description: '由目标 AI 拆解创建。' });
    } else if (suggestion.kind === 'task') {
      await TaskService.create({ name: title, description: '由目标 AI 拆解创建。', tags: [], importance: goal.importance || Importance.Core, difficulty: goal.difficulty || Difficulty.Challenger, urgency: 3, goalId: goal.id, startAt: goal.startAt, endAt: goal.endAt, estimateTime: 3600 });
    } else if (suggestion.kind === 'todo') {
      await TodoService.create({ name: title, description: '由目标 AI 拆解创建。', status: TodoStatus.TODO, planDate: dayjs().add(1, 'day').format('YYYY-MM-DD'), importance: goal.importance || Importance.Core, urgency: 3 });
    } else {
      const repeatStartDate = dayjs().add(1, 'day').format('YYYY-MM-DD');
      const repeatSetting = createDefaultRepeatSetting(repeatStartDate);
      await HabitService.create({ name: title, description: '由目标 AI 拆解创建。', importance: goal.importance || Importance.Core, difficulty: goal.difficulty || Difficulty.Challenger, tags: [], goalIds: [goal.id], ...repeatSetting, repeatMode: RepeatMode.DAILY, repeatEndMode: RepeatEndMode.FOREVER });
    }
  };

  const saveSuggestions = async (items: Suggestion[]) => {
    setSaving(true);
    try {
      for (const suggestion of items) await adopt(suggestion);
      setSelected([]);
      await onSaved();
      message.success('已采纳所选建议');
    } catch (error) {
      console.error('采纳 AI 建议失败:', error);
      message.error('采纳 AI 建议失败');
    } finally {
      setSaving(false);
    }
  };

  const saveSelected = async () => saveSuggestions(suggestions.filter((item) => selected.includes(item.id)));

  return <Drawer open={open} title="AI 拆解" size="large" onClose={onClose} destroyOnHidden styles={drawerPaddedBodyStyles}><Flex vertical gap={16}><Alert type="info" showIcon title={goal ? `正在分析“${goal.name}”的目标范围与执行路径。` : '请选择一个目标。'} /><Flex justify="space-between" align="center"><Tag color="blue">本地可解释建议</Tag><Button type="primary" disabled={!selected.length} loading={saving} onClick={() => void saveSelected()}>采纳已选 {selected.length}</Button></Flex><Flex vertical gap={10}>{suggestions.map((suggestion) => <Flex key={suggestion.id} className={styles.aiSuggestion} align="start" gap={10}><Checkbox checked={selected.includes(suggestion.id)} onChange={(event) => setSelected((items) => event.target.checked ? [...items, suggestion.id] : items.filter((id) => id !== suggestion.id))} /><Flex vertical gap={6} className={styles.aiSuggestionBody}><Tag color={suggestion.kind === 'goal' ? 'purple' : suggestion.kind === 'task' ? 'blue' : suggestion.kind === 'todo' ? 'gold' : 'green'}>{({ goal: '子目标', task: '任务', todo: '待办', habit: '习惯' } as Record<SuggestionKind, string>)[suggestion.kind]}</Tag><Input value={titles[suggestion.id] ?? suggestion.title} onChange={(event) => setTitles((items) => ({ ...items, [suggestion.id]: event.target.value }))} /><span>{suggestion.reason}</span><Button size="small" onClick={() => void saveSuggestions([suggestion])}>采纳</Button></Flex></Flex>)}</Flex></Flex></Drawer>;
}
