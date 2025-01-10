/* SYNCED FILE */
import { atom, useSetAtom } from "jotai";
import { useLayoutEffect, useMemo, useRef } from "react";

export function useAtomFromValue<T>(value: T) {
  const initialValuRef = useRef(value);
  const $atom = useMemo(() => atom(initialValuRef.current), []);
  const setAtom = useSetAtom($atom);
  useLayoutEffect(() => {
    setAtom(value);
  }, [setAtom, value]);

  const $readonlyAtom = useMemo(() => atom((get) => get($atom)), [$atom]);
  return $readonlyAtom;
}
