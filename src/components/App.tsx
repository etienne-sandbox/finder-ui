import { useAtomValue } from "jotai";
import { useMemo } from "react";
import {
  FinderProvider,
  PANELS,
  Panel,
  PanelProvider,
  PanelStates,
  matchLocation,
  useFinderOrFail,
} from "../logic/finderStore";
import { FilePanel } from "../panels/File";
import { FilesPanel } from "../panels/Files";
import { HomePanel } from "../panels/Home";
import { UsersPanel } from "../panels/Users";
import { Finder } from "../shared/components/finder/Finder";

const PANELS_RENDERS: { [K in keyof PanelStates]: (state: PanelStates[K]) => React.ReactElement } = {
  home: () => <HomePanel />,
  files: () => <FilesPanel />,
  file: (state) => <FilePanel fileId={state.id} />,
  notFound: () => <Panel className="w-full">Not found</Panel>,
  user: (state) => <Panel className="w-full md:w-[600px]">User {state.id}</Panel>,
  users: () => <UsersPanel />,
};

export function App() {
  return (
    <FinderProvider panels={PANELS} matchLocation={matchLocation}>
      <AppInner />
    </FinderProvider>
  );
}

function AppInner() {
  const panels = useAtomValue(useFinderOrFail().$panelStates);

  const renderedPanels = useMemo(() => {
    return panels.map((panelState, panelIndex) => {
      const render = PANELS_RENDERS[panelState.key] as (state: PanelStates[keyof PanelStates]) => React.ReactElement;
      return (
        <PanelProvider panelIndex={panelIndex} key={`${panelState.key}-${panelIndex}`}>
          {render(panelState.state)}
        </PanelProvider>
      );
    });
  }, [panels]);

  return (
    <div className="fixed inset-0">
      <Finder className="absolute inset-4 rounded-md shadow-lg">{renderedPanels}</Finder>
    </div>
  );
}
