import { useAtomValue } from "jotai";
import { useEffect, useMemo, useRef } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { useStableScroll } from "../hooks/useStableScroll";
import { FilesPanel } from "../panels/Files";
import { HomePanel } from "../panels/Home";
import { PanelIndexProvider, PanelStates, useFinderOrFail } from "../stores/finderStore";
import { cn } from "../utils/styles";
import { Panel } from "./Panel";

const PANELS_RENDERS: { [K in keyof PanelStates]: (state: PanelStates[K]) => React.ReactElement } = {
  home: () => <HomePanel />,
  files: () => <FilesPanel />,
  file: (state) => <Panel>File {state.id}</Panel>,
  notFound: () => <Panel>Not found</Panel>,
  user: (state) => <Panel>User {state.id}</Panel>,
  users: (state) => <Panel>Users {state.search}</Panel>,
};

export function Finder() {
  const { panels, activeIndex } = useAtomValue(useFinderOrFail().$panelStates);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      return;
    }
    setTimeout(() => {}, 0);
  }, [isMobile, activeIndex]);

  const renderedPanels = useMemo(() => {
    return panels.map((panelState, panelIndex) => {
      const render = PANELS_RENDERS[panelState.key] as (state: PanelStates[keyof PanelStates]) => React.ReactElement;
      return (
        <PanelIndexProvider index={panelIndex} key={`${panelState.key}-${panelIndex}`}>
          {render(panelState.state)}
        </PanelIndexProvider>
      );
    });
  }, [panels]);

  const { contentMinSize } = useStableScroll(scrollRef);

  if (isMobile) {
    return (
      <div
        className="fixed overflow-hidden bg-neutral-800 inset-0 flex flex-row h-full overflow-x-auto snap-x"
        ref={scrollRef}
      >
        {renderedPanels}
      </div>
    );
  }

  return (
    <div className={cn("fixed overflow-hidden bg-neutral-800 inset-4 rounded-md shadow-lg")}>
      <div className="h-full overflow-x-auto" ref={scrollRef}>
        <div
          style={{ ["--scroll-content-min-width" as string]: contentMinSize }}
          className="flex flex-row h-full min-w-[var(--scroll-content-min-width)]"
        >
          {renderedPanels}
        </div>
      </div>
    </div>
  );

  // console.log(panelsStates);

  // const store1 = Ariakit.useCompositeStore({
  //   orientation: "vertical",
  //   defaultActiveId: null,
  // });

  // const store2 = Ariakit.useCompositeStore({
  //   orientation: "vertical",
  //   defaultActiveId: null,
  // });

  // const onNext1 = useCallback(() => {
  //   const activeId = store2.getState().activeId ?? store2.first();
  //   const state = store2.getState();
  //   const item = state.items.find((i) => i.id === activeId);
  //   if (!item) {
  //     return;
  //   }
  //   item.element?.focus();
  // }, [store2]);

  // const onPrevious2 = useCallback(() => {
  //   const activeId = store1.getState().activeId ?? store1.first();
  //   const item = store1.getState().items.find((i) => i.id === activeId);
  //   if (!item) {
  //     return;
  //   }
  //   item.element?.focus();
  //   store2.setActiveId(null);
  // }, [store1, store2]);

  // return (
  //   <div className="flex flex-row h-full">
  //     <List
  //       store={store1}
  //       onNext={onNext1}
  //       onFocus={() => {
  //         store2.setActiveId(null);
  //       }}
  //     >
  //       <FinderItem compositeId="item-1" title="Item 1.1" />
  //       <FinderItem compositeId="item-2" title="Item 1.2" />
  //       <FinderItem compositeId="item-3" title="Item 1.3" />
  //       <FinderItem compositeId="item-4" title="Item 1.4" />
  //       <FinderItem compositeId="item-5" title="Item 1.5" />
  //       <FinderItem compositeId="item-6" title="Item 1.6" />
  //       <FinderItem compositeId="item-7" title="Item 1.7" />
  //       <FinderItem compositeId="item-8" title="Item 1.8" />
  //       <FinderItem compositeId="item-9" title="Item 1.9" />
  //       <FinderItem compositeId="item-10" title="Item 1.10" />
  //       <FinderItem compositeId="item-11" title="Item 1.11" />
  //       <FinderItem compositeId="item-12" title="Item 1.12" />
  //       <FinderItem compositeId="item-13" title="Item 1.13" />
  //       <FinderItem compositeId="item-14" title="Item 1.14" />
  //     </List>
  //     <div className="w-px self-stretch bg-black border-none shrink-0" />
  //     <List store={store2} onPrevious={onPrevious2}>
  //       <FinderItem compositeId="item-1" title="Item 2.1" />
  //       <FinderItem compositeId="item-2" title="Item 2.2" />
  //       <FinderItem compositeId="item-3" title="Item 2.3" />
  //       <FinderItem compositeId="item-4" title="Item 2.4" />
  //       <FinderItem compositeId="item-5" title="Item 2.5" />
  //       <FinderItem compositeId="item-6" title="Item 2.6" />
  //       <FinderItem compositeId="item-7" title="Item 2.7" />
  //       <FinderItem compositeId="item-8" title="Item 2.8" />
  //       <FinderItem compositeId="item-9" title="Item 2.9" />
  //       <FinderItem compositeId="item-10" title="Item 2.10" />
  //       <FinderItem compositeId="item-11" title="Item 2.11" />
  //       <FinderItem compositeId="item-12" title="Item 2.12" />
  //       <FinderItem compositeId="item-13" title="Item 2.13" />
  //       <FinderItem compositeId="item-14" title="Item 2.14" />
  //     </List>
  //   </div>
  // );
}
