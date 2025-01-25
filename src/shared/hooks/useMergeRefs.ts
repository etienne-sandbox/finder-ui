/* SYNCED FILE */
import { MutableRefObject, Ref, RefCallback, useMemo } from "react";

export function useMergeRefs(...refs: Array<Ref<any> | undefined>) {
  return useMemo(() => {
    if (!refs.some(Boolean)) return;
    return (value: unknown) => {
      refs.forEach((ref) => setRef(ref, value));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
}

function setRef<T>(ref: RefCallback<T> | MutableRefObject<T> | null | undefined, value: T) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}
