// SYNCED FILE
import { ClickScrollPlugin, OverlayScrollbars } from "overlayscrollbars";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useMemo, useRef } from "react";
import scrollIntoView from "smooth-scroll-into-view-if-needed";
import { TUseResizeWidth, useResize } from "../../hooks/useResize";
import { cn } from "../../styles/utils";
import { onDoubleTap } from "../../utils/onDoubleTap";

import "overlayscrollbars/overlayscrollbars.css";
import "./panel-scrollbar.css";

OverlayScrollbars.plugin(ClickScrollPlugin);

const GUTTER_WIDTH = 11;
const MINI_HANDLE_HEIGHT = 20;

export interface FinderPanelProps extends React.ComponentPropsWithoutRef<"div"> {
  initialWidth?: TUseResizeWidth;
  className?: string;
  resizeLocalStorageKey?: string;
  isActive?: boolean;
}

export function FinderPanel({
  children,
  className,
  isActive = false,
  resizeLocalStorageKey,
  ...rest
}: FinderPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  const resizer = useResize(panelRef, {
    direction: "left",
    initialSize: "auto",
    localStorageKey: resizeLocalStorageKey,
  });

  useEffect(() => {
    const panelEl = panelRef.current;
    if (!isActive || !panelEl) {
      return;
    }
    scrollIntoView(panelEl);
    // When the app load we need to wait for the scrollbars to be initialized
    // This does nothing if the first scrollIntoView worked
    const timer = setTimeout(() => {
      scrollIntoView(panelEl);
    }, 10);
    return () => clearTimeout(timer);
  }, [isActive]);

  const onHandleClick = useMemo(() => onDoubleTap(resizer.reset), [resizer.reset]);

  return (
    <div
      ref={panelRef}
      className={cn("shrink-0 relative max-w-[var(--finder-panel-max-width)]", className)}
      style={{
        width: resizer.dynamicSize,
        ["--gutter-width" as string]: `${GUTTER_WIDTH}px`,
        ["--mini-handle-height" as string]: `${MINI_HANDLE_HEIGHT}px`,
      }}
      {...rest}
    >
      <OverlayScrollbarsComponent
        defer
        className={cn("h-full w-full")}
        style={{ paddingRight: GUTTER_WIDTH }}
        options={{
          scrollbars: {
            theme: "os-theme-dark os-panel-theme",
            // autoHide: "scroll",
            clickScroll: true,
          },
          overflow: { x: "scroll", y: "scroll" },
        }}
      >
        {children}
      </OverlayScrollbarsComponent>
      <div className="absolute inset-y-0 right-0 w-[var(--gutter-width)] pointer-events-none bg-neutral-900 z-10" />
      <MiniHandle
        onPointerDown={resizer.onPointerDown}
        className="top-0 right-0 z-10"
        style={{ width: GUTTER_WIDTH, height: MINI_HANDLE_HEIGHT }}
        onClick={onHandleClick}
      />
      <MiniHandle
        onPointerDown={resizer.onPointerDown}
        className="bottom-0 right-0 z-10"
        style={{ width: GUTTER_WIDTH, height: MINI_HANDLE_HEIGHT }}
        onClick={onHandleClick}
      />
    </div>
  );
}

function MiniHandle({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "absolute flex justify-center items-center gap-[3px] p-0.5 cursor-col-resize touch-none",
        "before:content-[''] before:absolute before:-left-1 before:top-0 before:bottom-0 before:right-0",
        className
      )}
      {...rest}
    >
      <div className="w-px bg-neutral-600 rounded-full h-2" />
      <div className="w-px bg-neutral-600 rounded-full h-2" />
    </div>
  );
}
