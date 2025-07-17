import { useCallback } from 'react';
import { useGlobalContext } from '../GlobalContext';

/**
 * 封装 Global 相关的操作，提供便捷的 API
 */
export const useGlobalActions = () => {
  const globalContext = useGlobalContext();

  // 主题相关
  const setTheme = useCallback((themeIndex: number) => {
    globalContext.setTheme(themeIndex);
  }, [globalContext]);

  const getCurrentTheme = useCallback(() => {
    const { theme_list, theme_index } = globalContext.globalState;
    return theme_list[theme_index] || theme_list[0];
  }, [globalContext.globalState]);

  // 标题相关
  const setTitle = useCallback((title: string) => {
    globalContext.setTitle(title);
  }, [globalContext]);

  // 缩放相关
  const zoomIn = useCallback(() => {
    globalContext.zoomIn();
  }, [globalContext]);

  const zoomOut = useCallback(() => {
    globalContext.zoomOut();
  }, [globalContext]);

  const resetZoom = useCallback(() => {
    globalContext.resetZoom();
  }, [globalContext]);

  const setZoom = useCallback((zoom: number) => {
    globalContext.setZoom(zoom);
  }, [globalContext]);

  // 位置相关
  const moveBy = useCallback((deltaX: number, deltaY: number) => {
    globalContext.moveBy(deltaX, deltaY);
  }, [globalContext]);

  const setPosition = useCallback((x: number, y: number) => {
    globalContext.setPosition(x, y);
  }, [globalContext]);

  const resetPosition = useCallback(() => {
    globalContext.resetPosition();
  }, [globalContext]);

  const resetMove = useCallback(() => {
    globalContext.resetMove();
  }, [globalContext]);

  // 组合操作
  const resetView = useCallback(() => {
    globalContext.resetZoom();
    globalContext.resetPosition();
  }, [globalContext]);

  return {
    globalState: globalContext.globalState,
    // 主题
    setTheme,
    getCurrentTheme,
    // 标题
    setTitle,
    // 缩放
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    // 位置
    moveBy,
    setPosition,
    resetPosition,
    resetMove,
    // 组合操作
    resetView
  };
};