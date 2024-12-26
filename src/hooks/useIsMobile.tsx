import { useMediaQuery } from "./useMediaQuery";

export function useIsMobile() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const isMobile = !isDesktop;
  return isMobile;
}
