// SYNCED FILE
import { createBrowserHistory, Location } from "history";
import { atom } from "jotai";
import { atomEffect } from "jotai-effect";

export type TLocationWithState<TState> = Omit<Location, "state"> & { state?: TState };

export function historyAtom<LocationState>() {
  const history = createBrowserHistory();

  const $locationInternal = atom(history.location);

  const $location = atom((get) => get($locationInternal) as TLocationWithState<LocationState>);

  const $effect = atomEffect((_get, set) => {
    set($locationInternal, history.location);
    const unlisten = history.listen((event) => {
      set($locationInternal, event.location);
    });
    return unlisten;
  });

  return {
    history,
    $location,
    $effect,
  };
}
