import { MutableRefObject, useEffect, useLayoutEffect, useRef } from "react";

export function useLatestRef<T>(val: T): MutableRefObject<T> {
  const ref = useRef<T>(val);
  useEffect(() => {
    ref.current = val;
  }, [val]);
  return ref;
}

export function useLayoutLatestRef<T>(val: T): MutableRefObject<T> {
  const ref = useRef<T>(val);
  useLayoutEffect(() => {
    ref.current = val;
  });
  return ref;
}
