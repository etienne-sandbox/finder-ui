/* SYNCED FILE */
import { History, parsePath, Path, To } from "history";
import {
  TFinderPanelDefBase,
  TNavigateOptions,
  TPanelsStateBase,
  TPanelStateBase,
  TPanelStatesBase,
} from "./createFinderStore.types";

export function resolveNavigateParams<PanelStates extends TPanelStatesBase>(
  currentPanels: TPanelsStateBase<PanelStates>,
  options: TNavigateOptions<PanelStates>,
): TPanelsStateBase<PanelStates> {
  const { fromIndex: currentIndex = -1, panels } = options;
  if (typeof panels === "function") {
    return panels(currentPanels);
  }
  const base = currentPanels.slice(0, currentIndex + 1);
  if (panels === null) {
    return base;
  }
  const panelsArr = Array.isArray(panels) ? panels : [panels];
  return [...base, ...panelsArr];
}

export function toPath(history: History, pathTo: To): Path {
  return { pathname: "/", search: "", hash: "", ...parsePath(history.createHref(pathTo)) };
}

export function findPanelsLocation<PanelStates extends TPanelStatesBase>(
  history: History,
  panelsDefs: readonly TFinderPanelDefBase<PanelStates, any>[],
  panels: TPanelsStateBase<PanelStates>,
): Path {
  const panelsReverse = [...panels].reverse();
  for (const panel of panelsReverse) {
    const def = panelsDefs.find((def) => def.key === panel.key);
    if (!def) {
      throw new Error(`Panel definition not found for key ${String(panel.key)}`);
    }
    if (def.toLocation) {
      return toPath(history, def.toLocation(panel.state));
    }
  }
  throw new Error("No location found for panels");
}

export function resolvePanelParents<PanelStates extends Record<string, any>>(
  panelsDefs: readonly TFinderPanelDefBase<PanelStates, any>[],
  panelState: TPanelStateBase<PanelStates>,
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
