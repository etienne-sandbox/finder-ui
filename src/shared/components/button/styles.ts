/* SYNCED FILE */
import { cn, pick, tw } from "../../styles/utils";
import { TDesignRounded, TDesignSize, TDesignVariant } from "../core/DesignContext";

export function buttonSizeClass(size: TDesignSize) {
  return pick(size, {
    xs: tw`text-sm min-h-7 min-w-7`,
    sm: tw`text-sm min-h-8 min-w-8`,
    md: tw`text-base min-h-10 min-w-10`,
    lg: tw`text-lg min-h-14 min-w-14`,
  });
}

export function buttonRoundedClass(rounded: TDesignRounded) {
  return pick(rounded, {
    start: tw`rounded-l-md`,
    end: tw`rounded-r-md`,
    none: tw``,
    all: tw`rounded-md`,
  });
}

export interface ButtonStylesParams {
  size: TDesignSize;
  variant: TDesignVariant;
  rounded: TDesignRounded;
  interactive: boolean;
  forceHover: boolean;
  forceActive: boolean;
}

export function buttonClassName({ size, variant, rounded, interactive, forceHover, forceActive }: ButtonStylesParams) {
  const variantClassBase = pick(variant, {
    primary: cn(tw`bg-dynamic-600 text-white`),
    secondary: cn(tw`bg-white/5 text-dynamic-200`),
    tertiary: cn(tw`bg-transparent text-white`),
  });

  const variantClassInteractive = pick(variant, {
    primary: cn(
      tw`hover:bg-dynamic-500`,
      forceHover && tw`bg-dynamic-500`,
      tw`active:bg-dynamic-700`,
      forceActive && tw`bg-dynamic-700`,
      tw`data-focus-visible:ring-dynamic-100 data-focus-visible:ring-2`,
      tw`aria-disabled:bg-dynamic-700 aria-disabled:text-white/50 aria-disabled:ring-dynamic-500/30`,
    ),
    secondary: cn(
      tw`hover:bg-dynamic-600 hover:text-white`,
      forceHover && tw`bg-dynamic-600 text-white`,
      tw`active:bg-dynamic-700 active:text-white`,
      forceActive && tw`bg-dynamic-700 text-white`,
      tw`data-focus-visible:ring-dynamic-400 data-focus-visible:ring-2`,
      tw`aria-disabled:bg-white/5 aria-disabled:text-dynamic-200/50 aria-disabled:ring-dynamic-500/50`,
    ),
    tertiary: cn(
      tw`hover:bg-white/5 hover:text-dynamic-300`,
      forceHover && tw`bg-white/5 text-dynamic-300`,
      tw`active:bg-dynamic-700 active:text-white`,
      forceActive && tw`bg-dynamic-700 text-white`,
      tw`data-focus-visible:ring-dynamic-400 data-focus-visible:ring-2`,
      // Focus style is same as hover
      tw`data-focus-visible:bg-white/5 data-focus-visible:text-dynamic-300`,
      // We need to also apply active style
      tw`data-focus-visible:active:bg-dynamic-700 data-focus-visible:active:text-white`,
      tw`aria-disabled:text-dynamic-200/40 aria-disabled:ring-dynamic-700/50`,
    ),
  });

  return cn(
    tw`flex flex-row items-center justify-center text-left group overflow-hidden relative`,
    tw`outline-none`,
    buttonRoundedClass(rounded),
    buttonSizeClass(size),
    variantClassBase,
    interactive && variantClassInteractive,
    tw`disabled:cursor-not-allowed data-focus-visible:z-10`,
  );
}

export const BUTTON_ICON_SIZE: Record<TDesignSize, number> = {
  xs: 16,
  sm: 18,
  md: 20,
  lg: 26,
};
