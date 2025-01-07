import { useSuspenseQuery } from "@tanstack/react-query";
import { fileData } from "../logic/data";
import { Panel } from "../logic/finderStore";

export function FilePanel({ fileId }: { fileId: string }) {
  const { data } = useSuspenseQuery(fileData(fileId));
  console.log(data);

  return <Panel className="w-full min-w-[300px] md:w-[600px]">Hey from file {fileId}</Panel>;
}
