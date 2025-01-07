import * as Ariakit from "@ariakit/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { atom, useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { FinderItem } from "../components/FinderItem";
import { PanelList } from "../components/PanelList";
import { usersData } from "../logic/data";
import { Panel, usePanelOrFail } from "../logic/finderStore";

export function UsersPanel() {
  const { $nextPanel, openPanel, closePanelsAfter } = usePanelOrFail();

  const { data } = useSuspenseQuery(usersData());
  console.log(data);

  const $activeFileId = useMemo(
    () =>
      atom((get) => {
        const nextPanel = get($nextPanel);
        if (nextPanel?.key === "user") {
          return nextPanel.state.id;
        }
        return null;
      }),
    [$nextPanel]
  );

  const activeFileId = useAtomValue($activeFileId);

  const store = Ariakit.useSelectStore({ orientation: "vertical" });

  const onNavigate = useCallback(
    (itemId: string) => {
      openPanel({ key: "user", state: { id: itemId } });
    },
    [openPanel]
  );

  return (
    <Panel className="w-full min-w-[300px] md:w-[600px]">
      <PanelList store={store} className="flex-1 min-h-full" onDeselect={closePanelsAfter}>
        <FinderItem compositeId="a" selectedId={activeFileId} title="Item A" onClick={() => onNavigate("a")} />
        <FinderItem compositeId="b" selectedId={activeFileId} title="Item B" onClick={() => onNavigate("b")} />
        <FinderItem compositeId="c" selectedId={activeFileId} title="Item C" onClick={() => onNavigate("c")} />
        <FinderItem compositeId="d" selectedId={activeFileId} title="Item D" onClick={() => onNavigate("d")} />
        <FinderItem compositeId="e" selectedId={activeFileId} title="Item E" onClick={() => onNavigate("e")} />
        <FinderItem compositeId="f" selectedId={activeFileId} title="Item F" onClick={() => onNavigate("f")} />
        <FinderItem compositeId="g" selectedId={activeFileId} title="Item G" onClick={() => onNavigate("g")} />
        <FinderItem compositeId="h" selectedId={activeFileId} title="Item H" onClick={() => onNavigate("h")} />
        <FinderItem compositeId="i" selectedId={activeFileId} title="Item I" onClick={() => onNavigate("i")} />
        <FinderItem compositeId="j" selectedId={activeFileId} title="Item J" onClick={() => onNavigate("j")} />
        <FinderItem compositeId="k" selectedId={activeFileId} title="Item K" onClick={() => onNavigate("k")} />
        <FinderItem compositeId="l" selectedId={activeFileId} title="Item L" onClick={() => onNavigate("l")} />
        <FinderItem compositeId="m" selectedId={activeFileId} title="Item M" onClick={() => onNavigate("m")} />
        <FinderItem compositeId="n" selectedId={activeFileId} title="Item N" onClick={() => onNavigate("n")} />
        <FinderItem compositeId="o" selectedId={activeFileId} title="Item O" onClick={() => onNavigate("o")} />
        <FinderItem compositeId="p" selectedId={activeFileId} title="Item P" onClick={() => onNavigate("p")} />
        <FinderItem compositeId="q" selectedId={activeFileId} title="Item Q" onClick={() => onNavigate("q")} />
        <FinderItem compositeId="r" selectedId={activeFileId} title="Item R" onClick={() => onNavigate("r")} />
        <FinderItem compositeId="s" selectedId={activeFileId} title="Item S" onClick={() => onNavigate("s")} />
        <FinderItem compositeId="t" selectedId={activeFileId} title="Item T" onClick={() => onNavigate("t")} />
        <FinderItem compositeId="u" selectedId={activeFileId} title="Item U" onClick={() => onNavigate("u")} />
        <FinderItem compositeId="v" selectedId={activeFileId} title="Item V" onClick={() => onNavigate("v")} />
        <FinderItem compositeId="w" selectedId={activeFileId} title="Item W" onClick={() => onNavigate("w")} />
        <FinderItem compositeId="x" selectedId={activeFileId} title="Item X" onClick={() => onNavigate("x")} />
        <FinderItem compositeId="y" selectedId={activeFileId} title="Item Y" onClick={() => onNavigate("y")} />
        <FinderItem compositeId="z" selectedId={activeFileId} title="Item Z" onClick={() => onNavigate("z")} />
      </PanelList>
    </Panel>
  );
}
