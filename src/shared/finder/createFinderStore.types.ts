/* SYNCED FILE */
import { Path, To } from "history";

export type { Path, To };

export type TPanelStatesBase = Record<string, any>;

export interface TPanelDef<Key, State, AnyState, PanelContext> {
  key: Key;
  toLocation?: (state: State) => To;
  parentPanels?: (state: State) => AnyState | null;
  /**
   * Called when the panel is about to be opened
   * This will block the navigation until the promise
   */
  preload?: (state: State, context: PanelContext) => Promise<void> | void;
  /**
   * If return true, the preload will be skipped
   */
  preloaded?: (state: State, context: PanelContext) => boolean;
}

export type TFinderPanelDefBase<PanelStates extends TPanelStatesBase, PanelContext> = {
  [K in keyof PanelStates]: TPanelDef<K, PanelStates[K], TPanelStateBase<PanelStates>, PanelContext>;
}[keyof PanelStates];

export type TPanelStateBase<PanelStates extends TPanelStatesBase> = {
  [K in keyof PanelStates]: { key: K; state: PanelStates[K] };
}[keyof PanelStates];

export interface TInternalState<PanelStates extends TPanelStatesBase> {
  routingId: string;
  panels: readonly TPanelStateBase<PanelStates>[];
}

export type TPanelsStateBase<PanelStates extends TPanelStatesBase> = readonly TPanelStateBase<PanelStates>[];

export type TMatchLocationTools<PanelStates extends TPanelStatesBase> = {
  withParents: (panel: TPanelStateBase<PanelStates>) => TPanelsStateBase<PanelStates>;
};

export type TMatchLocation<PanelStates extends TPanelStatesBase, PanelContext> = (
  location: Path,
  context: PanelContext,
  tools: TMatchLocationTools<PanelStates>,
) => TPanelsStateBase<PanelStates>;

export type TPanelsDefsBase<PanelStates extends TPanelStatesBase, PanelContext> = readonly TFinderPanelDefBase<
  PanelStates,
  PanelContext
>[];

export interface ProviderPropsBase<PanelStates extends TPanelStatesBase, PanelContext> {
  panels: TPanelsDefsBase<PanelStates, PanelContext>;
  context: PanelContext;
  matchLocation: TMatchLocation<PanelStates, PanelContext>;
}

export interface FinderLinkProps<PanelStates extends TPanelStatesBase>
  extends React.ComponentPropsWithoutRef<"a">,
    TNavigateOptions<PanelStates> {}

export interface TNavigateOptions<PanelStates extends TPanelStatesBase> {
  /**
   * Will keep the the panel and replace the panels after it
   * Set to -1 to replace all panels
   */
  fromIndex?: number;
  /**
   * Null will do slice from the currentIndex
   * If single panel or array, will replace the panels from the currentIndex
   * If function, will replace the panels (ignoring the currentIndex)
   */
  panels:
    | null
    | TPanelsStateBase<PanelStates>
    | TPanelStateBase<PanelStates>
    | ((panels: TPanelsStateBase<PanelStates>) => TPanelsStateBase<PanelStates>);
  /**
   * Do history.replace instead of history.push
   */
  replace?: boolean;
}
