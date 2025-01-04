import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { FilesPanel } from "../panels/Files";
import { HomePanel } from "../panels/Home";
import { Finder } from "../shared/components/finder/Finder";
import { BASE_PANELS, FinderProvider, Panel, PanelProvider, PanelStates, useFinderOrFail } from "../stores/finderStore";

const PANELS_RENDERS: { [K in keyof PanelStates]: (state: PanelStates[K]) => React.ReactElement } = {
  home: () => <HomePanel />,
  files: () => <FilesPanel />,
  file: (state) => (
    <Panel className="w-full md:w-[600px]" key={state.id}>
      File {state.id}
    </Panel>
  ),
  notFound: () => <Panel className="w-full">Not found</Panel>,
  user: (state) => <Panel className="w-full md:w-[600px]">User {state.id}</Panel>,
  users: (state) => <Panel className="w-full md:w-[600px]">Users {state.search}</Panel>,
};

export function App() {
  return (
    <FinderProvider panels={BASE_PANELS}>
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

  return <Finder className="fixed inset-4 rounded-md shadow-lg">{renderedPanels}</Finder>;
}
