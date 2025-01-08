import * as Ariakit from "@ariakit/react";
import { useCallback } from "react";
import { cn } from "../shared/styles/utils";

interface PanelListProps extends React.ComponentPropsWithoutRef<"div"> {
  store: Ariakit.CompositeStore;
  onDeselect?: () => void;
}

export function PanelList({ store, children, onDeselect, className, ...rest }: PanelListProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // if (event.key === "ArrowRight" && onNext) {
      //   event.preventDefault();
      //   onNext();
      //   return;
      // }
      // if (event.key === "ArrowLeft" && onPrevious) {
      //   event.preventDefault();
      //   onPrevious();
      //   return;
      // }
      // if (event.key === "Enter" && onNext) {
      //   event.preventDefault();
      //   onNext();
      //   return;
      // }
      if (event.key === "ArrowDown" && store.getState().activeId === null) {
        store.first();
        return;
      }
      if (event.key === "ArrowUp" && store.getState().activeId === null) {
        store.last();
        return;
      }
    },
    [store],
  );

  return (
    <Ariakit.SelectProvider store={store}>
      <Ariakit.Composite
        {...rest}
        className={cn("flex flex-col flex-1 p-2 outline-none", className)}
        onKeyDown={handleKeyDown}
        autoFocus
      >
        {children}
        <div
          className="flex-1 h-6 min-w-6 shrink-0"
          onClick={() => {
            store.setActiveId(null);
            onDeselect?.();
            setTimeout(() => {
              store.getState().baseElement?.focus();
            }, 0);
          }}
        />
      </Ariakit.Composite>
    </Ariakit.SelectProvider>
  );
}
