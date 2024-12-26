import * as Ariakit from "@ariakit/react";
import { useCallback } from "react";
import { FinderItem } from "../components/FinderItem";
import { Panel } from "../components/Panel";
import { PanelList } from "../components/PanelList";
import { usePanelUtils } from "../stores/finderStore";

export function FilesPanel() {
  const { isActive, isSelected, openPanel } = usePanelUtils("files");

  const store = Ariakit.useCompositeStore({
    orientation: "vertical",
    activeId: isSelected ? null : undefined,
  });

  const onNavigate = useCallback(
    (itemId: string) => {
      openPanel({ key: "file", state: { id: itemId } });
    },
    [openPanel]
  );

  // useEffect(() => {
  //   if (isActive) {
  //     // activate
  //     if (selectedIdRef.current) {
  //       store.setActiveId(selectedIdRef.current);
  //     } else {
  //       store.first();
  //     }
  //     return;
  //   }
  //   if (!isSelected) {
  //     // deactivate
  //     store.setActiveId(null);
  //     return;
  //   }
  //   // deactivate
  //   if (store.getState().activeId) {
  //     setSelectedId(store.getState().activeId);
  //   }
  // }, [isActive, isSelected, selectedIdRef, store]);

  return (
    <Panel className="flex flex-col">
      <div>{JSON.stringify({ isActive, isSelected })}</div>
      <PanelList
        store={store}
        className="flex-1"
        onNext={() => {
          const activeId = store.getState().activeId;
          if (activeId) {
            onNavigate(activeId);
          }
        }}
      >
        <FinderItem compositeId="a" title="Item A" onClick={() => onNavigate("a")} />
        <FinderItem compositeId="b" title="Item B" onClick={() => onNavigate("b")} />
        <FinderItem compositeId="c" title="Item C" onClick={() => onNavigate("c")} />
        <FinderItem compositeId="d" title="Item D" onClick={() => onNavigate("d")} />
      </PanelList>
    </Panel>
  );
}
