import { createContext, useContext } from 'react';

export function createInjectState<
  ContextType,
  PropsType extends Record<string, unknown> = Record<string, unknown>
>(
  initializer: (props: PropsType) => ContextType
): [React.FC<React.PropsWithChildren<PropsType>>, () => ContextType] {
  const Context = createContext<ContextType | null>(null);

  const Provider = ({
    children,
    ...props
  }: React.PropsWithChildren<PropsType>) => {
    const contextValue = initializer(props as PropsType);
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
