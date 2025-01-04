import { nanoid } from "nanoid";
import type { MutableRefObject } from "react";
import { useCallback, useMemo, useState } from "react";
import { flushSync } from "react-dom";

export type TResizeWidth = number | "auto";

export interface ResizablePanelConfig {
  direction: "left" | "right" | "top" | "bottom";
  /**
   * The initial size of the panel. If `auto`, the panel will not have an initial size.
   */
  initialSize: TResizeWidth;
  localStorageKey?: string;
}

interface PointerPos {
  x: number;
  y: number;
}

export interface ResizablePanelResult {
  /**
   * Current size of the panel, this is NOT updated during resizing for performance reasons.
   * Use the `dynamicSize` CSS variable instead
   */
  size: TResizeWidth;
  /**
   * The name of the CSS variable that will be updated during resizing.
   */
  dynamicSize: string | undefined;
  /**
   * The pointer down event handler to attach to the resize handle.
   */
  onPointerDown: (downEvent: React.PointerEvent<HTMLElement>) => void;
  /**
   * Whether the panel is currently being resized.
   */
  active: boolean;
  /**
   * Reset the panel size to its initial value.
   */
  reset: () => void;
}

const SIZE_DIFF = {
  left: (basePointer: PointerPos, newPointer: PointerPos) => newPointer.x - basePointer.x,
  right: (basePointer: PointerPos, newPointer: PointerPos) => basePointer.x - newPointer.x,
  top: (basePointer: PointerPos, newPointer: PointerPos) => newPointer.y - basePointer.y,
  bottom: (basePointer: PointerPos, newPointer: PointerPos) => basePointer.y - newPointer.y,
};

/**
 * Handle resizing logic for a panel.
 */
export function useResizablePanel(
  ref: MutableRefObject<HTMLDivElement | null>,
  { initialSize, direction, localStorageKey }: ResizablePanelConfig
): ResizablePanelResult {
  const [panelSize, setPanelSizeInternal] = useState<TResizeWidth>(() => {
    if (!localStorageKey) {
      return initialSize;
    }
    const restoredSize = parseSize(localStorage.getItem(localStorageKey)) ?? initialSize;
    localStorage.setItem(localStorageKey, serializeSize(restoredSize));
    return restoredSize;
  });

  const setPanelSize = useCallback(
    (size: number | "auto") => {
      setPanelSizeInternal(size);
      if (localStorageKey) {
        localStorage.setItem(localStorageKey, serializeSize(size));
      }
    },
    [localStorageKey]
  );

  const [active, setActive] = useState<boolean>(false);
  const [id] = useState(() => nanoid());
  const varName = `--resizable-panel-size-${id}`;

  const onPointerDown = useCallback(
    (downEvent: React.PointerEvent<HTMLElement>) => {
      if (!ref.current) {
        return;
      }
      const elem = ref.current;
      downEvent.preventDefault();
      downEvent.stopPropagation();
      const baseSize = getActualSize();
      const basePointer: PointerPos = { x: downEvent.clientX, y: downEvent.clientY };
      setActive(true);
      setPanelSize(getActualSize());

      function getActualSize() {
        const box = elem.getBoundingClientRect();
        return direction === "left" || direction === "right" ? box.width : box.height;
      }

      function getSize(pointerEvent: PointerEvent) {
        const newPointer: PointerPos = { x: pointerEvent.clientX, y: pointerEvent.clientY };
        const sizeDiff = SIZE_DIFF[direction](basePointer, newPointer);
        const newSize = baseSize + sizeDiff;
        return newSize;
      }

      function onPointerMove(e: PointerEvent) {
        e.stopPropagation();
        e.preventDefault();
        elem.style.setProperty(varName, `${getSize(e)}px`);
      }

      function onPointerUp(upEvent: PointerEvent) {
        upEvent.stopPropagation();
        upEvent.preventDefault();
        document.removeEventListener("pointermove", onPointerMove, true);
        document.removeEventListener("pointerup", onPointerUp, true);
        // Update the actual size after the pointer up event (take min/max size into account)
        setPanelSize(getActualSize());
        setActive(false);
        flushSync(() => {
          elem.style.removeProperty(varName);
        });
      }

      document.addEventListener("pointermove", onPointerMove, true);
      document.addEventListener("pointerup", onPointerUp, true);
    },
    [direction, ref, setPanelSize, varName]
  );

  const resetSize = useCallback(() => {
    setPanelSize(initialSize);
  }, [initialSize, setPanelSize]);

  const dynamicSize = useMemo(() => {
    if (!active && panelSize === "auto") {
      return undefined;
    }
    if (panelSize === "auto") {
      return `var(${varName}, 100%)`;
    }
    return `var(${varName}, ${panelSize}px)`;
  }, [active, panelSize, varName]);

  return {
    size: panelSize,
    dynamicSize,
    onPointerDown,
    active,
    reset: resetSize,
  };
}

function serializeSize(size: TResizeWidth): string {
  return size === "auto" ? "auto" : size.toFixed();
}

function parseSize(size: string | undefined | null): TResizeWidth | null {
  if (!size) {
    return null;
  }
  if (size === "auto") {
    return "auto";
  }
  const parsed = parseInt(size, 10);
  return Number.isNaN(parsed) ? null : parsed;
}
