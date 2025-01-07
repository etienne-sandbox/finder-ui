/* SYNCED FILE */
import { Path, To } from "history";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";
import { atomWithDefault } from "jotai/utils";
import { createElement, ReactNode, useCallback, useMemo } from "react";
import { historyAtom } from "../atoms/history";
import { FinderPanelProps, FinderPanel as PanelBase } from "../components/finder/FinderPanel";
import { useMemoRecord } from "../hooks/useMemoRecord";
import { createHookProvider } from "../utils/hookProvider";

export type TPanelStatesBase = Record<string, any>;

export interface TPanelDef<Key, State, AnyState> {
  key: Key;
  fromLocation: (location: Path) => false | State;
  toLocation?: (state: State) => To;
  parentPanels?: (state: State) => AnyState | null;
  /**
   * Called when the panel is about to be opened
   * This will block the navigation until the promise
   */
  preload?: (state: State) => Promise<void> | void;
  /**
   * If return true, the preload will be skipped
   */
  preloaded?: (state: State) => boolean;
}

export type TFinderPanelDefBase<PanelStates extends TPanelStatesBase> = {
  [K in keyof PanelStates]: TPanelDef<K, PanelStates[K], TPanelStateBase<PanelStates>>;
}[keyof PanelStates];

export type TPanelStateBase<PanelStates extends TPanelStatesBase> = {
  [K in keyof PanelStates]: { key: K; state: PanelStates[K] };
}[keyof PanelStates];

export interface TInternalState<PanelStates extends TPanelStatesBase> {
  panels: readonly TPanelStateBase<PanelStates>[];
}

export type TPanelsDefsBase<PanelStates extends TPanelStatesBase> = readonly TFinderPanelDefBase<PanelStates>[];

export interface ProviderPropsBase<PanelStates extends TPanelStatesBase> {
  panels: TPanelsDefsBase<PanelStates>;
}

export function createFinderStore<PanelStates extends TPanelStatesBase>() {
  type TPanelState = TPanelStateBase<PanelStates>;
  type TPanelsState = readonly TPanelStateBase<PanelStates>[];

  const {
    Provider: FinderProvider,
    useMaybe: useFinderMaybe,
    useOrFail: useFinderOrFail,
  } = createHookProvider("Finder", ({ panels }: ProviderPropsBase<PanelStates>) => {
    const {
      history,
      $effect: $historyEffect,
      $location,
    } = useMemo(() => historyAtom<Partial<TInternalState<PanelStates>>>(), []);
    useAtom($historyEffect);

    const $panelsDefs = useMemo(() => atom(panels), [panels]);

    const $panelStates = useMemo(
      () =>
        atom((get): TPanelsState => {
          const location = get($location);
          const panelsDefs = get($panelsDefs);
          if (location.state && location.state.panels) {
            return location.state.panels;
          }
          // if no state, we need to find the panel from the path
          const lastPanel = matchPanelFromPath(panelsDefs, location);
          if (!lastPanel) {
            throw new Error("No panel found for location, at least one panel should match");
          }
          const panels: TPanelState[] = [...resolvePanelParents(panelsDefs, lastPanel), lastPanel];
          return panels;
        }),
      [$location, $panelsDefs]
    );

    const $requestedPanelStates = useMemo(
      () =>
        atomWithDefault<{ action: "push" | "replace" | "init"; panels: TPanelsState } | null>((get) => {
          return { action: "init", panels: get($panelStates) };
        }),
      [$panelStates]
    );

    const $loading = useMemo(() => atom((get) => get($requestedPanelStates) !== null), [$requestedPanelStates]);

    const $loaderEffect = useMemo(() => {
      return atomEffect((get, set) => {
        const panelsDefs = get($panelsDefs);
        const requestedPanels = get($requestedPanelStates);
        if (!requestedPanels) {
          return;
        }
        const { action, panels } = requestedPanels;
        const resolved = panels.map((panel) => {
          const def = panelsDefs.find((def) => def.key === panel.key);
          if (!def) {
            throw new Error(`Panel definition not found for key ${String(panel.key)}`);
          }
          const preloaded = Boolean(def.preload && def.preloaded && def.preloaded(panel.state));
          return { def, panel, preloaded };
        });
        // Check if all panels are preloaded
        const allPreloaded = resolved.every(({ preloaded }) => preloaded);

        function navigateNow() {
          set($requestedPanelStates, null);
          if (action === "init") {
            return;
          }
          const location = findPanelsLocation(get($panelsDefs), panels);
          if (action === "push") {
            history.push(location, { panels });
            return;
          }
          if (action === "replace") {
            history.replace(location, { panels });
            return;
          }
          action satisfies never;
        }

        if (allPreloaded) {
          navigateNow();
          return;
        }

        const controller = new AbortController();
        (async () => {
          try {
            await Promise.all(
              resolved.map(async ({ def, panel, preloaded }) => {
                if (preloaded || !def.preload) {
                  return;
                }
                controller.signal.throwIfAborted();
                await def.preload(panel.state);
              })
            );
            if (controller.signal.aborted) {
              return;
            }
            navigateNow();
          } catch (error) {
            if (controller.signal.aborted) {
              return;
            }
            console.error("Error during preload", error);
            navigateNow();
          }
        })();
        return () => {
          controller.abort();
        };
      });
    }, [$panelsDefs, $requestedPanelStates, history]);
    useAtom($loaderEffect);

    // Active panel is the second to last panel
    const $activeIndex = useMemo(
      () =>
        atom((get) => {
          const panels = get($panelStates);
          if (panels.length < 2) {
            return null;
          }
          return panels.length - 2;
        }),
      [$panelStates]
    );

    const $navigate = useMemo(
      () =>
        atom(null, (_get, set, action: "push" | "replace", panels: TPanelsState) => {
          set($requestedPanelStates, { action, panels });
        }),
      [$requestedPanelStates]
    );

    const $openPanelFromIndex = useMemo(
      () =>
        atom(null, (get, set, fromIndex: number, panel: TPanelState) => {
          const panels = get($panelStates);
          const base = panels.slice(0, fromIndex + 1);
          const stateDef = get($panelsDefs).find((def) => def.key === panel.key);
          if (!stateDef) {
            throw new Error(`Panel definition not found for key ${String(panel.key)}`);
          }
          if (!stateDef.toLocation) {
            throw new Error(`Panel definition ${String(panel.key)} has no toLocation method`);
          }
          const nextPanels = [...base, panel];
          set($navigate, "push", nextPanels);
        }),
      [$navigate, $panelStates, $panelsDefs]
    );

    const $updateStateByIndex = useMemo(
      () =>
        atom(null, (get, set, panelIndex: number, key: string, update: React.SetStateAction<TPanelState>) => {
          const panels = get($panelStates);
          const nextPanels = [...panels];
          const prevPanel = panels[panelIndex];
          if (prevPanel.key !== key) {
            throw new Error(`Panel key mismatch: expected ${String(key)}, got ${String(prevPanel.key)}`);
          }
          nextPanels[panelIndex] = {
            ...prevPanel,
            state: typeof update === "function" ? update(prevPanel.state) : update,
          };
          set($navigate, "replace", nextPanels);
        }),
      [$navigate, $panelStates]
    );

    const $closePanelsAfterIndex = useMemo(
      () =>
        atom(null, (get, set, fromIndex: number) => {
          const panels = get($panelStates);
          const nextPanels = panels.slice(0, fromIndex + 1);
          set($navigate, "push", nextPanels);
        }),
      [$navigate, $panelStates]
    );

    const openPanelFromIndex = useSetAtom($openPanelFromIndex);
    const updateStateByIndex = useSetAtom($updateStateByIndex);
    const closePanelsAfterIndex = useSetAtom($closePanelsAfterIndex);

    return useMemoRecord({
      history,
      $location,
      $loading,
      $panelStates,
      $activeIndex,
      openPanelFromIndex,
      updateStateByIndex,
      closePanelsAfterIndex,
    });
  });

  const {
    Provider: PanelProvider,
    useMaybe: usePanelMaybe,
    useOrFail: usePanelOrFail,
  } = createHookProvider("Panel", ({ panelIndex }: { panelIndex: number }) => {
    const { $panelStates, $activeIndex, openPanelFromIndex, updateStateByIndex, closePanelsAfterIndex } =
      useFinderOrFail();

    const $currentPanel = useMemo(() => atom((get) => get($panelStates)[panelIndex]), [$panelStates, panelIndex]);

    const $currentPanelKey = useMemo(() => atom((get) => get($currentPanel).key), [$currentPanel]);

    const $isActive = useMemo(() => atom((get) => get($activeIndex) === panelIndex), [$activeIndex, panelIndex]);
    const $isLast = useMemo(
      () => atom((get) => get($panelStates).length - 1 === panelIndex),
      [$panelStates, panelIndex]
    );

    const $state = useMemo(() => atom((get) => get($currentPanel).state), [$currentPanel]);

    const $nextPanel = useMemo(
      () =>
        atom((get) => {
          const panels = get($panelStates);
          const nextIndex = panelIndex + 1;
          if (nextIndex >= panels.length) {
            return null;
          }
          const nextPanel = panels[nextIndex];
          return nextPanel;
        }),
      [$panelStates, panelIndex]
    );

    const openPanel = useCallback(
      (panel: TPanelState) => {
        return openPanelFromIndex(panelIndex, panel);
      },
      [openPanelFromIndex, panelIndex]
    );

    const updateState = useCallback(
      <K extends keyof PanelStates>(key: K, update: React.SetStateAction<Extract<TPanelState, { key: K }>>) => {
        return updateStateByIndex(
          panelIndex,
          key as string,
          update as React.SetStateAction<TPanelStateBase<PanelStates>>
        );
      },
      [panelIndex, updateStateByIndex]
    );

    const closePanelsAfter = useCallback(() => {
      return closePanelsAfterIndex(panelIndex);
    }, [closePanelsAfterIndex, panelIndex]);

    return useMemoRecord({
      panelIndex,
      $isActive,
      $isLast,
      $currentPanel,
      $currentPanelKey,
      $state,
      $nextPanel,
      openPanel,
      updateState,
      closePanelsAfter,
    });
  });

  function usePanelState<K extends keyof PanelStates>(key: K): PanelStates[K] {
    const state = useAtomValue(usePanelOrFail().$currentPanel);
    if (state.key !== key) {
      throw new Error(`Panel key mismatch: expected ${String(key)}, got ${String(state.key)}`);
    }
    return state.state as PanelStates[K];
  }

  /**
   * Renders a panel with the correct isActive and resizeLocalStorageKey props
   */
  function Panel({ children, ...props }: FinderPanelProps): ReactNode {
    const { $isLast, $currentPanelKey } = usePanelOrFail();

    const isActive = useAtomValue($isLast);
    const currentPanelKey = useAtomValue($currentPanelKey);

    const nextProps: FinderPanelProps = {
      isActive,
      resizeLocalStorageKey: `finder-panel-size-${currentPanelKey as string}`,
      ...props,
    };

    return createElement(PanelBase, nextProps, children);
  }

  return {
    FinderProvider,
    useFinderMaybe,
    useFinderOrFail,
    PanelProvider,
    usePanelMaybe,
    usePanelOrFail,
    usePanelState,
    Panel,
  };
}

function matchPanelFromPath<PanelStates extends Record<string, any>>(
  panelsDefs: readonly TFinderPanelDefBase<PanelStates>[],
  path: Path
): false | TPanelStateBase<PanelStates> {
  for (const panelDef of panelsDefs) {
    const state = panelDef.fromLocation(path);
    if (state !== false) {
      return { key: panelDef.key, state, activeId: null };
    }
  }
  return false;
}

function findPanelsLocation<PanelStates extends Record<string, any>>(
  panelsDefs: readonly TFinderPanelDefBase<PanelStates>[],
  panels: readonly TPanelStateBase<PanelStates>[]
): To {
  const panelsReverse = [...panels].reverse();
  for (const panel of panelsReverse) {
    const def = panelsDefs.find((def) => def.key === panel.key);
    if (!def) {
      throw new Error(`Panel definition not found for key ${String(panel.key)}`);
    }
    if (def.toLocation) {
      return def.toLocation(panel.state);
    }
  }
  throw new Error("No location found for panels");
}

function resolvePanelParents<PanelStates extends Record<string, any>>(
  panelsDefs: readonly TFinderPanelDefBase<PanelStates>[],
  panelState: TPanelStateBase<PanelStates>
): readonly TPanelStateBase<PanelStates>[] {
  const def = panelsDefs.find((def) => def.key === panelState.key);
  if (!def) {
    throw new Error(`Panel definition not found for key ${String(panelState.key)}`);
  }
  if (!def.parentPanels) {
    return [];
  }
  const parentPanel = def.parentPanels(panelState.state);
  if (!parentPanel) {
    return [];
  }
  return [...resolvePanelParents(panelsDefs, parentPanel), parentPanel];
}
