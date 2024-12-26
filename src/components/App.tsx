import { BASE_PANELS, FinderProvider } from "../stores/finderStore";
import { Finder } from "./Finder";

export function App() {
  return (
    <FinderProvider panels={BASE_PANELS}>
      <Finder />
    </FinderProvider>
  );
}
