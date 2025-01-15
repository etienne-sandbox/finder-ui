/* SYNCED FILE */
import { atom, useSetAtom } from "jotai";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

export function useAtomFromValue<T>(value: T) {
  useEffect(() => {
    if (import.meta.env.DEV && typeof value === "function") {
      console.error(
        "useAtomFromValue should not be used with a function as argument, wrap your function in a useMemo(() => ({ fn }), [])",
      );
    }
  }, []);

  const initialValuRef = useRef(value);
  const $atom = useMemo(() => atom(initialValuRef.current), []);
  const setAtom = useSetAtom($atom);
  useLayoutEffect(() => {
    setAtom(value);
  }, [setAtom, value]);

  const $readonlyAtom = useMemo(() => atom((get) => get($atom)), [$atom]);
  return $readonlyAtom;
}
