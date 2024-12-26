import * as Ariakit from "@ariakit/react";
import { useCallback } from "react";
import { cn } from "../utils/styles";

interface PanelListProps extends React.ComponentPropsWithoutRef<"div"> {
  store: Ariakit.CompositeStore;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function PanelList({ store, children, onNext, onPrevious, className, ...rest }: PanelListProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft" && onPrevious) {
        event.preventDefault();
        onPrevious();
        return;
      }
      if (event.key === "ArrowRight" && onNext) {
        event.preventDefault();
        onNext();
        return;
      }
      if (event.key === "Enter" && onNext) {
        event.preventDefault();
        onNext();
        return;
      }
      if (event.key === "ArrowDown" && store.getState().activeId === null) {
        store.first();
        return;
      }
      if (event.key === "ArrowUp" && store.getState().activeId === null) {
        store.last();
        return;
      }
    },
    [onNext, onPrevious, store]
  );

  return (
    <Ariakit.CompositeProvider store={store}>
      <Ariakit.Composite
        {...rest}
        className={cn("flex flex-col flex-1 overflow-y-auto p-2", "data-focus-visible:ring-2 ring-blue-500", className)}
        onKeyDown={handleKeyDown}
      >
        {children}
        <div
          className="flex-1 h-6 min-w-6 shrink-0"
          onClick={() => {
            store.setActiveId(null);
            setTimeout(() => {
              store.getState().baseElement?.focus();
            }, 0);
          }}
        />
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}
