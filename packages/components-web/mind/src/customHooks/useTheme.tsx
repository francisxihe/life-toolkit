import { useContext, useMemo } from 'react';
import { context } from '../context';

interface Theme {
  line_color: string;
  background_color: string;
  text_color: string;
  node_color: string;
  node_border_color: string;
}

const theme_list: Theme[] = [
  {
    line_color: '#333333',
    background_color: '#ffffff',
    text_color: '#333333',
    node_color: '#ffffff',
    node_border_color: '#333333',
  },
  {
    line_color: '#ffffff',
    background_color: '#333333',
    text_color: '#ffffff',
    node_color: '#333333',
    node_border_color: '#ffffff',
  },
];

interface GlobalState {
  zoom: number;
  x: number;
  y: number;
  title: string;
  theme_index: number;
  theme_list: Array<{ main: string; light: string; dark: string; ex: string; assist: string }>;
}

interface GlobalContext {
  state: GlobalState;
  dispatch: (action: { type: string; data: any }) => void;
}

const useTheme = () => {
  const {
    global: { state, dispatch },
  } = useContext(context);

  const gState = state as GlobalState;

  const theme = useMemo(() => {
    return theme_list[gState.theme_index || 0];
  }, [gState.theme_index]);

  const setTheme = (index: number) => {
    dispatch({ type: 'SET_THEME', data: { theme_index: index } });
  };

  return {
    theme,
    theme_index: gState.theme_index || 0,
    theme_list,
    setTheme,
  };
};

export default useTheme;
