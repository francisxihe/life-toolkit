import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from '@sue/design-web-react';
import { BrowserService } from '@true-north/web-service';
import { HOST_BROWSER_OPEN, HOST_WORKBENCH_OPEN } from '@true-north/plugin-sdk';
import { useHostActions, WorkbenchRuntimeContext } from '@true-north/plugin-sdk/renderer';
import type {
  AiWorkspacePayloadVo,
  BrowserBoundsVo,
  BrowserExtractResultVo,
  BrowserStateVo,
  BrowserTabVo,
} from '@true-north/vo';
import { normalizeBrowserUrl } from '@true-north/vo';
import type {
  WorkbenchExtractHandler,
  WorkbenchToolDefinition,
  WorkbenchToolRegistry,
  WorkbenchWorkspaceHost,
} from './types';
import { createWorkbenchToolRegistry } from './types';

const DEFAULT_WIDTH = 480;
const MIN_WIDTH = 360;
const WIDTH_KEY = 'workbench-width';
const LEGACY_WIDTH_KEY = 'embedded-browser-width';
const EMPTY_BOUNDS: BrowserBoundsVo = { x: 0, y: 0, width: 0, height: 0 };
const EMPTY_STATE: BrowserStateVo = { visible: false, activeTabId: null, tabs: [] };

type AddressInputHandle = {
  focus: () => void;
  select?: () => void;
  input?: HTMLInputElement;
  nativeElement?: HTMLInputElement;
};

export type WorkbenchToolTab = {
  kind: 'tool';
  id: string;
  conversationId: string;
  messageId: string;
  workspaceKey: string;
  title: string;
  payload: AiWorkspacePayloadVo;
};

export type WorkbenchWebTab = {
  kind: 'web';
  id: string;
  title: string;
  loading: boolean;
};

export type WorkbenchTab = WorkbenchWebTab | WorkbenchToolTab;

export type TabInput = {
  conversationId: string;
  messageId: string;
  workspaceKey: string;
  title: string;
  payload: AiWorkspacePayloadVo;
};

export type WorkbenchFollowUp = {
  conversationId: string;
  text: string;
};

type WorkbenchContextValue = {
  open: boolean;
  width: number;
  state: BrowserStateVo;
  tabs: WorkbenchTab[];
  activeTabId: string | null;
  activeTab: WorkbenchTab | undefined;
  activeWebTab: BrowserTabVo | undefined;
  addressInputRef: RefObject<AddressInputHandle | null>;
  pendingFollowUp: WorkbenchFollowUp | null;
  toggle: () => void;
  close: () => void;
  setWidth: (width: number) => void;
  setLeftReserve: (width: number) => void;
  createTab: () => Promise<void>;
  closeTab: (id: string) => Promise<void>;
  activateTab: (id: string) => Promise<void>;
  openToolTab: (input: TabInput) => Promise<void>;
  requestFollowUp: (conversationId: string, text: string) => void;
  clearFollowUp: () => void;
  navigate: (url: string) => Promise<void>;
  goBack: () => Promise<void>;
  reload: () => Promise<void>;
  goForward: () => Promise<void>;
  extractActiveTab: () => Promise<BrowserExtractResultVo | undefined>;
  reportBounds: (bounds: BrowserBoundsVo) => void;
  tools: WorkbenchToolRegistry;
  workspaceHost: WorkbenchWorkspaceHost;
};

const WorkbenchContext = WorkbenchRuntimeContext as unknown as ReturnType<typeof createContext<WorkbenchContextValue | null>>;

function readStoredWidth(): number {
  if (typeof window === 'undefined') return DEFAULT_WIDTH;
  const raw = window.localStorage.getItem(WIDTH_KEY) ?? window.localStorage.getItem(LEGACY_WIDTH_KEY);
  const parsed = raw ? Number(raw) : DEFAULT_WIDTH;
  if (!Number.isFinite(parsed)) return DEFAULT_WIDTH;
  return Math.max(MIN_WIDTH, parsed);
}

const DEFAULT_LEFT_RESERVE = 280;
const MIN_CONVERSATION_WIDTH = 360;

function maxPanelWidth(leftReserve: number) {
  if (typeof window === 'undefined') return DEFAULT_WIDTH;
  return Math.max(MIN_WIDTH, window.innerWidth - leftReserve - MIN_CONVERSATION_WIDTH);
}

function neighborId(order: string[], closedId: string): string | null {
  const index = order.indexOf(closedId);
  if (index < 0) return order[order.length - 1] ?? null;
  return order[index + 1] ?? order[index - 1] ?? null;
}

export function useWorkbench() {
  const context = useContext(WorkbenchContext);
  if (!context) throw new Error('useWorkbench 需在 WorkbenchProvider 内使用');
  return context;
}

export function useWorkbenchOptional() {
  return useContext(WorkbenchContext);
}

async function withState(
  run: () => Promise<BrowserStateVo>,
  apply: (state: BrowserStateVo) => void,
) {
  try {
    apply(await run());
  } catch (error) {
    const text = error instanceof Error ? error.message : '浏览器操作失败';
    message.error(text);
  }
}

export function WorkbenchProvider({
  children,
  tools: toolDefinitions,
  workspaceHost,
  extractHandler,
}: {
  children: ReactNode;
  tools: WorkbenchToolDefinition[];
  workspaceHost: WorkbenchWorkspaceHost;
  extractHandler?: WorkbenchExtractHandler;
}) {
  const tools = useMemo(() => createWorkbenchToolRegistry(toolDefinitions), [toolDefinitions]);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [width, setWidthState] = useState(readStoredWidth);
  const [leftReserve, setLeftReserveState] = useState(DEFAULT_LEFT_RESERVE);
  const [state, setState] = useState<BrowserStateVo>(EMPTY_STATE);
  const [toolTabs, setToolTabs] = useState<WorkbenchToolTab[]>([]);
  const [tabOrder, setTabOrder] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [pendingFollowUp, setPendingFollowUp] = useState<WorkbenchFollowUp | null>(null);
  const addressInputRef = useRef<AddressInputHandle | null>(null);
  const boundsRaf = useRef<number | null>(null);
  const pendingBounds = useRef<BrowserBoundsVo | null>(null);
  const toolTabsRef = useRef<WorkbenchToolTab[]>([]);
  const tabOrderRef = useRef<string[]>([]);
  const prevWebIdsRef = useRef<Set<string>>(new Set());
  toolTabsRef.current = toolTabs;
  tabOrderRef.current = tabOrder;

  const applyState = useCallback((next: BrowserStateVo) => {
    setState(next);
    setOpen(next.visible);
    const incomingWebIds = next.tabs.map((tab) => tab.id);
    const incomingSet = new Set(incomingWebIds);
    setTabOrder((prev) => {
      const toolIds = new Set(toolTabsRef.current.map((tab) => tab.id));
      const kept = prev.filter((id) => toolIds.has(id) || incomingSet.has(id));
      const added = incomingWebIds.filter((id) => !kept.includes(id));
      return [...kept, ...added];
    });
    const newIds = incomingWebIds.filter((id) => !prevWebIdsRef.current.has(id));
    prevWebIdsRef.current = incomingSet;
    if (newIds.length && next.activeTabId && newIds.includes(next.activeTabId)) {
      setActiveId(next.activeTabId);
    }
  }, []);

  useEffect(() => {
    if (!window.electronAPI?.isElectron) return undefined;
    void BrowserService.getState().then(applyState).catch(() => undefined);
    return BrowserService.subscribeState(applyState);
  }, [applyState]);

  const setWidth = useCallback((next: number) => {
    const clamped = Math.min(maxPanelWidth(leftReserve), Math.max(MIN_WIDTH, Math.round(next)));
    setWidthState(clamped);
    window.localStorage.setItem(WIDTH_KEY, String(clamped));
  }, [leftReserve]);

  const setLeftReserve = useCallback((next: number) => {
    setLeftReserveState(next);
    setWidthState((current) => {
      const clamped = Math.min(maxPanelWidth(next), Math.max(MIN_WIDTH, current));
      if (clamped !== current) window.localStorage.setItem(WIDTH_KEY, String(clamped));
      return clamped;
    });
  }, []);

  const createTab = useCallback(async () => {
    await withState(() => BrowserService.createTab(), applyState);
  }, [applyState]);

  const ensureOpen = useCallback(async () => {
    await withState(() => BrowserService.setVisible(true), applyState);
  }, [applyState]);

  const close = useCallback(() => {
    void withState(() => BrowserService.setVisible(false), applyState);
  }, [applyState]);

  const toggle = useCallback(() => {
    if (open) {
      close();
      return;
    }
    void (async () => {
      await withState(() => BrowserService.setVisible(true), applyState);
      if (toolTabsRef.current.length === 0 && prevWebIdsRef.current.size === 0) {
        await withState(() => BrowserService.createTab(), applyState);
      }
    })();
  }, [applyState, close, open]);

  const activateTab = useCallback(
    async (id: string) => {
      setActiveId(id);
      const isTool = toolTabsRef.current.some((tab) => tab.id === id);
      if (!isTool) {
        await withState(() => BrowserService.activateTab(id), applyState);
      }
    },
    [applyState],
  );

  const closeTab = useCallback(
    async (id: string) => {
      const order = tabOrderRef.current;
      const nextId = neighborId(order, id);
      const isTool = toolTabsRef.current.some((tab) => tab.id === id);
      if (isTool) {
        const nextTools = toolTabsRef.current.filter((tab) => tab.id !== id);
        setToolTabs(nextTools);
        setTabOrder((prev) => prev.filter((item) => item !== id));
        if (nextId) {
          setActiveId(nextId);
          if (!nextTools.some((tab) => tab.id === nextId)) {
            await withState(() => BrowserService.activateTab(nextId), applyState);
          }
        } else {
          setActiveId(null);
        }
        if (nextTools.length === 0 && prevWebIdsRef.current.size === 0) {
          await ensureOpen();
          await withState(() => BrowserService.createTab(), applyState);
        }
        return;
      }
      if (nextId) {
        setActiveId(nextId);
        if (!toolTabsRef.current.some((tab) => tab.id === nextId)) {
          await withState(() => BrowserService.activateTab(nextId), applyState);
        }
      }
      await withState(() => BrowserService.closeTab(id), applyState);
      if (toolTabsRef.current.length === 0 && prevWebIdsRef.current.size === 0) {
        await ensureOpen();
        await withState(() => BrowserService.createTab(), applyState);
      }
    },
    [applyState, ensureOpen],
  );

  const openToolTab = useCallback(
    async (input: TabInput) => {
      const id = input.messageId;
      setToolTabs((prev) => {
        const existing = prev.find((tab) => tab.id === id);
        if (existing) {
          return prev.map((tab) =>
            tab.id === id
              ? { ...tab, title: input.title, payload: input.payload, workspaceKey: input.workspaceKey }
              : tab,
          );
        }
        return [
          ...prev,
          {
            kind: 'tool',
            id,
            conversationId: input.conversationId,
            messageId: input.messageId,
            workspaceKey: input.workspaceKey,
            title: input.title,
            payload: input.payload,
          },
        ];
      });
      setTabOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setActiveId(id);
      await ensureOpen();
    },
    [ensureOpen],
  );

  const requestFollowUp = useCallback(
    (conversationId: string, text: string) => {
      setPendingFollowUp({ conversationId, text });
      navigate(`/ai?conversationId=${encodeURIComponent(conversationId)}`);
    },
    [navigate],
  );

  const clearFollowUp = useCallback(() => {
    setPendingFollowUp(null);
  }, []);

  const navigateUrl = useCallback(
    async (url: string) => {
      const tabId = activeId && !toolTabsRef.current.some((tab) => tab.id === activeId) ? activeId : null;
      if (!tabId) return;
      if (!normalizeBrowserUrl(url)) {
        message.warning('不是有效网址');
        return;
      }
      await withState(() => BrowserService.navigate(tabId, url), applyState);
    },
    [activeId, applyState],
  );

  const goBack = useCallback(async () => {
    const tabId = activeId && !toolTabsRef.current.some((tab) => tab.id === activeId) ? activeId : null;
    if (!tabId) return;
    await withState(() => BrowserService.goBack(tabId), applyState);
  }, [activeId, applyState]);

  const goForward = useCallback(async () => {
    const tabId = activeId && !toolTabsRef.current.some((tab) => tab.id === activeId) ? activeId : null;
    if (!tabId) return;
    await withState(() => BrowserService.goForward(tabId), applyState);
  }, [activeId, applyState]);

  const reload = useCallback(async () => {
    const tabId = activeId && !toolTabsRef.current.some((tab) => tab.id === activeId) ? activeId : null;
    if (!tabId) return;
    await withState(() => BrowserService.reload(tabId), applyState);
  }, [activeId, applyState]);

  const extractActiveTab = useCallback(async () => {
    const tabId = activeId && !toolTabsRef.current.some((tab) => tab.id === activeId) ? activeId : null;
    if (!tabId) return undefined;
    try {
      const result = await BrowserService.extractTab(tabId);
      if (result.status === 'blocked' || result.status === 'empty') {
        message.warning(result.reason || '未能拉取正文');
        return result;
      }
      if (extractHandler) {
        const url = state.tabs.find((tab) => tab.id === tabId)?.url || '';
        await extractHandler({ result, url });
      } else if (result.markdownPath) {
        message.success('已拉取正文');
      } else {
        message.success('已拉取正文');
      }
      return result;
    } catch (error) {
      message.error(error instanceof Error ? error.message : '拉取失败');
      return undefined;
    }
  }, [activeId, extractHandler, state.tabs]);

  const reportBounds = useCallback((bounds: BrowserBoundsVo) => {
    pendingBounds.current = bounds;
    if (boundsRaf.current != null) return;
    boundsRaf.current = window.requestAnimationFrame(() => {
      boundsRaf.current = null;
      const next = pendingBounds.current;
      if (!next) return;
      void BrowserService.setBounds(next);
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;
      const key = event.key.toLowerCase();
      if (key === 't') {
        event.preventDefault();
        void createTab();
      } else if (key === 'w') {
        event.preventDefault();
        if (activeId) void closeTab(activeId);
      } else if (key === 'l') {
        const isTool = toolTabsRef.current.some((tab) => tab.id === activeId);
        if (isTool) return;
        event.preventDefault();
        const handle = addressInputRef.current;
        const input = handle?.input ?? handle?.nativeElement ?? handle;
        input?.focus();
        input?.select?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId, closeTab, createTab, open]);

  useEffect(
    () => () => {
      if (boundsRaf.current != null) window.cancelAnimationFrame(boundsRaf.current);
      void BrowserService.setVisible(false).catch(() => undefined);
      void BrowserService.setBounds(EMPTY_BOUNDS).catch(() => undefined);
    },
    [],
  );

  const tabs = useMemo<WorkbenchTab[]>(() => {
    const next: WorkbenchTab[] = [];
    for (const id of tabOrder) {
      const tool = toolTabs.find((tab) => tab.id === id);
      if (tool) {
        next.push(tool);
        continue;
      }
      const web = state.tabs.find((tab) => tab.id === id);
      if (web) {
        next.push({ kind: 'web', id: web.id, title: web.title, loading: web.loading });
      }
    }
    return next;
  }, [state.tabs, tabOrder, toolTabs]);

  const activeTab = tabs.find((tab) => tab.id === activeId);
  const activeWebTab =
    activeTab?.kind === 'web' ? state.tabs.find((tab) => tab.id === activeTab.id) : undefined;

  const value = useMemo<WorkbenchContextValue>(
    () => ({
      open,
      width,
      state,
      tabs,
      activeTabId: activeId,
      activeTab,
      activeWebTab,
      addressInputRef,
      pendingFollowUp,
      toggle,
      close,
      setWidth,
      setLeftReserve,
      createTab,
      closeTab,
      activateTab,
      openToolTab,
      requestFollowUp,
      clearFollowUp,
      navigate: navigateUrl,
      goBack,
      goForward,
      reload,
      extractActiveTab,
      reportBounds,
      tools,
      workspaceHost,
    }),
    [
      activateTab,
      activeId,
      activeTab,
      activeWebTab,
      clearFollowUp,
      close,
      closeTab,
      createTab,
      extractActiveTab,
      goBack,
      goForward,
      navigateUrl,
      open,
      openToolTab,
      pendingFollowUp,
      reload,
      reportBounds,
      requestFollowUp,
      setLeftReserve,
      setWidth,
      state,
      tabs,
      toggle,
      tools,
      width,
      workspaceHost,
    ],
  );

  const hostActions = useHostActions();

  useEffect(() => {
    const offWorkbench = hostActions.register(HOST_WORKBENCH_OPEN, (input) => {
      if (input === false) close();
      else if (!open) toggle();
    });
    const offBrowser = hostActions.register(HOST_BROWSER_OPEN, async (input) => {
      const url = typeof input === 'string' ? input : (input as { url?: string } | undefined)?.url;
      await BrowserService.setVisible(true);
      if (url) await BrowserService.createTab(url);
    });
    return () => {
      offWorkbench();
      offBrowser();
    };
  }, [close, hostActions, open, toggle]);

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
}
