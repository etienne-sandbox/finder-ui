/* SYNCED FILE */
import { ComponentPropsWithoutRef, forwardRef } from "react";
import { cn, pick, tw } from "../../styles/utils";
import { IconBox } from "../common/IconBox";
import { LoadingIcon } from "../common/LoadingIcon";
import { DesignContext } from "../core/DesignContext";

interface ButtonContentProps extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
  icon?: React.ReactNode;
  endIcon?: React.ReactNode;
  title?: React.ReactNode;
  details?: string | React.ReactNode;
  loading?: boolean;
}

export const ButtonContent = forwardRef<HTMLDivElement, ButtonContentProps>(function ButtonContent(
  { icon, endIcon, title, details, loading, className, ...props },
  ref,
) {
  const size = DesignContext.useProp("size");

  const hasIcon = Boolean(icon || loading);
  const hasEndIcon = Boolean(endIcon);

  const sizeClass = pick(size, {
    xs: tw`p-1`,
    sm: tw`p-1.5`,
    md: tw`p-1.5`,
    lg: tw`p-2.5`,
  });

  const iconSizeClass = pick(size, {
    xs: tw`p-0.5`,
    sm: tw`p-0.5 `,
    md: tw`p-1`,
    lg: tw`p-1`,
  });
  const iconClass = cn(tw`flex items-center justify-center rounded`, iconSizeClass);

  const startIconClass = cn(iconClass, tw`mr-auto`);
  const endIconClass = cn(iconClass, tw`ml-auto`);

  const textLeftSpace = pick(
    size,
    hasIcon
      ? { xs: tw`pl-1`, sm: tw`pl-1`, md: tw`pl-1.5`, lg: tw`pl-2` }
      : { xs: tw`pl-1.5`, sm: tw`pl-1.5`, md: tw`pl-2`, lg: tw`pl-2.5` },
  );

  const textRightSpace = pick(
    size,
    hasEndIcon
      ? { xs: tw`pr-0.5`, sm: tw`pr-0.5`, md: tw`pr-1`, lg: tw`pr-1` }
      : { xs: tw`pr-1.5`, sm: tw`pr-1.5`, md: tw`pr-2`, lg: tw`pr-2.5` },
  );

  const contentSizeClass = pick(size, {
    xs: tw`flex-row gap-1`,
    sm: tw`flex-row gap-2`,
    md: tw`flex-col -my-1.5`,
    lg: tw`flex-col -my-2.5`,
  });

  const contentClass = cn(
    tw`flex grow basis-6 justify-center overflow-hidden`,
    textLeftSpace,
    textRightSpace,
    contentSizeClass,
  );

  const titleClass = cn(tw`text-ellipsis whitespace-nowrap overflow-hidden flex-grow`);

  const detailsSizeClass = pick(size, {
    xs: tw``,
    sm: tw``,
    md: tw`text-xs -mt-1 mb-0.5`,
    lg: tw`text-base -mt-1`,
  });

  const detailsClass = cn(detailsSizeClass, tw`text-ellipsis whitespace-nowrap overflow-hidden opacity-60`);

  const iconSize = pick(size, { xs: 16, sm: 16, md: 20, lg: 26 });

  return (
    <div className={cn("flex-1 flex flex-row items-center max-w-full", sizeClass, className)} ref={ref} {...props}>
      {hasIcon && <IconBox size={iconSize} className={startIconClass} icon={loading ? <LoadingIcon /> : icon} />}
      {title && (
        <div className={contentClass}>
          <div className={titleClass}>{title}</div>
          {details && <div className={detailsClass}>{details}</div>}
        </div>
      )}
      {endIcon && <IconBox size={iconSize} className={endIconClass} icon={endIcon} />}
    </div>
  );
});
