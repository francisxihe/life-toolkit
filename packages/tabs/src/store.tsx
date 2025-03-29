import React, { FC, createContext, PropsWithChildren, useContext, useReducer } from 'react';
import { TabsProps } from './';

export interface InitialState extends Pick<TabsProps, 'onTabClick' | 'onTabDrop'> {
  activeKey?: string;
  data?: Array<{
    id: string;
    children: React.ReactElement;
    element: HTMLElement;
  }>;
}

export const initialState: InitialState = {
  activeKey: '',
  data: [],
};

export const reducer = (state: Partial<InitialState>, action: Partial<InitialState>) => {
  return {
    ...state,
    ...action,
  };
};

export interface CreateContext {
  state: Partial<InitialState>;
  dispatch?: React.Dispatch<InitialState>;
}

export const Context = createContext<CreateContext>({
  state: initialState,
  dispatch: () => null,
});

export const Provider: FC<PropsWithChildren<{ init: InitialState }>> = ({ children, init }) => {
  const [state, dispatch] = useReducer(reducer, init || initialState);
  return <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>;
};

export function useDataContext() {
  const { state, dispatch } = useContext(Context);
  return { ...state, state, dispatch };
}
