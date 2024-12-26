import { Path, To } from "history";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { createContext, createElement, useCallback, useContext, useMemo } from "react";
import { historyAtom } from "../atoms/history";
import { createHookProvider } from "../utils/hookProvider";

export type TPanelStatesBase = Record<string, any>;

export type TFinderPanelDefBase<PanelStates extends TPanelStatesBase> = {
  [K in keyof PanelStates]: {
    key: K;
    fromLocation: (location: Path) => false | PanelStates[K];
    toLocation?: (state: PanelStates[K]) => To;
    parentPanels?: (state: PanelStates[K]) => TPanelStateBase<PanelStates> | null;
  };
}[keyof PanelStates];

export type TPanelStateBase<PanelStates extends TPanelStatesBase> = {
  [K in keyof PanelStates]: { key: K; state: PanelStates[K] };
}[keyof PanelStates];

export interface TInternalState<PanelStates extends TPanelStatesBase> {
  panels: readonly TPanelStateBase<PanelStates>[];
  activeIndex: number;
}

export type TPanelsDefsBase<PanelStates extends TPanelStatesBase> = readonly TFinderPanelDefBase<PanelStates>[];

export interface ProviderPropsBase<PanelStates extends TPanelStatesBase> {
  panels: TPanelsDefsBase<PanelStates>;
}

export function createFinderStore<PanelStates extends TPanelStatesBase>() {
  type TPanelState = TPanelStateBase<PanelStates>;

  const { Provider, useMaybe, useOrFail } = createHookProvider(
    "Finder",
    ({ panels }: ProviderPropsBase<PanelStates>) => {
      const {
        history,
        $effect: $historyEffect,
        $location,
      } = useMemo(() => historyAtom<Partial<TInternalState<PanelStates>>>(), []);

      const $panelsDefs = useMemo(() => atom(panels), [panels]);

      useAtom($historyEffect);

      const $panelStates = useMemo(
        () =>
          atom((get): TInternalState<PanelStates> => {
            const location = get($location);
            const panelsDefs = get($panelsDefs);
            if (location.state && location.state.panels && location.state.activeIndex !== undefined) {
              return {
                panels: location.state.panels,
                activeIndex: location.state.activeIndex,
              };
            }
            // if no state, we need to find the panel from the path
            const lastPanel = matchPanelFromPath(panelsDefs, location);
            if (!lastPanel) {
              throw new Error("No panel found for location, at least one panel should match");
            }
            const panels: TPanelState[] = [...resolvePanelParents(panelsDefs, lastPanel), lastPanel];
            const activeIndex = panels.length - 1;
            return { panels, activeIndex };
          }),
        [$location, $panelsDefs]
      );

      const $activeIndex = useMemo(() => atom((get) => get($panelStates).activeIndex), [$panelStates]);

      const $navigatePush = useMemo(
        () =>
          atom(null, (get, _set, state: TInternalState<PanelStates>) => {
            const location = findPanelsLocation(get($panelsDefs), state.panels);
            history.push(location, state);
          }),
        [$panelsDefs, history]
      );

      const $navigateReplace = useMemo(
        () =>
          atom(null, (get, _set, state: TInternalState<PanelStates>) => {
            const location = findPanelsLocation(get($panelsDefs), state.panels);
            history.replace(location, state);
          }),
        [$panelsDefs, history]
      );

      const $openPanel = useMemo(
        () =>
          atom(null, (get, set, fromIndex: number, panel: TPanelState) => {
            const { panels } = get($panelStates);
            const base = panels.slice(0, fromIndex + 1);
            const stateDef = get($panelsDefs).find((def) => def.key === panel.key);
            if (!stateDef) {
              throw new Error(`Panel definition not found for key ${String(panel.key)}`);
            }
            if (!stateDef.toLocation) {
              throw new Error(`Panel definition ${String(panel.key)} has no toLocation method`);
            }
            const nextPanels = [...base, panel];
            set($navigatePush, { panels: nextPanels, activeIndex: fromIndex + 1 });
          }),
        [$navigatePush, $panelStates, $panelsDefs]
      );

      const $updateState = useMemo(
        () =>
          atom(null, (get, set, panelIndex: number, update: React.SetStateAction<TPanelState>) => {
            const { panels, activeIndex } = get($panelStates);
            const nextPanels = [...panels];
            const prevPanel = panels[panelIndex];
            nextPanels[panelIndex] = {
              ...prevPanel,
              state: typeof update === "function" ? update(prevPanel.state) : update,
            };
            set($navigateReplace, { panels: nextPanels, activeIndex });
          }),
        [$navigateReplace, $panelStates]
      );

      const openPanel = useSetAtom($openPanel);
      const updateState = useSetAtom($updateState);

      return useMemo(
        () => ({
          history,
          $location,
          $panelStates,
          $activeIndex,
          openPanel,
          updateState,
        }),
        [$activeIndex, $location, $panelStates, history, openPanel, updateState]
      );
    }
  );

  const PanelIndexContext = createContext<number | null>(null);

  function PanelIndexProvider({ index, children }: { index: number; children: React.ReactNode }): React.ReactElement {
    return createElement(PanelIndexContext.Provider, { value: index, children });
  }

  function usePanelIndex() {
    const index = useContext(PanelIndexContext);
    if (index === null) {
      throw new Error("Missing PanelIndexProvider");
    }
    return index;
  }

  function usePanelUtils<K extends keyof PanelStates>(key: K) {
    const index = usePanelIndex();
    const finderCtx = useOrFail();
    const activeIndex = useAtomValue(finderCtx.$activeIndex);

    const $currentPanel = useMemo(
      () => atom((get) => get(finderCtx.$panelStates).panels[index]),
      [finderCtx.$panelStates, index]
    );
    const currentPanel = useAtomValue($currentPanel);
    if (currentPanel.key !== key) {
      throw new Error(`Panel key mismatch: expected ${String(key)}, got ${String(currentPanel.key)}`);
    }

    const isActive = index === activeIndex;
    const isSelected = index < activeIndex;

    const openPanel = useCallback(
      (panel: TPanelState) => {
        return finderCtx.openPanel(index, panel);
      },
      [finderCtx, index]
    );

    const updateState = useCallback(
      (update: React.SetStateAction<Extract<TPanelState, { key: K }>>) => {
        return finderCtx.updateState(index, update as React.SetStateAction<TPanelState>);
      },
      [finderCtx, index]
    );

    const state = currentPanel.state as PanelStates[K];

    return {
      isActive,
      isSelected,
      state,
      openPanel,
      updateState,
    };
  }

  return {
    FinderProvider: Provider,
    useFinderMaybe: useMaybe,
    useFinderOrFail: useOrFail,
    PanelIndexProvider,
    usePanelIndex,
    usePanelUtils,
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
