import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildGoalDecomposePayload } from '../../shared/ai-decompose-fixture';
import { buildTaskDecomposePayload } from '../../shared/ai-task-decompose-fixture';
import { initialGoals } from '../../shared/mock-data';
import type {
  AiConversation,
  AiMessage,
  AiWorkspacePart,
  DrawerState,
  Goal,
  Habit,
  SaveEntity,
  Task,
  Todo,
} from '../../shared/types';

type AiSessionContextValue = {
  goals: Goal[];
  tasks: Task[];
  setDrawer: (drawer: DrawerState) => void;
  saveEntity: SaveEntity;
  onOpenGoal: (goalId: string) => void;
  onOpenTask: (taskId: string) => void;
  conversations: AiConversation[];
  activeConversationId: string | null;
  activeConversation: AiConversation | undefined;
  activeMessages: AiMessage[];
  activeWorkspacePart: AiWorkspacePart | null;
  draft: string;
  setDraft: (value: string) => void;
  selectConversation: (id: string) => void;
  createBlankConversation: () => void;
  sendUserMessage: () => void;
  openWorkspaceFromMessage: (messageId: string) => void;
  goalTitle: (goalId?: string) => string | undefined;
  taskTitle: (taskId?: string) => string | undefined;
};

const AiSessionContext = createContext<AiSessionContextValue | null>(null);

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

function resolveActiveWorkspacePart(
  messages: AiMessage[],
  activeWorkspaceMessageId: string | null,
): AiWorkspacePart | null {
  if (!activeWorkspaceMessageId) return null;
  const picked = messages.find((message) => message.id === activeWorkspaceMessageId);
  return picked?.parts.find((item): item is AiWorkspacePart => item.type === 'workspace') || null;
}

function buildGoalDecomposeRequestPart(goal: Goal): AiMessage['parts'][number] {
  return {
    type: 'text',
    text: `请帮我拆解${goal.title}`,
    entityLink: { type: 'goal', id: goal.id, label: goal.title },
  };
}

function buildTaskDecomposeRequestPart(task: Task): AiMessage['parts'][number] {
  return {
    type: 'text',
    text: `请帮我拆解${task.title}`,
    entityLink: { type: 'task', id: task.id, label: task.title },
  };
}

function buildSeedData(goals: Goal[], tasks: Task[], todos: Todo[], habits: Habit[]) {
  const seedGoal = goals.find((goal) => goal.id === 'g3') || goals[0] || initialGoals[0];
  const boundId = 'conv-seed-bound';
  const chatId = 'conv-seed-chat';
  const payload = buildGoalDecomposePayload(seedGoal, goals, tasks, todos, habits);
  const conversations: AiConversation[] = [
    {
      id: boundId,
      title: `拆解：${seedGoal.title}`,
      refType: 'goal',
      refId: seedGoal.id,
      updatedAt: '2026-08-11T10:00:00.000Z',
    },
    {
      id: chatId,
      title: '随便聊聊',
      updatedAt: '2026-08-11T09:30:00.000Z',
    },
  ];
  const messages: AiMessage[] = [
    {
      id: 'msg-seed-user-1',
      conversationId: boundId,
      role: 'user',
      createdAt: '2026-08-11T09:58:00.000Z',
      parts: [buildGoalDecomposeRequestPart(seedGoal)],
    },
    {
      id: 'msg-seed-assistant-1',
      conversationId: boundId,
      role: 'assistant',
      createdAt: '2026-08-11T10:00:00.000Z',
      parts: [
        { type: 'text', text: `已根据「${seedGoal.title}」生成分层拆解建议，点击消息中的「打开工作台」可审阅并采纳。` },
        { type: 'workspace', workspaceKey: 'goal.decompose', payload },
      ],
    },
    {
      id: 'msg-seed-user-2',
      conversationId: chatId,
      role: 'user',
      createdAt: '2026-08-11T09:28:00.000Z',
      parts: [{ type: 'text', text: '今天适合做什么？' }],
    },
    {
      id: 'msg-seed-assistant-2',
      conversationId: chatId,
      role: 'assistant',
      createdAt: '2026-08-11T09:30:00.000Z',
      parts: [{ type: 'text', text: '可以从当前最重要的目标里挑一个最小下一步开始。这是纯文本回复，不会打开工作台。' }],
    },
  ];
  return { conversations, messages, activeConversationId: boundId };
}

type ProviderProps = {
  goals: Goal[];
  tasks: Task[];
  todos: Todo[];
  habits: Habit[];
  setDrawer: (drawer: DrawerState) => void;
  saveEntity: SaveEntity;
  onOpenGoal: (goalId: string) => void;
  onOpenTask: (taskId: string) => void;
  children: React.ReactNode;
};

export function AiSessionProvider({
  goals,
  tasks,
  todos,
  habits,
  setDrawer,
  saveEntity,
  onOpenGoal,
  onOpenTask,
  children,
}: ProviderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const seed = useMemo(() => buildSeedData(goals, tasks, todos, habits), []);
  const [conversations, setConversations] = useState<AiConversation[]>(seed.conversations);
  const [messages, setMessages] = useState<AiMessage[]>(seed.messages);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(seed.activeConversationId);
  const [activeWorkspaceMessageId, setActiveWorkspaceMessageId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  const activeConversation = conversations.find((item) => item.id === activeConversationId);
  const activeMessages = useMemo(
    () =>
      messages
        .filter((message) => message.conversationId === activeConversationId)
        .slice()
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    [messages, activeConversationId],
  );
  const activeWorkspacePart = useMemo(
    () => resolveActiveWorkspacePart(activeMessages, activeWorkspaceMessageId),
    [activeMessages, activeWorkspaceMessageId],
  );

  const goalTitle = useCallback(
    (goalId?: string) => (goalId ? goals.find((goal) => goal.id === goalId)?.title : undefined),
    [goals],
  );
  const taskTitle = useCallback(
    (taskId?: string) => (taskId ? tasks.find((task) => task.id === taskId)?.title : undefined),
    [tasks],
  );

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setActiveWorkspaceMessageId(null);
  }, []);

  const createBlankConversation = useCallback(() => {
    const id = createId('conv');
    const conversation: AiConversation = {
      id,
      title: '新会话',
      updatedAt: nowIso(),
    };
    setConversations((items) => [conversation, ...items]);
    setActiveConversationId(id);
    setActiveWorkspaceMessageId(null);
  }, []);

  const ensureGoalBoundConversation = useCallback(
    (goalId: string) => {
      const goal = goals.find((item) => item.id === goalId);
      if (!goal) return;
      const existing = conversationsRef.current
        .filter((item) => item.refType === 'goal' && item.refId === goalId)
        .slice()
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
      if (existing) {
        setActiveConversationId(existing.id);
        setActiveWorkspaceMessageId(null);
        return existing.id;
      }
      const conversationId = createId('conv');
      const timestamp = nowIso();
      const payload = buildGoalDecomposePayload(goal, goals, tasks, todos, habits);
      const conversation: AiConversation = {
        id: conversationId,
        title: `拆解：${goal.title}`,
        refType: 'goal',
        refId: goal.id,
        updatedAt: timestamp,
      };
      const userMessage: AiMessage = {
        id: createId('msg'),
        conversationId,
        role: 'user',
        createdAt: timestamp,
        parts: [buildGoalDecomposeRequestPart(goal)],
      };
      const assistantMessage: AiMessage = {
        id: createId('msg'),
        conversationId,
        role: 'assistant',
        createdAt: timestamp,
        parts: [
          { type: 'text', text: `已根据「${goal.title}」生成分层拆解建议，点击消息中的「打开工作台」可审阅并采纳。` },
          { type: 'workspace', workspaceKey: 'goal.decompose', payload },
        ],
      };
      setConversations((items) => [conversation, ...items]);
      setMessages((items) => [...items, userMessage, assistantMessage]);
      setActiveConversationId(conversationId);
      setActiveWorkspaceMessageId(null);
      return conversationId;
    },
    [goals, habits, tasks, todos],
  );

  const ensureTaskBoundConversation = useCallback(
    (taskId: string) => {
      const task = tasks.find((item) => item.id === taskId);
      if (!task) return;
      const existing = conversationsRef.current
        .filter((item) => item.refType === 'task' && item.refId === taskId)
        .slice()
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0];
      if (existing) {
        setActiveConversationId(existing.id);
        setActiveWorkspaceMessageId(null);
        return existing.id;
      }
      const conversationId = createId('conv');
      const timestamp = nowIso();
      const payload = buildTaskDecomposePayload(task, tasks, todos);
      const conversation: AiConversation = {
        id: conversationId,
        title: `拆解：${task.title}`,
        refType: 'task',
        refId: task.id,
        updatedAt: timestamp,
      };
      const userMessage: AiMessage = {
        id: createId('msg'),
        conversationId,
        role: 'user',
        createdAt: timestamp,
        parts: [buildTaskDecomposeRequestPart(task)],
      };
      const assistantMessage: AiMessage = {
        id: createId('msg'),
        conversationId,
        role: 'assistant',
        createdAt: timestamp,
        parts: [
          { type: 'text', text: `已根据「${task.title}」生成子任务与待办建议，点击消息中的「打开工作台」可审阅并采纳。` },
          { type: 'workspace', workspaceKey: 'task.decompose', payload },
        ],
      };
      setConversations((items) => [conversation, ...items]);
      setMessages((items) => [...items, userMessage, assistantMessage]);
      setActiveConversationId(conversationId);
      setActiveWorkspaceMessageId(null);
      return conversationId;
    },
    [tasks, todos],
  );

  useEffect(() => {
    const goalId = searchParams.get('goalId');
    if (!goalId) return;
    const conversationId = ensureGoalBoundConversation(goalId);
    const next = new URLSearchParams(searchParams);
    next.delete('goalId');
    if (conversationId) next.set('conversationId', conversationId);
    setSearchParams(next, { replace: true });
  }, [ensureGoalBoundConversation, searchParams, setSearchParams]);

  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (!taskId) return;
    const conversationId = ensureTaskBoundConversation(taskId);
    const next = new URLSearchParams(searchParams);
    next.delete('taskId');
    if (conversationId) next.set('conversationId', conversationId);
    setSearchParams(next, { replace: true });
  }, [ensureTaskBoundConversation, searchParams, setSearchParams]);

  const sendUserMessage = useCallback(() => {
    const text = draft.trim();
    if (!text || !activeConversationId) return;
    const timestamp = nowIso();
    const userMessage: AiMessage = {
      id: createId('msg'),
      conversationId: activeConversationId,
      role: 'user',
      createdAt: timestamp,
      parts: [{ type: 'text', text }],
    };
    const assistantMessage: AiMessage = {
      id: createId('msg'),
      conversationId: activeConversationId,
      role: 'assistant',
      createdAt: timestamp,
      parts: [
        {
          type: 'text',
          text: '已收到你的追问。会话页是通用对话壳层，不会自动改写已有工作台结果；新的结构化结果仍由对应能力在消息中产出后，由你手动打开工作台。',
        },
      ],
    };
    setMessages((items) => [...items, userMessage, assistantMessage]);
    setConversations((items) =>
      items.map((item) => (item.id === activeConversationId ? { ...item, updatedAt: timestamp } : item)),
    );
    setDraft('');
  }, [activeConversationId, draft]);

  const openWorkspaceFromMessage = useCallback((messageId: string) => {
    setActiveWorkspaceMessageId(messageId);
  }, []);

  const value = useMemo<AiSessionContextValue>(
    () => ({
      goals,
      tasks,
      setDrawer,
      saveEntity,
      onOpenGoal,
      onOpenTask,
      conversations,
      activeConversationId,
      activeConversation,
      activeMessages,
      activeWorkspacePart,
      draft,
      setDraft,
      selectConversation,
      createBlankConversation,
      sendUserMessage,
      openWorkspaceFromMessage,
      goalTitle,
      taskTitle,
    }),
    [
      activeConversation,
      activeConversationId,
      activeMessages,
      activeWorkspacePart,
      conversations,
      createBlankConversation,
      draft,
      goalTitle,
      goals,
      onOpenGoal,
      onOpenTask,
      openWorkspaceFromMessage,
      saveEntity,
      selectConversation,
      sendUserMessage,
      setDrawer,
      taskTitle,
      tasks,
    ],
  );

  return <AiSessionContext.Provider value={value}>{children}</AiSessionContext.Provider>;
}

export function useAiSessionContext() {
  const context = useContext(AiSessionContext);
  if (!context) throw new Error('AiSessionProvider is required');
  return context;
}
