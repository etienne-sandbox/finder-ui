import * as Ariakit from "@ariakit/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { Fragment, useCallback, useMemo } from "react";
import { FinderItem } from "../components/FinderItem";
import { PanelList } from "../components/PanelList";
import { homeData } from "../logic/data";
import { Panel, useFinderOrFail, usePanelOrFail } from "../logic/finderStore";

export function HomePanel() {
  const { navigate } = useFinderOrFail();
  const { $nextPanel, panelIndex } = usePanelOrFail();

  const { data } = useSuspenseQuery(homeData());
  console.log(data);

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

  const closePanelsAfter = useCallback(() => {
    navigate({ fromIndex: panelIndex, panels: null });
  }, [navigate, panelIndex]);

  return (
    <Panel className="w-full md:w-[500px]">
      <PanelList store={store} className="flex-1 h-full" onDeselect={closePanelsAfter}>
        <FinderItem
          compositeId="files"
          selectedId={activePanelKey}
          title="Files"
          onClick={() => navigate({ panels: { key: "files", state: {} }, fromIndex: panelIndex })}
        />
        <FinderItem
          compositeId="users"
          selectedId={activePanelKey}
          title="Users"
          onClick={() => navigate({ panels: { key: "users", state: {} }, fromIndex: panelIndex })}
        />

        {nextPanel?.key === "file" && (
          <Fragment>
            <Ariakit.CompositeSeparator />
            <FinderItem
              compositeId="file"
              selectedId="file"
              title={`File ${nextPanel.state.id}`}
              onClick={() =>
                navigate({ panels: { key: "file", state: { id: nextPanel.state.id } }, fromIndex: panelIndex })
              }
            />
          </Fragment>
        )}
      </PanelList>
    </Panel>
  );
}
