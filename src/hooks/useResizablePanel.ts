import { nanoid } from "nanoid";
import type { MutableRefObject } from "react";
import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { useLatestRef } from "./useLatestRef";

export interface ResizablePanelConfig {
  direction: "left" | "right" | "top" | "bottom";
  initialSize: number;
  minSize: number;
  maxSize: number;
  localStorageKey?: string;
}

interface MousePos {
  x: number;
  y: number;
}

const SIZE_DIFF = {
  left: (baseMouse: MousePos, newMouse: MousePos) => newMouse.x - baseMouse.x,
  right: (baseMouse: MousePos, newMouse: MousePos) => baseMouse.x - newMouse.x,
  top: (baseMouse: MousePos, newMouse: MousePos) => newMouse.y - baseMouse.y,
  bottom: (baseMouse: MousePos, newMouse: MousePos) => baseMouse.y - newMouse.y,
};

export function useResizablePanel(
  ref: MutableRefObject<HTMLDivElement | null>,
  { initialSize, maxSize, minSize, direction, localStorageKey }: ResizablePanelConfig
) {
  const clampSize = useCallback((size: number) => Math.min(Math.max(size, minSize), maxSize), [maxSize, minSize]);

  const [panelSize, setPanelSizeInternal] = useState<number>(() => {
    if (!localStorageKey) {
      return initialSize;
    }
    const storedSizeRaw = localStorage.getItem(localStorageKey);
    const storedSize = storedSizeRaw ? parseInt(storedSizeRaw, 10) : initialSize;
    const restoredSize = clampSize(Number.isNaN(storedSize) ? initialSize : storedSize);
    localStorage.setItem(localStorageKey, restoredSize.toFixed());
    return restoredSize;
  });
  const setPanelSize = useCallback(
    (size: number) => {
      setPanelSizeInternal(size);
      if (localStorageKey) {
        localStorage.setItem(localStorageKey, size.toFixed());
      }
    },
    [localStorageKey]
  );

  const [active, setActive] = useState<boolean>(false);
  const sizeRef = useLatestRef(panelSize);
  const [id] = useState(() => nanoid());
  const varName = `--resizable-panel-size-${id}`;

  const onMouseDown = useCallback(
    (downEvent: React.MouseEvent<HTMLElement>) => {
      if (!ref.current) {
        return;
      }
      const elem = ref.current;
      downEvent.preventDefault();
      downEvent.stopPropagation();
      const baseSize = sizeRef.current ?? initialSize;
      const baseMouse: MousePos = { x: downEvent.clientX, y: downEvent.clientY };
      setActive(true);

      function getSize(mouseEvent: MouseEvent) {
        const newMouse: MousePos = { x: mouseEvent.clientX, y: mouseEvent.clientY };
        const sizeDiff = SIZE_DIFF[direction](baseMouse, newMouse);
        const newSize = clampSize(baseSize + sizeDiff);
        return newSize;
      }

      function onMouseMove(e: MouseEvent) {
        e.stopPropagation();
        e.preventDefault();
        elem.style.setProperty(varName, `${getSize(e)}px`);
      }

      function onMouseUp(upEvent: MouseEvent) {
        upEvent.stopPropagation();
        upEvent.preventDefault();
        document.removeEventListener("mousemove", onMouseMove, true);
        document.removeEventListener("mouseup", onMouseUp, true);
        setPanelSize(getSize(upEvent));
        setActive(false);
        flushSync(() => {
          elem.style.removeProperty(varName);
        });
      }

      document.addEventListener("mousemove", onMouseMove, true);
      document.addEventListener("mouseup", onMouseUp, true);
    },
    [clampSize, direction, initialSize, ref, setPanelSize, sizeRef, varName]
  );

  const resetSize = useCallback(() => {
    setPanelSize(initialSize);
  }, [initialSize, setPanelSize]);

  return {
    size: panelSize,
    dynamicSize: `var(${varName}, ${panelSize}px)`,
    onMouseDown,
    active,
    reset: resetSize,
  };
}
