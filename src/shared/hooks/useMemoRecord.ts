/* SYNCED FILE */
import { useMemo } from "react";

export function useMemoRecord<T extends Record<string, any>>(obj: T): T {
  const deps = Object.keys(obj)
    .sort(([l], [r]) => l.localeCompare(r))
    .flatMap((key) => [key, obj[key]]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => obj, deps);
}
