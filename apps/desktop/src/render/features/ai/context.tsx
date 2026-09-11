import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
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
import { workspaceEntityRef } from '@true-north/vo';
import { AiService } from '@true-north/web-service';
import { useWorkbench } from '../workbench';
import type { WorkbenchToolRegistry } from '../workbench/types';
import type { AiEntityRecord, AiEntitySource } from './entity-source';
import type { AiDraft, SessionValue, ComposerInputRef } from './types';

const EMPTY_DRAFT: AiDraft = { text: '', links: [] };

function isAiPath(pathname: string) {
  return pathname === '/ai' || pathname.startsWith('/ai/');
}

function resolveAgentId(agents: RuntimeAgentVo[], savedId: string | null): string {
  const saved = savedId ? agents.find((item) => item.id === savedId) : undefined;
  if (saved?.available) return saved.id;
  const firstAvailable = agents.find((item) => item.available);
  if (firstAvailable) return firstAvailable.id;
  return savedId || agents[0]?.id || '';
}

const AiSessionContext = createContext<SessionValue | null>(null);

function collectEntityRefs(messages: MessageVo[]): AiEntityLinkVo[] {
  const map = new Map<string, AiEntityLinkVo>();
  for (const item of messages) {
    for (const part of item.parts || []) {
      if (part.type === 'text') {
        for (const link of part.entityLinks || []) {
          map.set(`${link.type}:${link.id}`, link);
        }
      }
      if (part.type === 'workspace') {
        const ref = workspaceEntityRef(part.payload);
        if (ref) map.set(`${ref.type}:${ref.id}`, ref);
      }
    }
  }
  return [...map.values()];
}

function appendDelta(item: MessageVo, delta: string): MessageVo {
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

function collectLinks(parts: MessageVo['parts']): AiEntityLinkVo[] {
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
  const localLinks = collectLinks(localParts);
  const incomingLinks = collectLinks(incomingParts);

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

function linksInText(text: string, links: AiEntityLinkVo[]): AiEntityLinkVo[] {
  return links.filter((link) => text.includes(`@${link.label}`));
}

function toolTabTitle(part: AiWorkspacePartVo, tools: WorkbenchToolRegistry): string {
  const definition = tools.find(part.workspaceKey);
  if (!definition) return '工作台';
  try {
    return definition.title(definition.parsePayload(part.payload) as never);
  } catch {
    return '工作台';
  }
}

function shouldAutoOpenWorkspace(
  item: MessageVo,
  force: boolean,
  tools: WorkbenchToolRegistry
): boolean {
  const workspace = item.parts.find((part): part is AiWorkspacePartVo => part.type === 'workspace');
  if (!workspace) return false;
  const definition = tools.find(workspace.workspaceKey);
  if (!definition?.autoOpen) return force;
  try {
    return definition.autoOpen({
      payload: definition.parsePayload(workspace.payload) as never,
      message: item,
      force,
    });
  } catch {
    return force;
  }
}

function withoutEntityParams(params: URLSearchParams, sources: AiEntitySource[]) {
  const next = new URLSearchParams(params);
  for (const source of sources) next.delete(source.searchParam);
  return next;
}

function titleFromFirstMessage(text: string): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (!compact) return '新会话';
  return compact.length <= 24 ? compact : `${compact.slice(0, 24)}…`;
}

export function AiSessionProvider({
  children,
  entitySources: createSources,
}: {
  children: ReactNode;
  entitySources: (navigate: NavigateFunction) => AiEntitySource[];
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const onAiPage = isAiPath(location.pathname);
  const { openToolTab, pendingFollowUp, clearFollowUp, tools } = useWorkbench();
  const entitySources = useMemo(() => createSources(navigate), [createSources, navigate]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<ConversationVo[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<MessageVo[]>([]);
  const [draft, setDraftState] = useState<AiDraft>(EMPTY_DRAFT);
  const [streaming, setStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<AiEntityRecord[]>([]);
  const [codingAgents, setCodingAgents] = useState<RuntimeAgentVo[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [pendingThreadReset, setPendingThreadReset] = useState(false);
  const streamIdRef = useRef<string | null>(null);
  const streamingConversationIdRef = useRef<string | null>(null);
  const suppressStreamErrorRef = useRef(false);
  const composerInputRef = useRef<ComposerInputRef>(null);
  const autoOpenOnDoneRef = useRef(false);
  const openToolTabRef = useRef(openToolTab);
  openToolTabRef.current = openToolTab;
  const assistantIdRef = useRef<string | null>(null);
  const [streamingAssistantId, setStreamingAssistantId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const creatingConversationRef = useRef(false);
  conversationIdRef.current = activeConversationId;

  const activeConversation = conversations.find((item) => item.id === activeConversationId);
  const selectedAgent = codingAgents.find((item) => item.id === selectedAgentId);
  const canSend = Boolean(selectedAgent?.available);
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
    if (!onAiPage) return;
    if (pendingFollowUp.conversationId !== activeConversationId) {
      const next = withoutEntityParams(searchParams, entitySources);
      next.set('conversationId', pendingFollowUp.conversationId);
      setSearchParams(next, { replace: true });
      return;
    }
    setDraft(pendingFollowUp.text);
    focusComposer();
    clearFollowUp();
  }, [
    activeConversationId,
    clearFollowUp,
    entitySources,
    focusComposer,
    onAiPage,
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
    const [entityLists, agentsResult, selectionResult] = await Promise.all([
      Promise.all(entitySources.map((source) => source.list())),
      AiService.listRuntimeAgents(),
      AiService.getRuntimeSelection(),
    ]);
    setEntities(entityLists.flat());
    const agents = agentsResult.ok === false ? [] : agentsResult.data;
    setCodingAgents(agents);
    const savedId = selectionResult.ok === false ? null : selectionResult.data.runtimeId;
    setSelectedAgentId(resolveAgentId(agents, savedId));
  }, [entitySources]);

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
        if (entities.some((item) => item.type === ref.type && item.id === ref.id)) {
          attemptedEntityKeysRef.current.add(key);
          continue;
        }
        attemptedEntityKeysRef.current.add(key);
        const source = entitySources.find((item) => item.type === ref.type);
        if (!source) continue;
        const found = await source.find(ref.id);
        if (!cancelled && found) {
          setEntities((items) =>
            items.some((item) => item.type === found.type && item.id === found.id) ? items : [...items, found]
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeMessages, entities, entitySources]);

  useEffect(() => {
    if (!onAiPage) return;
    const matched = entitySources
      .map((source) => ({ source, id: searchParams.get(source.searchParam) }))
      .find((item) => item.id);
    if (!matched?.id) return;

    let cancelled = false;
    (async () => {
      try {
        const found = await matched.source.find(matched.id!);
        if (!found) {
          message.error(`未找到${matched.source.boundKindLabel}`);
          return;
        }
        const link: AiEntityLinkVo = { type: found.type, id: found.id, label: found.label };
        if (cancelled) return;

        const bound = await AiService.ensureBoundConversation({ refType: link.type, refId: link.id });
        if (bound.ok === false) {
          message.error(bound.message);
          return;
        }
        if (cancelled) return;

        await refreshConversations(bound.data.conversation.id);

        if (bound.data.created) {
          setStreamError(null);
          setStreaming(true);
          autoOpenOnDoneRef.current = true;
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
            assistantIdRef.current = result.data.assistant.id;
            setStreamingAssistantId(result.data.assistant.id);
            setActiveMessages([result.data.user, result.data.assistant]);
          }
        }

        const next = withoutEntityParams(searchParams, entitySources);
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
  }, [entitySources, onAiPage, searchParams, refreshConversations, setSearchParams]);

  useEffect(() => {
    if (!onAiPage) return;
    const conversationId = searchParams.get('conversationId');
    if (conversationId) {
      creatingConversationRef.current = false;
      if (conversationId !== activeConversationId) {
        setActiveConversationId(conversationId);
      }
      return;
    }
    if (creatingConversationRef.current || streamIdRef.current) return;
    if (activeConversationId) {
      setActiveConversationId(null);
    }
  }, [onAiPage, searchParams, activeConversationId]);

  useEffect(() => {
    const unsubscribe = AiService.subscribeChatStream((event: AiChatStreamEventVo) => {
      if (!streamIdRef.current || event.streamId !== streamIdRef.current) return;

      if (event.event === 'delta') {
        const assistantId = assistantIdRef.current;
        if (!assistantId) return;
        setActiveMessages((items) =>
          items.map((item) => (item.id === assistantId ? appendDelta(item, event.delta) : item))
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
        const forceOpen = autoOpenOnDoneRef.current;
        autoOpenOnDoneRef.current = false;
        if (shouldAutoOpenWorkspace(event.message, forceOpen, tools)) {
          const part = event.message.parts.find((entry): entry is AiWorkspacePartVo => entry.type === 'workspace');
          if (part) {
            void openToolTabRef.current({
              conversationId: event.message.conversationId,
              messageId: event.message.id,
              workspaceKey: part.workspaceKey,
              title: toolTabTitle(part, tools),
              payload: part.payload,
            });
          }
        }
        streamIdRef.current = null;
        streamingConversationIdRef.current = null;
        assistantIdRef.current = null;
        setStreamingAssistantId(null);
        setStreaming(false);
        setPendingThreadReset(false);
        void refreshConversations(conversationIdRef.current);
        return;
      }

      if (event.event === 'error') {
        autoOpenOnDoneRef.current = false;
        const suppressed = suppressStreamErrorRef.current;
        suppressStreamErrorRef.current = false;
        streamIdRef.current = null;
        streamingConversationIdRef.current = null;
        assistantIdRef.current = null;
        setStreamingAssistantId(null);
        setStreaming(false);
        if (suppressed) return;
        setStreamError(event.messageText);
        message.error(event.messageText);
        if (conversationIdRef.current) {
          void loadMessages(conversationIdRef.current);
        }
      }
    });
    return unsubscribe;
  }, [loadMessages, refreshConversations, tools]);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setStreamError(null);
    setPendingThreadReset(false);
    if (!onAiPage) {
      navigate(`/ai?conversationId=${encodeURIComponent(id)}`);
      return;
    }
    const next = withoutEntityParams(searchParams, entitySources);
    next.set('conversationId', id);
    setSearchParams(next, { replace: true });
  }, [entitySources, navigate, onAiPage, searchParams, setSearchParams]);

  const createBlankConversation = useCallback(async () => {
    setActiveConversationId(null);
    setActiveMessages([]);
    setStreamError(null);
    setPendingThreadReset(false);
    if (!onAiPage) {
      navigate('/ai');
      return;
    }
    const next = withoutEntityParams(searchParams, entitySources);
    next.delete('conversationId');
    setSearchParams(next, { replace: true });
    requestAnimationFrame(() => focusComposer());
  }, [entitySources, focusComposer, navigate, onAiPage, searchParams, setSearchParams]);

  const renameConversation = useCallback(async (id: string, title: string) => {
    const result = await AiService.renameConversation(id, { title });
    if (result.ok === false) {
      message.error(result.message);
      return false;
    }
    setConversations((items) => items.map((item) => (item.id === id ? result.data : item)));
    return true;
  }, []);

  const pinConversation = useCallback(async (id: string, pinned: boolean) => {
    const result = await AiService.pinConversation(id, { pinned });
    if (result.ok === false) {
      message.error(result.message);
      return false;
    }
    setConversations((items) =>
      [...items.map((item) => (item.id === id ? result.data : item))].sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      })
    );
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
      const remaining = conversations.filter((item) => item.id !== id);
      setConversations(remaining);
      if (conversationIdRef.current !== id) return;
      setActiveConversationId(null);
      setActiveMessages([]);
      setStreamError(null);
      setPendingThreadReset(false);
      if (onAiPage) {
        const next = withoutEntityParams(searchParams, entitySources);
        next.delete('conversationId');
        setSearchParams(next, { replace: true });
        requestAnimationFrame(() => focusComposer());
      }
    },
    [conversations, entitySources, focusComposer, onAiPage, searchParams, setSearchParams]
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
    if (!text || streaming || !canSend) return;
    const entityLinks = linksInText(text, draft.links);

    setDraftState(EMPTY_DRAFT);
    setStreamError(null);
    setStreaming(true);
    autoOpenOnDoneRef.current = false;

    let conversationId = activeConversationId;
    if (!conversationId) {
      creatingConversationRef.current = true;
      const created = await AiService.createConversation({ title: titleFromFirstMessage(text) });
      if (created.ok === false) {
        creatingConversationRef.current = false;
        setStreaming(false);
        setStreamingAssistantId(null);
        setDraftState({ text, links: entityLinks });
        message.error(created.message);
        return;
      }
      conversationId = created.data.id;
      setConversations((items) => [created.data, ...items]);
      setActiveConversationId(conversationId);
      if (selectedAgentId) {
        const patched = await AiService.patchConversationRuntime(conversationId, { runtimeId: selectedAgentId });
        if (patched.ok) {
          setConversations((items) =>
            items.map((item) => (item.id === conversationId ? patched.data : item))
          );
        }
      }
      const next = withoutEntityParams(searchParams, entitySources);
      next.set('conversationId', conversationId);
      setSearchParams(next, { replace: true });
    }

    const result = await AiService.startMessageStream(conversationId, {
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
    streamingConversationIdRef.current = conversationId;
    assistantIdRef.current = result.data.assistant.id;
    setStreamingAssistantId(result.data.assistant.id);
    setActiveMessages((items) => [...items, result.data.user, result.data.assistant]);
  }, [
    activeConversationId,
    canSend,
    draft,
    entitySources,
    searchParams,
    selectedAgentId,
    setSearchParams,
    streaming,
  ]);

  const openWorkspace = useCallback(
    (messageId: string) => {
      const item = activeMessages.find((entry) => entry.id === messageId);
      const part = item?.parts.find((entry): entry is AiWorkspacePartVo => entry.type === 'workspace');
      if (!item || !part) return;
      void openToolTab({
        conversationId: item.conversationId || activeConversationId || '',
        messageId,
        workspaceKey: part.workspaceKey,
        title: toolTabTitle(part, tools),
        payload: part.payload,
      });
    },
    [activeConversationId, activeMessages, openToolTab, tools],
  );

  const openEntity = useCallback(
    (type: string, id: string) => {
      entitySources.find((source) => source.type === type)?.open(id);
    },
    [entitySources]
  );

  const boundLabel = useCallback(
    (refType?: string, refId?: string) => {
      if (!refType || !refId) return '';
      const source = entitySources.find((item) => item.type === refType);
      const entity = entities.find((item) => item.type === refType && item.id === refId);
      const kind = source?.boundKindLabel || source?.kindLabel || refType;
      return `${kind} · ${entity?.label || kind}`;
    },
    [entities, entitySources]
  );

  const value: SessionValue = {
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
    entities,
    entitySources,
    codingAgents,
    selectedAgentId,
    selectedAgent,
    selectCodingAgent,
    canSend,
    threadWillReset,
    selectConversation,
    createBlankConversation,
    renameConversation,
    pinConversation,
    deleteConversation,
    sendUserMessage,
    cancelStreaming,
    openWorkspace,
    openEntity,
    boundLabel,
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
