/**
 * GlobalContext - 全局状态管理上下文
 * 
 * 该模块提供了思维导图全局状态的管理功能，包括：
 * - 缩放控制
 * - 位置控制
 * - 标题管理
 * - 主题管理
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { GlobalState } from '../types';

// 常量定义
const ZOOM_STEP = 0.1;  // 缩放步长
const MIN_ZOOM = 0.3;   // 最小缩放比例

/**
 * 获取默认全局状态
 */
const getDefaultGlobalState = (): GlobalState => ({
  zoom: 1,                                                   // 缩放比例
  x: 0,                                                      // X轴位置
  y: 0,                                                      // Y轴位置
  title: localStorage.getItem('title') || 'Mindmap',         // 思维导图标题
  theme_index: Number(localStorage.getItem('theme_index')) || 0, // 主题索引
  theme_list: [                                              // 主题列表
    { main: '#2f54eb', light: '#f0f5ff', dark: '#061178', ex: '#597ef7', assist: '#85a5ff' },
  ],
});

/**
 * GlobalContext 类型定义
 * 包含全局状态和操作方法
 */
interface GlobalContextType {
  globalState: GlobalState;                    // 全局状态
  setTitle: (title: string) => void;           // 设置标题
  setTheme: (themeIndex: number) => void;      // 设置主题
  setPosition: (x: number, y: number) => void; // 设置位置
  setZoom: (zoom: number) => void;             // 设置缩放比例
  resetPosition: () => void;                   // 重置位置
  resetZoom: () => void;                       // 重置缩放
  zoomIn: () => void;                          // 放大
  zoomOut: () => void;                         // 缩小
  moveBy: (deltaX: number, deltaY: number) => void; // 移动
  resetMove: () => void;                       // 重置移动
}

// 创建 Context
const GlobalContext = createContext<GlobalContextType | null>(null);

/**
 * GlobalProvider 属性类型
 */
interface GlobalProviderProps {
  children: ReactNode;
  initialValue?: GlobalState;  // 可选的初始全局状态
}

/**
 * GlobalProvider 组件
 * 提供全局状态和操作方法的上下文
 */
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ 
  children, 
  initialValue 
}) => {
  // 全局状态
  const [globalState, setGlobalState] = useState<GlobalState>(
    initialValue || getDefaultGlobalState()
  );

  /**
   * 设置思维导图标题
   * @param title 标题
   */
  const setTitle = useCallback((title: string) => {
    localStorage.setItem('title', title);
    setGlobalState(prev => ({ ...prev, title }));
  }, []);

  /**
   * 设置主题
   * @param themeIndex 主题索引
   */
  const setTheme = useCallback((themeIndex: number) => {
    localStorage.setItem('theme_index', themeIndex.toString());
    setGlobalState(prev => ({ ...prev, theme_index: themeIndex }));
  }, []);

  /**
   * 设置位置
   * @param x X轴位置
   * @param y Y轴位置
   */
  const setPosition = useCallback((x: number, y: number) => {
    setGlobalState(prev => ({ ...prev, x, y }));
  }, []);

  /**
   * 设置缩放比例
   * @param zoom 缩放比例
   */
  const setZoom = useCallback((zoom: number) => {
    // 确保缩放比例不小于最小值
    const clampedZoom = Math.max(zoom, MIN_ZOOM);
    setGlobalState(prev => ({ ...prev, zoom: clampedZoom }));
  }, []);

  /**
   * 重置位置到原点
   */
  const resetPosition = useCallback(() => {
    setGlobalState(prev => ({ ...prev, x: 0, y: 0 }));
  }, []);

  /**
   * 重置缩放比例到 1
   */
  const resetZoom = useCallback(() => {
    setGlobalState(prev => ({ ...prev, zoom: 1 }));
  }, []);

  /**
   * 放大
   */
  const zoomIn = useCallback(() => {
    setGlobalState(prev => ({ ...prev, zoom: prev.zoom + ZOOM_STEP }));
  }, []);

  /**
   * 缩小
   */
  const zoomOut = useCallback(() => {
    setGlobalState(prev => ({ 
      ...prev, 
      zoom: Math.max(prev.zoom - ZOOM_STEP, MIN_ZOOM) 
    }));
  }, []);

  /**
   * 移动视图
   * @param deltaX X轴移动距离
   * @param deltaY Y轴移动距离
   */
  const moveBy = useCallback((deltaX: number, deltaY: number) => {
    setGlobalState(prev => ({
      ...prev,
      // 根据当前缩放比例调整移动距离
      x: prev.x + deltaX / prev.zoom,
      y: prev.y + deltaY / prev.zoom
    }));
  }, []);

  /**
   * 重置移动到原点
   */
  const resetMove = useCallback(() => {
    setGlobalState(prev => ({ ...prev, x: 0, y: 0 }));
  }, []);

  // 组合所有方法和状态
  const value: GlobalContextType = {
    globalState,
    setTitle,
    setTheme,
    setPosition,
    setZoom,
    resetPosition,
    resetZoom,
    zoomIn,
    zoomOut,
    moveBy,
    resetMove
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

/**
 * 使用全局状态上下文的自定义Hook
 * @returns GlobalContextType 全局状态上下文
 * @throws 如果在 GlobalProvider 外部使用则抛出错误
 */
export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};