/* SYNCED FILE */
import { ComponentType, Fragment, PropsWithChildren, createContext, useContext, useMemo } from "react";

export interface TPropsContext<Props extends Record<string, any>> {
  Provider: ComponentType<PropsWithChildren<Partial<Props>>>;
  useProp<K extends keyof Props>(key: K): Props[K];
  useProps<P extends Partial<Props>>(directProps: P): P & Props;
}

export function createPropsContext<Props extends Record<string, any>>(
  name: string,
  defaultProps: Props,
): TPropsContext<Props> {
  const contexts = new Map<keyof Props, React.Context<Props[keyof Props]>>();

  const allKeys = Object.keys(defaultProps).sort();

  const Provider: ComponentType<PropsWithChildren<Partial<Props>>> = ({ children, ...props }) => {
    const overrideProps = Object.keys(props).filter((key) => allKeys.includes(key)) as (keyof Props)[];
    if (overrideProps.length === 0) {
      return <Fragment>{children}</Fragment>;
    }
    return overrideProps.reduce(
      (acc, key) => {
        const context = getContext(key);
        const value = (props as Props)[key];
        return <context.Provider value={value}>{acc}</context.Provider>;
      },
      <Fragment>{children}</Fragment>,
    );
  };
  Provider.displayName = `${name}Props.Provider`;

  return {
    Provider,
    useProp,
    useProps,
  };

  function getContext(key: keyof Props) {
    if (!contexts.has(key)) {
      const context = createContext<Props[keyof Props]>(defaultProps[key]);
      contexts.set(key, context);
    }
    return contexts.get(key)!;
  }

  function useProp<K extends keyof Props>(key: K): Props[K] {
    const context = useMemo(() => getContext(key), [key]);
    return useContext(context) as Props[K];
  }

  function useProps<P extends Partial<Props>>(directProps: P): P & Props {
    const contextProps = Object.fromEntries(
      allKeys.map((key) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const value = useContext(getContext(key));
        return [key, value];
      }),
    );
    const res = { ...contextProps } as any;
    for (const key in directProps) {
      if (directProps[key] !== undefined) {
        (res as any)[key] = directProps[key];
      }
    }
    return res;
  }
}
