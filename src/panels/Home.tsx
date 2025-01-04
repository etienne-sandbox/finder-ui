import * as Ariakit from "@ariakit/react";
import { useAtomValue } from "jotai";
import { Fragment, useMemo } from "react";
import { FinderItem } from "../components/FinderItem";
import { PanelList } from "../components/PanelList";
import { Panel, usePanelOrFail } from "../stores/finderStore";

export function HomePanel() {
  const { $nextPanel, openPanel, closePanelsAfter } = usePanelOrFail();

  const nextPanel = useAtomValue($nextPanel);

  const activePanelKey = useMemo(() => {
    switch (nextPanel?.key) {
      case "files":
        return "files" as const;
      case "users":
        return "users" as const;
      default:
        return null;
    }
  }, [nextPanel?.key]);

  const store = Ariakit.useSelectStore({ orientation: "vertical" });

  return (
    <Panel className="w-full md:w-[500px]">
      <PanelList store={store} className="flex-1 h-full" onDeselect={closePanelsAfter}>
        <FinderItem
          compositeId="files"
          selectedId={activePanelKey}
          title="Files"
          onClick={() => openPanel({ key: "files", state: {} })}
        />
        <FinderItem
          compositeId="users"
          selectedId={activePanelKey}
          title="Users"
          onClick={() => openPanel({ key: "users", state: {} })}
        />

        {nextPanel?.key === "file" && (
          <Fragment>
            <Ariakit.CompositeSeparator />
            <FinderItem
              compositeId="file"
              selectedId="file"
              title={`File ${nextPanel.state.id}`}
              onClick={() => openPanel({ key: "file", state: { id: nextPanel.state.id } })}
            />
          </Fragment>
        )}
      </PanelList>
    </Panel>
  );
}
