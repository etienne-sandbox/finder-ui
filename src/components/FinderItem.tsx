import * as Ariakit from "@ariakit/react";
import { forwardRef } from "react";
import { cn } from "../utils/styles";

interface FinderItemProps extends Omit<React.ComponentPropsWithoutRef<"button">, "children"> {
  compositeId: string;
  title: string;
  selected?: boolean;
}

export const FinderItem = forwardRef(function Item(
  { compositeId, title, selected, ...props }: FinderItemProps,
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  return (
    <Ariakit.CompositeItem
      id={compositeId}
      clickOnEnter
      clickOnSpace
      className={cn(
        "text-white py-2 rounded",
        "data-active-item:bg-blue-700 outline-none",
        selected && "bg-neutral-700"
      )}
      ref={ref}
      {...props}
    >
      {title}
    </Ariakit.CompositeItem>
  );
});
