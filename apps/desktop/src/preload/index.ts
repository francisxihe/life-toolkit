// 导入模块
const { contextBridge, ipcRenderer } = require('electron');
import type { ElectronAPI } from '@true-north/web-service/electron-types';
import { inspectorChannel } from '@ylib/product-server/inspector/protocol';

// 检查当前环境是否为Electron
const isElectron = () => {
  // 确认全局window对象存在
  if (typeof window === 'undefined') return false;

  // 检查process对象是否存在且类型为object
  if (typeof process !== 'object') return false;

  // 尝试访问process.versions.electron，如果存在说明在Electron环境中
  return Object.prototype.hasOwnProperty.call(process, 'versions') && !!process.versions && !!process.versions.electron;
};

console.log('============预加载脚本初始化');

// 暴露API函数
const exposeAPI = () => {
  if (isElectron()) {
    console.log('============在Electron环境中运行');
    contextBridge.exposeInMainWorld('electronAPI', {
      getAppInfo: () => ipcRenderer.invoke('get-app-info'),
      loadURL: (url: string) => ipcRenderer.invoke('load-url', url),
      setNativeThemeSource: (source: 'system' | 'light' | 'dark') =>
        ipcRenderer.invoke('set-native-theme-source', source),
      isElectron: true,

      get: (path: string, params: any) => ipcRenderer.invoke('REST', { method: 'GET', path, payload: params }),
      post: (path: string, params: any) =>
        ipcRenderer.invoke('REST', {
          method: 'POST',
          path,
          payload: params,
        }),
      put: (path: string, params: any) => ipcRenderer.invoke('REST', { method: 'PUT', path, payload: params }),
      remove: (path: string, params: any) =>
        ipcRenderer.invoke('REST', {
          method: 'DELETE',
          path,
          payload: params,
        }),

      // 文件操作相关 API
      readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),

      // 事件监听相关 API
      on: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.on(channel, listener);
      },
      removeListener: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, listener);
      },
    } as ElectronAPI);

    if (process.env.NODE_ENV === 'development') {
      let splitterCapturing = false;
      ipcRenderer.on(inspectorChannel.splitterCapturing, (_event, on) => {
        splitterCapturing = Boolean(on);
      });
      window.addEventListener('mousemove', (event) => {
        if (splitterCapturing) ipcRenderer.send(inspectorChannel.splitterDragMove, event.screenX);
      });
      window.addEventListener('mouseup', (event) => {
        if (splitterCapturing) ipcRenderer.send(inspectorChannel.splitterDragEnd, event.screenX);
      });
      contextBridge.exposeInMainWorld('productWikiInspectorBridge', {
        sendSelection: (payload) => ipcRenderer.send(inspectorChannel.selection, payload),
        sendCancel: () => ipcRenderer.send(inspectorChannel.cancel),
        sendPageContext: (payload) => ipcRenderer.send(inspectorChannel.pageContext, payload),
        onSetSelecting: (listener) => {
          const handler = (_event, selecting) => listener(selecting);
          ipcRenderer.on(inspectorChannel.setSelecting, handler);
          return () => ipcRenderer.removeListener(inspectorChannel.setSelecting, handler);
        },
        onSetHighlightVisible: (listener) => {
          const handler = (_event, visible) => listener(Boolean(visible));
          ipcRenderer.on(inspectorChannel.setHighlightVisible, handler);
          return () => ipcRenderer.removeListener(inspectorChannel.setHighlightVisible, handler);
        },
        onCancel: (listener) => {
          const handler = () => listener();
          ipcRenderer.on(inspectorChannel.cancel, handler);
          return () => ipcRenderer.removeListener(inspectorChannel.cancel, handler);
        },
        onRequestPageContext: (listener) => {
          const handler = () => listener();
          ipcRenderer.on(inspectorChannel.requestPageContext, handler);
          return () => ipcRenderer.removeListener(inspectorChannel.requestPageContext, handler);
        },
      });
      contextBridge.exposeInMainWorld('productWikiInspectorPanel', {
        sendSetSelecting: (selecting) => ipcRenderer.send(inspectorChannel.setSelecting, selecting),
        sendSetHighlightVisible: (visible) => ipcRenderer.send(inspectorChannel.setHighlightVisible, visible),
        sendCancel: () => ipcRenderer.send(inspectorChannel.cancel),
        sendSetVisible: (visible) => ipcRenderer.send(inspectorChannel.setVisible, visible),
        sendRequestPageContext: () => ipcRenderer.send(inspectorChannel.requestPageContext),
        sendSplitterDragStart: (edge, screenX) =>
          ipcRenderer.send(inspectorChannel.splitterDragStart, { edge, screenX }),
        sendSplitterDragMove: (screenX) => ipcRenderer.send(inspectorChannel.splitterDragMove, screenX),
        sendSplitterDragEnd: (screenX) => ipcRenderer.send(inspectorChannel.splitterDragEnd, screenX),
        onSelection: (listener) => {
          const handler = (_event, payload) => listener(payload);
          ipcRenderer.on(inspectorChannel.selection, handler);
          return () => ipcRenderer.removeListener(inspectorChannel.selection, handler);
        },
        onPageContext: (listener) => {
          const handler = (_event, payload) => listener(payload);
          ipcRenderer.on(inspectorChannel.pageContext, handler);
          return () => ipcRenderer.removeListener(inspectorChannel.pageContext, handler);
        },
        onCancel: (listener) => {
          const handler = () => listener();
          ipcRenderer.on(inspectorChannel.cancel, handler);
          return () => ipcRenderer.removeListener(inspectorChannel.cancel, handler);
        },
        onSplitterDragEnd: (listener) => {
          const handler = () => listener();
          ipcRenderer.on(inspectorChannel.splitterDragEnd, handler);
          return () => ipcRenderer.removeListener(inspectorChannel.splitterDragEnd, handler);
        },
      });
      contextBridge.exposeInMainWorld('labPanel', {
        snapshot: () => ipcRenderer.invoke('lab:snapshot'),
        clear: () => ipcRenderer.invoke('lab:clear'),
        sendSetVisible: (visible) => ipcRenderer.send('lab:set-visible', visible),
        onUpdate: (listener) => {
          const handler = (_event, entries) => listener(entries);
          ipcRenderer.on('lab:update', handler);
          return () => ipcRenderer.removeListener('lab:update', handler);
        },
      });
    }
  } else {
    console.log('============在Web环境中运行');
    if (typeof window !== 'undefined') {
      (window as any).electronAPI = {
        getAppInfo: () => Promise.resolve({ version: 'web', platform: 'browser' }),
        readFile: () =>
          Promise.resolve({
            success: false,
            message: '在Web环境中不支持文件系统操作',
          }),
        setNativeThemeSource: async () => undefined,
        on: () => false,
        removeListener: () => false,
        isElectron: false,
      };
    }
  }
};

// 立即执行暴露API
exposeAPI();
