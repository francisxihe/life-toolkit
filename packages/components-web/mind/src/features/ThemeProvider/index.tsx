import React from 'react';
import { css } from '@emotion/css';
import { useGlobalActions } from '../../context';
import * as refer from '../../statics/refer';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { getCurrentTheme } = useGlobalActions();
  const theme = getCurrentTheme();

  return (
    <div
      className={css`
        ${refer.THEME_MAIN}: ${theme.main};
        ${refer.THEME_LIGHT}: ${theme.light};
        ${refer.THEME_ASSIST}: ${theme.assist};
        ${refer.THEME_DARK}: ${theme.dark};
        ${refer.THEME_EX}: ${theme.ex};
      `}
    >
      {children}
    </div>
  );
};

export default ThemeProvider;
