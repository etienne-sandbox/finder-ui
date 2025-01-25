/* SYNCED FILE */
import { IconContext, IconWeight } from "@phosphor-icons/react";
import { useContext, useMemo } from "react";
import { cn } from "../../styles/utils";

interface IconBoxProps {
  icon: React.ReactNode;
  alt?: string;
  color?: string;
  size?: string | number;
  weight?: IconWeight;
  mirrored?: boolean;
  className?: string;
}

export function IconBox({ icon, alt, color, size, weight, mirrored, className }: IconBoxProps) {
  const parentIconProps = useContext(IconContext);
  const mergedProps = useMemo(
    () => ({
      ...parentIconProps,
      alt: alt || parentIconProps.alt,
      color: color || parentIconProps.color,
      size: size || parentIconProps.size,
      weight: weight || parentIconProps.weight,
      mirrored: mirrored || parentIconProps.mirrored,
    }),
    [parentIconProps, alt, color, size, weight, mirrored],
  );

  return (
    <IconContext.Provider value={mergedProps}>
      <div
        className={cn("flex items-center shrink-0", className)}
        style={{ minWidth: mergedProps.size, minHeight: mergedProps.size }}
      >
        {icon}
      </div>
    </IconContext.Provider>
  );
}
