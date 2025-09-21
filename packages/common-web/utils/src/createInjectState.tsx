import { createContext, useContext } from 'react';

export function createInjectState<
  T extends {
    PropsType?: Record<string, unknown>;
    ContextType: Record<string, unknown>;
  },
>(
  initializer: (props: T['PropsType']) => T['ContextType']
): [React.FC<React.PropsWithChildren<T['PropsType']>>, () => T['ContextType']] {
  const Context = createContext<T['ContextType'] | null>(null);

  const Provider = ({ children, ...props }: React.PropsWithChildren<T['PropsType']>) => {
    const contextValue = initializer(props as T['PropsType']);
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
  };

  const useInjectState = () => {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useInjectState must be used within its Provider');
    }
    return context;
  };

  return [Provider, useInjectState];
}
