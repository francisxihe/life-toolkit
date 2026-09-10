import { createContext } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

export const GlobalContext = createContext<{
  lang?: string;
  setLang?: (value: string) => void;
  theme?: string;
  themePreference?: ThemePreference;
  setThemePreference?: (value: ThemePreference) => void;
}>({});
