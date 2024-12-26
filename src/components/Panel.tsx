import { useRef } from "react";
import { Fragment } from "react/jsx-runtime";
import { useResizablePanel } from "../hooks/useResizablePanel";
import { cn } from "../utils/styles";
import { DragHandle } from "./DragHandle";

interface PanelProps {
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
}

export function Panel({ children, minWidth = 0, maxWidth = Infinity, initialWidth = 300, className }: PanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  const resizer = useResizablePanel(panelRef, {
    direction: "left",
    initialSize: initialWidth,
    maxSize: maxWidth,
    minSize: minWidth,
  });

  return (
    <Fragment>
      <div
        style={{ ["--panel-dynamic-width" as string]: resizer.dynamicSize }}
        className={cn("w-screen shrink-0 md:w-[var(--panel-dynamic-width)] snap-center", className)}
        ref={panelRef}
      >
        {children}
      </div>
      <DragHandle
        direction="vertical"
        onMouseDown={resizer.onMouseDown}
        active={resizer.active}
        onDoubleClick={resizer.reset}
        className="hidden md:block"
      />
    </Fragment>
  );
}
