/* SYNCED FILE */
import { nanoid } from "nanoid";
import { useState } from "react";
import { Button } from "../components/button/Button";
import { Finder } from "./Finder";
import { FinderPanel } from "./FinderPanel";

export default function FinderPlayground() {
  const [keys, setKeys] = useState<string[]>([nanoid()]);

  const open = (fromIndex: number) => () => {
    setKeys((prev) => [...prev.slice(0, fromIndex + 1), nanoid()]);
  };

  const reset = (fromIndex: number) => () => {
    setKeys((prev) => prev.slice(0, fromIndex + 1));
  };

  const close = (fromIndex: number) => () => {
    setKeys((prev) => prev.slice(0, fromIndex));
  };

  return (
    <div className="absolute inset-0">
      <Finder className="h-full w-full rounded-lg shadow-lg absolute inset-0">
        {keys.map((key, i) => (
          <FinderPanel key={key} className="w-full md:w-[600px]" isActive={i === keys.length - 1}>
            <div className="flex flex-col gap-2 p-2">
              <Button onClick={open(i)} title="Open" />
              <Button onClick={reset(i)} title="Reset" />
              {i > 0 && <Button onClick={close(i)} title="Close" />}
            </div>
            <PanelContent />
          </FinderPanel>
        ))}
      </Finder>
    </div>
  );
}

function PanelContent() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-2 p-2">
      <Button onClick={() => setExpanded((prev) => !prev)} title={expanded ? "Collapse" : "Expand"} />
      {expanded && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white/10 rounded-md h-40" />
          ))}
        </div>
      )}
    </div>
  );
}
