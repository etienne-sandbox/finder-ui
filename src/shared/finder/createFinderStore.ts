/* SYNCED FILE */
import { Path, To } from "history";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { atomEffect } from "jotai-effect";
import { atomWithDefault } from "jotai/utils";
import { nanoid } from "nanoid";
import { createElement, ForwardedRef, forwardRef, ReactNode, useCallback, useMemo, useState } from "react";
import { historyAtom } from "../atoms/history";
import { useAtomFromValue } from "../hooks/useAtomFromValue";
import { useMemoEqual } from "../hooks/useMemoEqual";
import { useMemoRecord } from "../hooks/useMemoRecord";
import { createHookProvider } from "../utils/hookProvider";
import { shouldProcessLinkClick } from "../utils/linkEvents";
import {
  FinderLinkProps,
  ProviderPropsBase,
  TInternalState,
  TNavigateOptions,
  TPanelStateBase,
  TPanelStatesBase,
} from "./createFinderStore.types";
import { findPanelsLocation, resolveNavigateParams, resolvePanelParents, toPath } from "./createFinderStore.utils";
import { FinderPanelProps, FinderPanel as PanelBase } from "./FinderPanel";

export function createFinderStore<PanelStates extends TPanelStatesBase, PanelContext>() {
  type TPanelState = TPanelStateBase<PanelStates>;
  type TPanelsState = readonly TPanelState[];

  const {
    Provider: FinderProvider,
    useMaybe: useFinderMaybe,
    useOrFail: useFinderOrFail,
  } = createHookProvider(
    "Finder",
    ({ panels: panelsDefs, matchLocation, context }: ProviderPropsBase<PanelStates, PanelContext>) => {
      const {
        history,
        $effect: $historyEffect,
        $location,
      } = useMemo(() => {
        return historyAtom<Partial<TInternalState<PanelStates>>>();
      }, []);
      useAtom($historyEffect);

      // Need object because jotai does not like functions as values
      const $matchLocationObj = useAtomFromValue(useMemo(() => ({ matchLocation }), [matchLocation]));
      const $panelsDefs = useAtomFromValue(panelsDefs);
      const $context = useAtomFromValue(context);

      const $matchLocationWithTools = useMemo(
        () =>
          atom((get) => {
            const matchLocationObj = get($matchLocationObj);
            const panelsDefs = get($panelsDefs);
            const context = get($context);

            const withParents = (panel: TPanelState) => {
              return [...resolvePanelParents(panelsDefs, panel), panel];
            };

            return (location: Path) => {
              return matchLocationObj.matchLocation(location, context, { withParents });
            };
          }),
        [$context, $matchLocationObj, $panelsDefs],
      );

      const $panelsFromLocation = useMemo(
        () =>
          atom(null, (get, _set, pathTo: To) => {
            const matchLocationWithTools = get($matchLocationWithTools);
            const panels = matchLocationWithTools(toPath(history, pathTo));
            return panels;
          }),
        [$matchLocationWithTools, history],
      );
      const panelsFromLocation = useSetAtom($panelsFromLocation);

      const routingId = useState(() => nanoid())[0];

      const $panelStates = useMemo(
        () =>
          atom((get): TPanelsState => {
            const location = get($location);
            if (location.state && location.state.routingId && location.state.panels) {
              if (location.state.routingId === routingId) {
                return location.state.panels;
              }
              // TODO: Allow user to restore panels ?
            }
            // if no state, we need to find the panels from the path
            return get($matchLocationWithTools)(location);
          }),
        [$location, $matchLocationWithTools, routingId],
      );
      console.log(useAtomValue($panelStates));

      const $requestedPanelStates = useMemo(
        () =>
          atomWithDefault<{
            action: "push" | "replace" | "init";
            panels: TPanelsState;
          } | null>((get) => {
            return { action: "init", panels: get($panelStates) };
          }),
        [$panelStates],
      );

      const $loading = useMemo(() => atom((get) => get($requestedPanelStates) !== null), [$requestedPanelStates]);

      // Run loader on panels and navigate when ready
      const $loaderEffect = useMemo(() => {
        return atomEffect((get, set) => {
          const panelsDefs = get($panelsDefs);
          const context = get($context);
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
            const preloaded = Boolean(def.preload && def.preloaded && def.preloaded(panel.state, context));
            return { def, panel, preloaded };
          });
          // Check if all panels are preloaded
          const allPreloaded = resolved.every(({ preloaded }) => preloaded);

          function navigateNow() {
            set($requestedPanelStates, null);
            if (action === "init") {
              return;
            }
            const location = findPanelsLocation(history, get($panelsDefs), panels);
            if (action === "push") {
              history.push(location, { panels, routingId });
              return;
            }
            if (action === "replace") {
              history.replace(location, { panels, routingId });
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
                  await def.preload(panel.state, context);
                }),
              );
              if (controller.signal.aborted) {
                return;
              }
            } catch (error) {
              if (controller.signal.aborted) {
                return;
              }
              console.error("Error during preload", error);
            }
            navigateNow();
          })();
          return () => {
            controller.abort();
          };
        });
      }, [$context, $panelsDefs, $requestedPanelStates, history, routingId]);
      useAtom($loaderEffect);

      const $navigate = useMemo(
        () =>
          atom(null, (get, set, options: TNavigateOptions<PanelStates>) => {
            const nextPanels = resolveNavigateParams(get($panelStates), options);
            const action = options.replace ? "replace" : "push";
            set($requestedPanelStates, { action, panels: nextPanels });
          }),
        [$panelStates, $requestedPanelStates],
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
            set($navigate, {
              replace: true,
              panels: nextPanels,
              fromIndex: -1, // Replace all panels
            });
          }),
        [$navigate, $panelStates],
      );

      // const $closePanelsAfterIndex = useMemo(
      //   () =>
      //     atom(null, (get, set, fromIndex: number) => {
      //       const panels = get($panelStates);
      //       const nextPanels = panels.slice(0, fromIndex + 1);
      //       set($navigate, "push", nextPanels);
      //     }),
      //   [$navigate, $panelStates],
      // );

      const navigate = useSetAtom($navigate);
      const navigateTo = useCallback(
        (options: TNavigateOptions<PanelStates>) => {
          return navigate({ fromIndex: -1, ...options });
        },
        [navigate],
      );
      // const navigateTo = useSetAtom($navigateTo);
      // const openPanelFromIndex = useSetAtom($openPanelFromIndex);
      const updateStateByIndex = useSetAtom($updateStateByIndex);
      // const closePanelsAfterIndex = useSetAtom($closePanelsAfterIndex);

      const refreshLocation = useCallback(
        ({ replace }: { replace?: boolean } = {}) => {
          console.log("refreshLocation");
          navigateTo({
            replace,
            panels: panelsFromLocation(history.location),
          });
        },
        [history, navigateTo, panelsFromLocation],
      );

      return useMemoRecord({
        history,
        $location,
        $loading,
        $panelsDefs,
        $panelStates,
        navigate,
        navigateTo,
        updateStateByIndex,
        panelsFromLocation,
        refreshLocation,
      });
    },
  );

  const {
    Provider: PanelProvider,
    useMaybe: usePanelMaybe,
    useOrFail: usePanelOrFail,
  } = createHookProvider("Panel", ({ panelIndex }: { panelIndex: number }) => {
    const { $panelStates, updateStateByIndex } = useFinderOrFail();

    const $currentPanel = useMemo(() => atom((get) => get($panelStates)[panelIndex]), [$panelStates, panelIndex]);

    const $currentPanelKey = useMemo(() => atom((get) => get($currentPanel).key), [$currentPanel]);

    // Active panel if second to last or single panel
    const $isActive = useMemo(
      () =>
        atom((get) => {
          const panels = get($panelStates);
          return panels.length === 1 || panelIndex === panels.length - 2;
        }),
      [$panelStates, panelIndex],
    );

    const $isLast = useMemo(
      () => atom((get) => get($panelStates).length - 1 === panelIndex),
      [$panelStates, panelIndex],
    );

    const $state = useMemo(() => atom((get) => get($currentPanel).state), [$currentPanel]);

    const $nextPanel = useMemo(
      () =>
        atom((get) => {
          const panels = get($panelStates);
          if (panelIndex + 1 >= panels.length) {
            return null;
          }
          return panels[panelIndex + 1];
        }),
      [$panelStates, panelIndex],
    );

    const updateState = useCallback(
      <K extends keyof PanelStates>(key: K, update: React.SetStateAction<Extract<TPanelState, { key: K }>>) => {
        return updateStateByIndex(
          panelIndex,
          key as string,
          update as React.SetStateAction<TPanelStateBase<PanelStates>>,
        );
      },
      [panelIndex, updateStateByIndex],
    );

    return useMemoRecord({
      panelIndex,
      $isActive,
      $isLast,
      $currentPanel,
      $currentPanelKey,
      $state,
      $nextPanel,
      updateState,
    });
  });

  function usePanelState<K extends keyof PanelStates>(key: K): PanelStates[K] {
    const state = useAtomValue(usePanelOrFail().$currentPanel);
    if (state.key !== key) {
      throw new Error(`Panel key mismatch: expected ${String(key)}, got ${String(state.key)}`);
    }
    return state.state as PanelStates[K];
  }

  function usePanelLinkProps(
    options: TNavigateOptions<PanelStates>,
    linkProps: React.ComponentPropsWithoutRef<"a">,
  ): React.ComponentPropsWithoutRef<"a"> {
    const { $panelStates, $panelsDefs, history, navigate } = useFinderOrFail();
    const { panelIndex } = usePanelOrFail();

    const { panels, fromIndex = panelIndex, replace } = options;
    const localOptions = useMemo(() => ({ panels, fromIndex, replace }), [panels, fromIndex, replace]);

    const $nextLocation = useMemo(
      () =>
        atom((get) => {
          const nextPanels = resolveNavigateParams(get($panelStates), localOptions);
          return findPanelsLocation(history, get($panelsDefs), nextPanels);
        }),
      [$panelStates, $panelsDefs, history, localOptions],
    );

    const nextLocation = useAtomValue($nextLocation);

    return useMemo(() => {
      return {
        href: nextLocation.pathname,
        onClick: (event) => {
          linkProps.onClick?.(event);
          if (event.defaultPrevented) {
            return;
          }
          if (shouldProcessLinkClick(event, linkProps.target)) {
            event.preventDefault();
            navigate(localOptions);
          }
        },
      };
    }, [linkProps, localOptions, navigate, nextLocation.pathname]);
  }

  /**
   * Renders a panel with the correct isActive and resizeLocalStorageKey props
   */
  const Panel = forwardRef(function Panel(
    { children, ...props }: FinderPanelProps,
    ref: ForwardedRef<HTMLDivElement>,
  ): ReactNode {
    const { $isLast, $currentPanelKey } = usePanelOrFail();

    const isActive = useAtomValue($isLast);
    const currentPanelKey = useAtomValue($currentPanelKey);

    const nextProps: FinderPanelProps = {
      isActive,
      resizeLocalStorageKey: `finder-panel-size-${currentPanelKey as string}`,
      ...props,
    };

    return createElement(PanelBase, { ...nextProps, ref }, children);
  });

  const FinderLink = forwardRef<HTMLAnchorElement, FinderLinkProps<PanelStates>>(function FinderLink(
    { panels, replace, fromIndex, ...rest },
    ref,
  ): ReactNode {
    const panelsStable = useMemoEqual(panels);
    const props = usePanelLinkProps({ panels: panelsStable, replace, fromIndex }, rest);
    return createElement("a", { ...rest, ...props, ref });
  });

  return {
    FinderProvider,
    FinderLink,
    PanelProvider,
    useFinderMaybe,
    useFinderOrFail,
    usePanelMaybe,
    usePanelOrFail,
    usePanelState,
    Panel,
  };
}
