import * as Ariakit from "@ariakit/react";
import { FinderItem } from "../components/FinderItem";
import { Panel } from "../components/Panel";
import { PanelList } from "../components/PanelList";
import { HomeActiveId, usePanelUtils } from "../stores/finderStore";

export function HomePanel() {
  const { isActive, isSelected, state, updateState, openPanel } = usePanelUtils("home");

  const store = Ariakit.useCompositeStore({
    orientation: "vertical",
    activeId: isSelected ? null : state.activeId,
    setActiveId: (id) => updateState((p) => ({ ...p, activeId: id as HomeActiveId })),
  });

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
        tabIndex={isActive ? 0 : -1}
        onNext={() => {
          const activeId = store.getState().activeId;
          if (activeId) {
            switch (activeId) {
              case "files":
                openPanel({ key: "files", state: {} });
                break;
              case "users":
                openPanel({ key: "users", state: {} });
                break;
            }
          }
        }}
      >
        <FinderItem
          selected={isSelected && state.activeId === "files"}
          compositeId="files"
          title="Files"
          onClick={() => openPanel({ key: "files", state: {} })}
        />
        <FinderItem
          selected={isSelected && state.activeId === "users"}
          compositeId="users"
          title="Users"
          onClick={() => openPanel({ key: "users", state: {} })}
        />
      </PanelList>
    </Panel>
  );
}
