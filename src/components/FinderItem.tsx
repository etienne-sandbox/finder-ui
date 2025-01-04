import * as Ariakit from "@ariakit/react";
import { useAtomValue } from "jotai";
import { forwardRef } from "react";
import { usePanelOrFail } from "../stores/finderStore";
import { cn } from "../utils/styles";

interface FinderItemProps extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  compositeId: string;
  selectedId: string | null;
  title: string;
}

export const FinderItem = forwardRef(function Item(
  { compositeId, title, selectedId, ...props }: FinderItemProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  const { $isActive } = usePanelOrFail();

  const selected = selectedId === compositeId;
  const isPanelActive = useAtomValue($isActive);

  return (
    <Ariakit.CompositeItem
      id={compositeId}
      clickOnEnter
      clickOnSpace
      className={cn(
        "text-white py-2 rounded outline-none",
        "ring-blue-500 data-focus-visible:ring-2",
        "hover:bg-neutral-900/50",
        selected &&
          (isPanelActive
            ? "bg-blue-700 data-active-item:bg-blue-700 hover:bg-blue-600"
            : "bg-neutral-700 data-active-item:bg-neutral-700 hover:bg-neutral-600"),
        "py-6"
      )}
      ref={ref}
      {...props}
    >
      {title}
    </Ariakit.CompositeItem>
  );
});
