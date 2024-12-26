import { nanoid } from "nanoid";
import { MutableRefObject, useEffect, useState } from "react";

/**
 * Prevent scroll content from changing size while resizing panel
 */
export function useStableScroll(scrollRef: MutableRefObject<HTMLDivElement | null>) {
  const [id] = useState(() => nanoid());

  const varName = `--resizable-panel-size-${id}`;

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }
    const element = scrollRef.current;

    function update() {
      const elementWith = element.getBoundingClientRect().width;
      const visibleMax = elementWith + element.scrollLeft;
      element.style.setProperty(varName, `${visibleMax}px`);
    }

    const observer = new ResizeObserver(() => {
      update();
    });

    observer.observe(element);
    element.addEventListener("scroll", update);

    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [scrollRef, varName]);

  return {
    contentMinSize: `var(${varName})`,
  };
}
