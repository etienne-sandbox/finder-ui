import * as Ariakit from "@ariakit/react";
import { forwardRef, useCallback } from "react";
import { cn } from "./utils/styles";

export function Finder() {
  const store1 = Ariakit.useCompositeStore({
    orientation: "vertical",
  });
  const store2 = Ariakit.useCompositeStore({
    orientation: "vertical",
  });

  const onNext1 = useCallback(() => {
    const activeId = store2.getState().activeId ?? store2.first();
    const state = store2.getState();
    const item = state.items.find((i) => i.id === activeId);
    if (!item) {
      return;
    }
    item.element?.focus();
  }, [store2]);

  const onPrevious2 = useCallback(() => {
    const activeId = store1.getState().activeId ?? store1.first();
    const item = store1.getState().items.find((i) => i.id === activeId);
    if (!item) {
      return;
    }
    item.element?.focus();
    store2.setActiveId(null);
  }, [store1, store2]);

  return (
    <div className="flex flex-row gap-2">
      <List
        store={store1}
        onNext={onNext1}
        onFocus={() => {
          store2.setActiveId(null);
        }}
      >
        <Item compositeId="item-1" title="Item 1.1" />
        <Item compositeId="item-2" title="Item 1.2" />
        <Item compositeId="item-3" title="Item 1.3" />
      </List>
      <List store={store2} onPrevious={onPrevious2}>
        <Item compositeId="item-1" title="Item 2.1" />
        <Item compositeId="item-2" title="Item 2.2" />
        <Item compositeId="item-3" title="Item 2.3" />
      </List>
    </div>
  );
}

interface ListProps extends React.ComponentPropsWithoutRef<"div"> {
  store: Ariakit.CompositeStore;
  onNext?: () => void;
  onPrevious?: () => void;
}

function List({
  store,
  children,
  onNext,
  onPrevious,
  className,
  ...rest
}: ListProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      console.log(event.key, { onNext, onPrevious });
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
    },
    [onNext, onPrevious]
  );

  return (
    <Ariakit.CompositeProvider store={store}>
      <Ariakit.Composite
        {...rest}
        className={cn("flex flex-col flex-1", className)}
        onKeyDown={handleKeyDown}
      >
        {children}
      </Ariakit.Composite>
    </Ariakit.CompositeProvider>
  );
}

interface ItempProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  compositeId: string;
  title: string;
}

const Item = forwardRef(function Item(
  { compositeId, title, ...props }: ItempProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const store = Ariakit.useCompositeContext();
  if (!store) {
    throw new Error("CompositeItem must be wrapped in CompositeProvider");
  }
  const activeId = Ariakit.useStoreState(store, "activeId");

  return (
    <Ariakit.CompositeItem
      id={compositeId}
      clickOnEnter
      clickOnSpace
      className={cn(
        "text-white",
        activeId === compositeId
          ? "bg-blue-600 data-active-item:bg-blue-800"
          : "data-active-item:bg-blue-400"
      )}
      ref={ref}
      {...props}
    >
      {title}
    </Ariakit.CompositeItem>
  );
});
