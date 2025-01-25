/* SYNCED FILE */
import * as Ariakit from "@ariakit/react";
import { IconContext } from "@phosphor-icons/react";
import { ComponentPropsWithoutRef, forwardRef, useMemo } from "react";
import { Merge } from "type-fest";
import { cn, pick, TInteractiveState } from "../../styles/utils";
import { DesignContext, TDesignRounded, TDesignSize, TDesignVariant } from "../core/DesignContext";
import { DynamicColorProvider, TDynamicColor } from "../core/DynamicColorProvider";
import { ButtonContent } from "./ButtonContent";
import { BUTTON_ICON_SIZE, buttonClassName } from "./styles";

export type ButtonProps = Merge<
  ComponentPropsWithoutRef<"button">,
  {
    // Design
    color?: TDynamicColor;
    size?: TDesignSize;
    variant?: TDesignVariant;
    rounded?: TDesignRounded;
    disabled?: boolean;
    __forceState?: null | TInteractiveState;

    // For content
    icon?: React.ReactNode;
    endIcon?: React.ReactNode;
    title?: React.ReactNode;
    details?: string | React.ReactNode;
    loading?: boolean;

    // Forward to Button
    render?: React.ReactElement;
  }
>;

export const Button = forwardRef((inProps: ButtonProps, ref: React.Ref<HTMLButtonElement>) => {
  const {
    color,
    rounded,
    size,
    variant,
    disabled,
    __forceState,

    title,
    icon,
    endIcon,
    details,
    loading,
    children,

    className,
    type = "button",
    ...buttonProps
  } = DesignContext.useProps(inProps);

  const childrenResolved = children ?? <ButtonContent {...{ title, icon, endIcon, details, loading }} />;

  const forceHover = __forceState === "hover";
  const forceActive = __forceState === "active";
  const forceFocus = __forceState === "focus";

  const mainClass = useMemo(
    () => buttonClassName({ size, variant, rounded, interactive: true, forceActive, forceHover }),
    [size, variant, rounded, forceActive, forceHover],
  );

  const iconProps = useMemo(() => ({ size: pick(size, BUTTON_ICON_SIZE) }), [size]);

  return (
    <DesignContext.Provider rounded={rounded} size={size} variant={variant} disabled={disabled}>
      <IconContext.Provider value={iconProps}>
        <DynamicColorProvider color={color}>
          <Ariakit.Button
            ref={ref}
            className={cn(mainClass, className)}
            disabled={disabled}
            type={type}
            {...(forceFocus ? { "data-focus-visible": true } : {})}
            {...buttonProps}
          >
            {childrenResolved}
          </Ariakit.Button>
        </DynamicColorProvider>
      </IconContext.Provider>
    </DesignContext.Provider>
  );
});
