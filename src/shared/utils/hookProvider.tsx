// SYNCED FILE
import {
  ComponentType,
  ReactNode,
  createContext,
  memo,
  useContext,
} from "react";

export type TProviderProps<Data, Props> = Props & {
  children: undefined | ReactNode | ((data: Data) => ReactNode);
};

export interface THookProviderResult<Data, Props> {
  useMaybe(): Data | null;
  useOrFail(): Data;
  Provider: ComponentType<TProviderProps<Data, Props>>;
}

export function createHookProvider<Data, Props>(
  name: string,
  useLogic: (props: Props) => Data
): THookProviderResult<Data, Props> {
  const context = createContext<Data | null>(null);

  const Provider: ComponentType<TProviderProps<Data, Props>> = memo(
    function Provider({ children, ...props }) {
      const data = useLogic(props as Props);
      return (
        <context.Provider value={data}>
          {typeof children === "function" ? children(data) : children}
        </context.Provider>
      );
    }
  );

  function useMaybe(): Data | null {
    return useContext(context);
  }

  function useOrFail(): Data {
    const data = useContext(context);
    if (data === null) {
      throw new Error(`Missing ${name} provider`);
    }
    return data;
  }

  return {
    useMaybe,
    useOrFail,
    Provider,
  };
}
