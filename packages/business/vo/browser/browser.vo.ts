export const BROWSER_STATE_CHANNEL = 'browser.state';
export const EMBEDDED_BROWSER_PARTITION = 'persist:embedded-browser';
export const NEW_TAB_TITLE = '新标签页';

export type BrowserTabVo = {
  id: string;
  title: string;
  url: string;
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
};

export type BrowserStateVo = {
  visible: boolean;
  activeTabId: string | null;
  tabs: BrowserTabVo[];
};

export type BrowserNavigateRequestVo = {
  tabId: string;
  url: string;
};

export type BrowserBoundsVo = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type BrowserVisibleRequestVo = {
  visible: boolean;
};

export type BrowserActivateTabRequestVo = {
  tabId: string;
};

export type BrowserExtractStatus = 'ok' | 'blocked' | 'empty' | 'partial';

export type BrowserExtractResultVo = {
  status: BrowserExtractStatus;
  title: string | null;
  markdownPath: string | null;
  articleDir: string | null;
  reason?: string;
};
