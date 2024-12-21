import { clsx, type ClassValue } from "clsx";
import { CSSProperties } from "react";
import { twMerge } from "tailwind-merge";
import colors from "tailwindcss/colors";

export const tw = String.raw;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type TColorShade = Record<keyof (typeof colors)["blue"], string>;

export function dynamicColors(shade: TColorShade): CSSProperties {
  return {
    "--color-dynamic-50": hexToSpaceSeparated(shade[50]),
    "--color-dynamic-100": hexToSpaceSeparated(shade[100]),
    "--color-dynamic-200": hexToSpaceSeparated(shade[200]),
    "--color-dynamic-300": hexToSpaceSeparated(shade[300]),
    "--color-dynamic-400": hexToSpaceSeparated(shade[400]),
    "--color-dynamic-500": hexToSpaceSeparated(shade[500]),
    "--color-dynamic-600": hexToSpaceSeparated(shade[600]),
    "--color-dynamic-700": hexToSpaceSeparated(shade[700]),
    "--color-dynamic-800": hexToSpaceSeparated(shade[800]),
    "--color-dynamic-900": hexToSpaceSeparated(shade[900]),
    "--color-dynamic-950": hexToSpaceSeparated(shade[950]),
  } as CSSProperties;
}

// #ffffff -> 255 255 255
function hexToSpaceSeparated(hex: string) {
  const int = parseInt(hex.slice(1), 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `${r} ${g} ${b}`;
}

export function pick<T extends string, Out>(value: T, options: Record<T, Out>): Out {
  return options[value];
}
