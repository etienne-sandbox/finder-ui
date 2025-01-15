/* SYNCED FILE */
import { isEqual as defaultIsEqual } from "@react-hookz/deep-equal";
import { useLayoutEffect, useMemo, useRef } from "react";

export type TIsEqual<Value> = (a: Value, b: Value) => boolean;

export function useMemoEqual<Value>(value: Value, isEqual: TIsEqual<Value> = defaultIsEqual): Value {
  const stableValueRef = useRef<Value>(value);
  const stableValue = useMemo(
    () => (isEqual(value, stableValueRef.current) ? stableValueRef.current : value),
    [isEqual, value],
  );
  useLayoutEffect(() => {
    stableValueRef.current = stableValue;
  }, [stableValue]);
  return stableValue;
}
