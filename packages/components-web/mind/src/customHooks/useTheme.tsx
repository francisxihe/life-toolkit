import { useContext } from 'react';
import { context } from '../context';
import * as globalAction from '../context/reducer/global/actionCreator';
import { Theme } from '../types';

interface ThemeHookReturn {
  theme: Theme;
  themeIndex: number;
  theme_index: number;
  theme_list: Theme[];
  setTheme: (index: number) => void;
  nextTheme: () => void;
  prevTheme: () => void;
}

const useTheme = (): ThemeHookReturn => {
  const {
    global: { state: gState, dispatch: gDispatch },
  } = useContext(context);

  const setTheme = (index: number) => {
    localStorage.setItem('theme_index', index.toString());
    gDispatch(globalAction.setTheme(index));
  };

  const nextTheme = () => {
    const nextIndex = (gState.theme_index + 1) % gState.theme_list.length;
    setTheme(nextIndex);
  };

  const prevTheme = () => {
    const prevIndex = gState.theme_index === 0 ? gState.theme_list.length - 1 : gState.theme_index - 1;
    setTheme(prevIndex);
  };

  return {
    theme: gState.theme_list[gState.theme_index],
    themeIndex: gState.theme_index,
    theme_index: gState.theme_index,
    theme_list: gState.theme_list,
    setTheme,
    nextTheme,
    prevTheme,
  };
};

export default useTheme;
