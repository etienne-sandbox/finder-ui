/* SYNCED FILE */
import { nanoid } from "nanoid";
import { OverlayScrollbars } from "overlayscrollbars";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "../../styles/utils";

import "overlayscrollbars/overlayscrollbars.css";

export type FinderProps = React.PropsWithChildren<{
  className?: string;
}>;

export function Finder({ children, className }: FinderProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const setScrollWidth = useCallback((val: number) => {
    const elem = parentRef.current;
    if (!elem) {
      return;
    }
    elem.style.setProperty("--finder-panel-max-width", `${val}px`);
  }, []);

  const [contentMinSizeVarName] = useState(
    () => `--resizable-panel-size-${nanoid()}`
  );

  const updateContentMinSize = useCallback(
    (instance: OverlayScrollbars) => {
      const element = instance.elements().scrollEventElement as HTMLDivElement;
      const elementWith = element.getBoundingClientRect().width;
      const visibleMax = elementWith + element.scrollLeft;
      element.style.setProperty(contentMinSizeVarName, `${visibleMax}px`);
    },
    [contentMinSizeVarName]
  );

  const onInitUpdate = useCallback(
    (instance: OverlayScrollbars) => {
      setScrollWidth(instance.state().overflowEdge.x);
      updateContentMinSize(instance);
    },
    [setScrollWidth, updateContentMinSize]
  );

  return (
    <OverlayScrollbarsComponent
      className={cn("bg-neutral-800", className)}
      events={{
        initialized: onInitUpdate,
        updated: onInitUpdate,
        scroll: updateContentMinSize,
      }}
      options={{ scrollbars: { autoHide: "scroll" } }}
    >
      <div
        ref={parentRef}
        style={{
          ["--scroll-content-min-width" as string]: `var(${contentMinSizeVarName})`,
        }}
        className="flex flex-row h-full min-w-[var(--scroll-content-min-width)]"
      >
        {children}
      </div>
    </OverlayScrollbarsComponent>
  );
}
