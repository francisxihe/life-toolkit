import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { GlobalState } from '../types';

const ZOOM_STEP = 0.1;
const MIN_ZOOM = 0.3;

const getDefaultGlobalState = (): GlobalState => ({
  zoom: 1,
  x: 0,
  y: 0,
  title: localStorage.getItem('title') || 'Mindmap',
  theme_index: Number(localStorage.getItem('theme_index')) || 0,
  theme_list: [
    { main: '#2f54eb', light: '#f0f5ff', dark: '#061178', ex: '#597ef7', assist: '#85a5ff' },
  ],
});

interface GlobalContextType {
  globalState: GlobalState;
  setTitle: (title: string) => void;
  setTheme: (themeIndex: number) => void;
  setPosition: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
  resetPosition: () => void;
  resetZoom: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  moveBy: (deltaX: number, deltaY: number) => void;
  resetMove: () => void;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

interface GlobalProviderProps {
  children: ReactNode;
  initialValue?: GlobalState;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ 
  children, 
  initialValue 
}) => {
  const [globalState, setGlobalState] = useState<GlobalState>(
    initialValue || getDefaultGlobalState()
  );

  const setTitle = useCallback((title: string) => {
    localStorage.setItem('title', title);
    setGlobalState(prev => ({ ...prev, title }));
  }, []);

  const setTheme = useCallback((themeIndex: number) => {
    localStorage.setItem('theme_index', themeIndex.toString());
    setGlobalState(prev => ({ ...prev, theme_index: themeIndex }));
  }, []);

  const setPosition = useCallback((x: number, y: number) => {
    setGlobalState(prev => ({ ...prev, x, y }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    const clampedZoom = Math.max(zoom, MIN_ZOOM);
    setGlobalState(prev => ({ ...prev, zoom: clampedZoom }));
  }, []);

  const resetPosition = useCallback(() => {
    setGlobalState(prev => ({ ...prev, x: 0, y: 0 }));
  }, []);

  const resetZoom = useCallback(() => {
    setGlobalState(prev => ({ ...prev, zoom: 1 }));
  }, []);

  const zoomIn = useCallback(() => {
    setGlobalState(prev => ({ ...prev, zoom: prev.zoom + ZOOM_STEP }));
  }, []);

  const zoomOut = useCallback(() => {
    setGlobalState(prev => ({ 
      ...prev, 
      zoom: Math.max(prev.zoom - ZOOM_STEP, MIN_ZOOM) 
    }));
  }, []);

  const moveBy = useCallback((deltaX: number, deltaY: number) => {
    setGlobalState(prev => ({
      ...prev,
      x: prev.x + deltaX / prev.zoom,
      y: prev.y + deltaY / prev.zoom
    }));
  }, []);

  const resetMove = useCallback(() => {
    setGlobalState(prev => ({ ...prev, x: 0, y: 0 }));
  }, []);

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

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};