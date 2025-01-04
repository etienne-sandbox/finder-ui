import { MouseEvent } from "react";

export interface TDoubleTapOptions {
  thresholdMs?: number;
}

export type TDoubleTapResult = (event: MouseEvent) => void;

/**
 * Filter onClick events to only trigger on double taps.
 */
export function onDoubleTap(
  callback: (event: MouseEvent) => void,
  { thresholdMs = 500 }: TDoubleTapOptions = {}
): TDoubleTapResult {
  let lastTap = 0;

  return (event: MouseEvent) => {
    const now = new Date().getTime();
    const isDoubleTap = now - lastTap < thresholdMs;
    if (isDoubleTap) {
      lastTap = 0;
      return callback(event);
    }
    lastTap = now;
  };
}
