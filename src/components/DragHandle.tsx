import { cn, pick, tw } from "../utils/styles";

interface DragHandleProps extends React.ComponentPropsWithoutRef<"div"> {
  onMouseDown: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  className?: string;
  direction: "horizontal" | "vertical";
  active?: boolean;
  style?: React.CSSProperties;
}

export function DragHandle({ onMouseDown, className, direction, active = false, style, ...rest }: DragHandleProps) {
  const dirClasses = pick(direction, {
    vertical: tw`pl-1 pr-1 cursor-ew-resize -ml-1 -mr-1 my-3 py-1 rounded-full z-50 min-w-px shrink-0`,
    horizontal: tw`pt-1 pb-1 cursor-ns-resize -mt-1 -mb-1 mx-3 px-1 rounded-full z-50 min-h-px shrink-0`,
  });

  const innerDirClasses = pick(direction, {
    vertical: tw`w-px h-full bg-black`,
    horizontal: tw`h-px w-full bg-black`,
  });

  return (
    <div
      onMouseDown={onMouseDown}
      className={cn("border-none block hover:bg-white/5", dirClasses, active && "bg-white/5", className)}
      style={style}
      {...rest}
    >
      <div className={innerDirClasses} />
    </div>
  );
}
