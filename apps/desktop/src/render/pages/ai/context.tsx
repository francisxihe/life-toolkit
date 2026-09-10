import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from '@sue/design-web-react';
import type {
  AiChatStreamEventVo,
  AiEntityLinkVo,
  AiTextPartVo,
  AiWorkspacePartVo,
  ConversationVo,
  MessageVo,
  RuntimeAgentVo,
} from '@true-north/vo';
import { AiService, GoalService, TaskService } from '@true-north/web-service';
import { useWorkbench } from '../workbench';
import { openTaskDetailDrawer } from '../growth/task/detail/TaskDetailDrawer';
import type { AiDraft, AiSessionContextValue, ComposerInputRef } from './types';

const EMPTY_DRAFT: AiDraft = { text: '', links: [] };

function resolveSelectedAgentId(agents: RuntimeAgentVo[], savedId: string | null): string {
  const saved = savedId ? agents.find((item) => item.id === savedId) : undefined;
  if (saved?.available) return saved.id;
  const firstAvailable = agents.find((item) => item.available);
  if (firstAvailable) return firstAvailable.id;
  return savedId || agents[0]?.id || '';
}

const AiSessionContext = createContext<AiSessionContextValue | null>(null);

function collectEntityRefs(messages: MessageVo[]): AiEntityLinkVo[] {
  const map = new Map<string, AiEntityLinkVo>();
  for (const item of messages) {
    for (const part of item.parts || []) {
      if (part.type === 'text') {
        for (const link of part.entityLinks || []) {
          map.set(`${link.type}:${link.id}`, link);
        }
      }
      if (part.type === 'workspace' && part.payload.ref) {
        const ref = part.payload.ref;
        map.set(`${ref.type}:${ref.id}`, ref);
      }
    }
  }
  return [...map.values()];
}

function appendDeltaToParts(item: MessageVo, delta: string): MessageVo {
  const parts = [...(item.parts || [])];
  const last = parts[parts.length - 1];
  if (last && last.type === 'text') {
    parts[parts.length - 1] = { ...last, text: `${last.text || ''}${delta}` };
  } else {
    parts.push({ type: 'text', text: delta });
  }
  return { ...item, parts };
}

function concatTextParts(parts: MessageVo['parts']): string {
  return parts
    .filter((part): part is AiTextPartVo => part.type === 'text')
    .map((part) => part.text || '')
    .join('');
}

function collectTextEntityLinks(parts: MessageVo['parts']): AiEntityLinkVo[] {
  const links: AiEntityLinkVo[] = [];
  for (const part of parts) {
    if (part.type === 'text') {
      links.push(...(part.entityLinks || []));
    }
  }
  return links;
}

function mergeAssistantMessage(local: MessageVo, incoming: MessageVo): MessageVo {
  const localParts = local.parts || [];
  const incomingParts = incoming.parts || [];
  const localText = concatTextParts(localParts);
  const incomingText = concatTextParts(incomingParts);
  const localLinks = collectTextEntityLinks(localParts);
  const incomingLinks = collectTextEntityLinks(incomingParts);

  let text = incomingText;
  let entityLinks = incomingLinks;
  if (localText.startsWith(incomingText) || incomingText.startsWith(localText)) {
    if (localText.length >= incomingText.length) {
      text = localText;
      entityLinks = localLinks;
    }
  }

  const textPart: AiTextPartVo = entityLinks.length
    ? { type: 'text', text, entityLinks }
    : { type: 'text', text };
  const parts: MessageVo['parts'] = [];
  let insertedText = false;
  for (const part of incomingParts) {
    if (part.type === 'text') {
      if (!insertedText) {
        parts.push(textPart);
        insertedText = true;
      }
    } else {
      parts.push(part);
    }
  }
  if (!insertedText && text) {
    parts.unshift(textPart);
  }

  return { ...incoming, parts };
}

function linksStillInText(text: string, links: AiEntityLinkVo[]): AiEntityLinkVo[] {
  return links.filter((link) => text.includes(`@${link.label}`));
}

function toolTabTitle(part: AiWorkspacePartVo): string {
  const refLabel = part.payload.ref?.label;
  const base = part.workspaceKey === 'task.decompose' ? '任务拆解' : '目标拆解';
  return refLabel ? `${base} · ${refLabel}` : base;
}

export function AiSessionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { openToolTab, pendingFollowUp, clearPendingFollowUp } = useWorkbench();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<ConversationVo[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<MessageVo[]>([]);
  const [draft, setDraftState] = useState<AiDraft>(EMPTY_DRAFT);
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [codingAgents, setCodingAgents] = useState<RuntimeAgentVo[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [pendingThreadReset, setPendingThreadReset] = useState(false);
  const streamIdRef = useRef<string | null>(null);
  const streamingConversationIdRef = useRef<string | null>(null);
  const suppressStreamErrorRef = useRef(false);
  const composerInputRef = useRef<ComposerInputRef>(null);
  const streamingAssistantIdRef = useRef<string | null>(null);
  const [streamingAssistantId, setStreamingAssistantId] = useState<string | null>(null);
  const activeConversationIdRef = useRef<string | null>(null);
  activeConversationIdRef.current = activeConversationId;

  const activeConversation = conversations.find((item) => item.id === activeConversationId);
  const selectedAgent = codingAgents.find((item) => item.id === selectedAgentId);
  const canSendWithSelectedAgent = Boolean(selectedAgent?.available);
  const threadWillReset = Boolean(
    pendingThreadReset ||
      (activeConversation?.runtimeId && activeConversation.runtimeId !== selectedAgentId)
  );

  const setDraft = useCallback((value: string | AiDraft) => {
    if (typeof value === 'string') {
      setDraftState((prev) => ({ ...prev, text: value }));
      return;
    }
    setDraftState(value);
  }, []);

  const focusComposer = useCallback(() => {
    composerInputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!pendingFollowUp) return;
    if (pendingFollowUp.conversationId !== activeConversationId) {
      const next = new URLSearchParams(searchParams);
      next.set('conversationId', pendingFollowUp.conversationId);
      next.delete('goalId');
      next.delete('taskId');
      setSearchParams(next, { replace: true });
      return;
    }
    setDraft(pendingFollowUp.text);
    focusComposer();
    clearPendingFollowUp();
  }, [
    activeConversationId,
    clearPendingFollowUp,
    focusComposer,
    pendingFollowUp,
    searchParams,
    setDraft,
    setSearchParams,
  ]);

  const refreshConversations = useCallback(async (preferId?: string | null) => {
    const result = await AiService.listConversations();
    if (result.ok === false) {
      message.error(result.message);
      return [] as ConversationVo[];
    }
    setConversations(result.data);
    if (preferId && result.data.some((item) => item.id === preferId)) {
      setActiveConversationId(preferId);
    } else if (!preferId && !activeConversationIdRef.current && result.data[0]) {
      setActiveConversationId(result.data[0].id);
    }
    return result.data;
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    const result = await AiService.listMessages(conversationId);
    if (result.ok === false) {
      message.error(result.message);
      setActiveMessages([]);
      return;
    }
    setActiveMessages(result.data);
  }, []);

  const loadMeta = useCallback(async () => {
    const [goalResult, taskResult, agentsResult, selectionResult] = await Promise.all([
      GoalService.findByFilter({}),
      TaskService.findByFilter({}),
      AiService.listRuntimeAgents(),
      AiService.getRuntimeSelection(),
    ]);
    setGoals(goalResult?.list ?? []);
    setTasks(taskResult?.list ?? []);
    const agents = agentsResult.ok === false ? [] : agentsResult.data;
    setCodingAgents(agents);
    const savedId = selectionResult.ok === false ? null : selectionResult.data.runtimeId;
    setSelectedAgentId(resolveSelectedAgentId(agents, savedId));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadMeta();
      if (cancelled) return;
      await refreshConversations();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loadMeta, refreshConversations]);

  useEffect(() => {
    if (!activeConversationId) {
      setActiveMessages([]);
      return;
    }
    if (streamIdRef.current) return;
    void loadMessages(activeConversationId);
  }, [activeConversationId, loadMessages]);

  const attemptedEntityKeysRef = useRef(new Set<string>());

  useEffect(() => {
    const refs = collectEntityRefs(activeMessages);
    if (!refs.length) return;

    let cancelled = false;
    (async () => {
      for (const ref of refs) {
        if (cancelled) return;
        const key = `${ref.type}:${ref.id}`;
        if (attemptedEntityKeysRef.current.has(key)) continue;
        if (ref.type === 'goal' && goals.some((goal) => goal.id === ref.id)) {
          attemptedEntityKeysRef.current.add(key);
          continue;
        }
        if (ref.type === 'task' && tasks.some((task) => task.id === ref.id)) {
          attemptedEntityKeysRef.current.add(key);
          continue;
        }
        attemptedEntityKeysRef.current.add(key);
        if (ref.type === 'goal') {
          try {
            const goal = await GoalService.find(ref.id);
            if (!cancelled && goal?.id) {
              setGoals((items) => (items.some((item) => item.id === goal.id) ? items : [...items, goal]));
            }
          } catch {
            // workspace shows missing-goal warning
          }
        } else {
          try {
            const task = await TaskService.find(ref.id);
            if (!cancelled && task?.id) {
              setTasks((items) => (items.some((item) => item.id === task.id) ? items : [...items, task]));
            }
          } catch {
            // workspace shows missing-task warning
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeMessages, goals, tasks]);

  useEffect(() => {
    const goalId = searchParams.get('goalId');
    const taskId = searchParams.get('taskId');
    if (!goalId && !taskId) return;

    let cancelled = false;
    (async () => {
      try {
        let link: AiEntityLinkVo | null = null;
        if (goalId) {
          const goal = await GoalService.find(goalId);
          if (!goal?.id) {
            message.error('未找到目标');
            return;
          }
          link = { type: 'goal', id: goal.id, label: goal.name };
        } else if (taskId) {
          const task = await TaskService.find(taskId);
          if (!task?.id) {
            message.error('未找到任务');
            return;
          }
          link = { type: 'task', id: task.id, label: task.name };
        }
        if (!link || cancelled) return;

        const bound =
          link.type === 'goal'
            ? await AiService.ensureBoundGoal({ goalId: link.id })
            : await AiService.ensureBoundTask({ taskId: link.id });
        if (bound.ok === false) {
          message.error(bound.message);
          return;
        }
        if (cancelled) return;

        await refreshConversations(bound.data.conversation.id);

        if (bound.data.created) {
          setStreamError(null);
          setStreaming(true);
          const result = await AiService.startMessageStream(bound.data.conversation.id, {
            text: `请帮我拆解 @${link.label}`,
            entityLinks: [link],
          });
          if (result.ok === false) {
            setStreaming(false);
            setStreamingAssistantId(null);
            message.error(result.message);
          } else if (!cancelled) {
            streamIdRef.current = result.data.streamId;
            streamingConversationIdRef.current = bound.data.conversation.id;
            streamingAssistantIdRef.current = result.data.assistant.id;
            setStreamingAssistantId(result.data.assistant.id);
            setActiveMessages([result.data.user, result.data.assistant]);
          }
        }

        const next = new URLSearchParams(searchParams);
        next.delete('goalId');
        next.delete('taskId');
        next.set('conversationId', bound.data.conversation.id);
        setSearchParams(next, { replace: true });
      } catch (error) {
        if (!cancelled) {
          message.error(error instanceof Error ? error.message : '发起拆解会话失败');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, refreshConversations, setSearchParams]);

  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    if (conversationId && conversationId !== activeConversationId) {
      setActiveConversationId(conversationId);
    }
  }, [searchParams, activeConversationId]);

  useEffect(() => {
    const unsubscribe = AiService.subscribeChatStream((event: AiChatStreamEventVo) => {
      if (!streamIdRef.current || event.streamId !== streamIdRef.current) return;

      if (event.event === 'delta') {
        const assistantId = streamingAssistantIdRef.current;
        if (!assistantId) return;
        setActiveMessages((items) =>
          items.map((item) => (item.id === assistantId ? appendDeltaToParts(item, event.delta) : item))
        );
        return;
      }

      if (event.event === 'message') {
        setActiveMessages((items) =>
          items.map((item) =>
            item.id === event.message.id ? mergeAssistantMessage(item, event.message) : item
          )
        );
        return;
      }

      if (event.event === 'done') {
        setActiveMessages((items) =>
          items.map((item) =>
            item.id === event.message.id ? mergeAssistantMessage(item, event.message) : item
          )
        );
        streamIdRef.current = null;
        streamingConversationIdRef.current = null;
        streamingAssistantIdRef.current = null;
        setStreamingAssistantId(null);
        setStreaming(false);
        setPendingThreadReset(false);
        void refreshConversations(activeConversationIdRef.current);
        return;
      }

      if (event.event === 'error') {
        const suppressed = suppressStreamErrorRef.current;
        suppressStreamErrorRef.current = false;
        streamIdRef.current = null;
        streamingConversationIdRef.current = null;
        streamingAssistantIdRef.current = null;
        setStreamingAssistantId(null);
        setStreaming(false);
        if (suppressed) return;
        setStreamError(event.messageText);
        message.error(event.messageText);
        if (activeConversationIdRef.current) {
          void loadMessages(activeConversationIdRef.current);
        }
      }
    });
    return unsubscribe;
  }, [loadMessages, refreshConversations]);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setStreamError(null);
    setPendingThreadReset(false);
    const next = new URLSearchParams(searchParams);
    next.set('conversationId', id);
    next.delete('goalId');
    next.delete('taskId');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const createBlankConversation = useCallback(async () => {
    const result = await AiService.createConversation({ title: '新会话' });
    if (result.ok === false) {
      message.error(result.message);
      return;
    }
    await refreshConversations(result.data.id);
    setPendingThreadReset(false);
    setActiveMessages([]);
  }, [refreshConversations]);

  const renameConversation = useCallback(async (id: string, title: string) => {
    const result = await AiService.renameConversation(id, { title });
    if (result.ok === false) {
      message.error(result.message);
      return false;
    }
    setConversations((items) => items.map((item) => (item.id === id ? result.data : item)));
    return true;
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      const streamId = streamIdRef.current;
      if (streamingConversationIdRef.current === id && streamId) {
        suppressStreamErrorRef.current = true;
        await AiService.cancelMessageStream(streamId);
      }
      const result = await AiService.deleteConversation(id);
      if (result.ok === false) {
        suppressStreamErrorRef.current = false;
        message.error(result.message);
        return;
      }
      setConversations((items) => items.filter((item) => item.id !== id));
      if (activeConversationIdRef.current !== id) return;
      setActiveConversationId(null);
      setActiveMessages([]);
      setStreamError(null);
      setPendingThreadReset(false);
      const next = new URLSearchParams(searchParams);
      next.delete('conversationId');
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const selectCodingAgent = useCallback(
    async (id: string) => {
      const next = codingAgents.find((item) => item.id === id);
      if (!next?.available) return;
      const previousRuntimeId = activeConversation?.runtimeId;
      const selection = await AiService.putRuntimeSelection({ runtimeId: id });
      if (selection.ok === false) {
        message.error(selection.message);
        return;
      }
      setSelectedAgentId(id);
      if (activeConversationId) {
        const patched = await AiService.patchConversationRuntime(activeConversationId, { runtimeId: id });
        if (patched.ok === false) {
          message.error(patched.message);
          return;
        }
        setConversations((items) =>
          items.map((item) => (item.id === activeConversationId ? patched.data : item))
        );
        if (previousRuntimeId && previousRuntimeId !== id) {
          setPendingThreadReset(true);
          message.info(`之后的发送将由「${next.name}」重新开始，不会续跑上一 Agent 的对话线程。`);
        }
      }
    },
    [activeConversation?.runtimeId, activeConversationId, codingAgents]
  );

  const cancelStreaming = useCallback(async () => {
    const streamId = streamIdRef.current;
    if (!streamId) return;
    await AiService.cancelMessageStream(streamId);
  }, []);

  const sendUserMessage = useCallback(async () => {
    const text = draft.text.trim();
    if (!text || !activeConversationId || streaming || !canSendWithSelectedAgent) return;
    const entityLinks = linksStillInText(text, draft.links);

    setDraftState(EMPTY_DRAFT);
    setStreamError(null);
    setStreaming(true);
    const result = await AiService.startMessageStream(activeConversationId, {
      text,
      entityLinks: entityLinks.length ? entityLinks : undefined,
    });
    if (result.ok === false) {
      setStreaming(false);
      setStreamingAssistantId(null);
      setDraftState({ text, links: entityLinks });
      message.error(result.message);
      return;
    }

    streamIdRef.current = result.data.streamId;
    streamingConversationIdRef.current = activeConversationId;
    streamingAssistantIdRef.current = result.data.assistant.id;
    setStreamingAssistantId(result.data.assistant.id);
    setActiveMessages((items) => [...items, result.data.user, result.data.assistant]);
  }, [activeConversationId, canSendWithSelectedAgent, draft, streaming]);

  const openWorkspaceFromMessage = useCallback(
    (messageId: string) => {
      const item = activeMessages.find((entry) => entry.id === messageId);
      const part = item?.parts.find((entry): entry is AiWorkspacePartVo => entry.type === 'workspace');
      if (!item || !part) return;
      void openToolTab({
        conversationId: item.conversationId || activeConversationId || '',
        messageId,
        workspaceKey: part.workspaceKey,
        title: toolTabTitle(part),
        payload: part.payload,
      });
    },
    [activeConversationId, activeMessages, openToolTab],
  );

  const goalTitle = useCallback(
    (goalId?: string) => (goalId ? goals.find((goal) => goal.id === goalId)?.name : undefined),
    [goals]
  );
  const taskTitle = useCallback(
    (taskId?: string) => (taskId ? tasks.find((task) => task.id === taskId)?.name : undefined),
    [tasks]
  );
  const findGoal = useCallback(
    (goalId?: string) => (goalId ? goals.find((goal) => goal.id === goalId) : undefined),
    [goals]
  );
  const findTask = useCallback(
    (taskId?: string) => (taskId ? tasks.find((task) => task.id === taskId) : undefined),
    [tasks]
  );

  const onOpenGoal = useCallback(
    (goalId: string) => {
      navigate(`/growth/goal?goalId=${encodeURIComponent(goalId)}`);
    },
    [navigate]
  );

  const onOpenTask = useCallback((taskId: string) => {
    openTaskDetailDrawer({ taskId });
  }, []);

  const value: AiSessionContextValue = {
    conversations,
    activeConversationId,
    activeConversation,
    activeMessages,
    draft,
    setDraft,
    composerInputRef,
    focusComposer,
    streaming,
    streamingAssistantId,
    streamError,
    loading,
    goals,
    tasks,
    codingAgents,
    selectedAgentId,
    selectedAgent,
    selectCodingAgent,
    canSendWithSelectedAgent,
    threadWillReset,
    selectConversation,
    createBlankConversation,
    renameConversation,
    deleteConversation,
    sendUserMessage,
    cancelStreaming,
    openWorkspaceFromMessage,
    goalTitle,
    taskTitle,
    onOpenGoal,
    onOpenTask,
    findGoal,
    findTask,
  };

  return <AiSessionContext.Provider value={value}>{children}</AiSessionContext.Provider>;
}

export function useAiSessionContext() {
  const ctx = useContext(AiSessionContext);
  if (!ctx) {
    throw new Error('useAiSessionContext must be used within AiSessionProvider');
  }
  return ctx;
}
