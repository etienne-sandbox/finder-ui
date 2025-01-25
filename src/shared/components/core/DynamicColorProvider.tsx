/* SYNCED FILE */
import {
  ReactElement,
  Ref,
  RefAttributes,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import colors from "tailwindcss/colors";
import { useMergeRefs } from "../../hooks/useMergeRefs";
import { dynamicColors } from "../../styles/utils";

export type TDynamicColor = "blue" | "indigo" | "green" | "orange" | "teal" | "red" | "slate" | "rose" | "purple";

const DynamicColorContext = createContext<TDynamicColor>("blue");

interface DynamicColorProviderProps {
  color?: TDynamicColor;
  force?: boolean; // Force the color to be applied, usefull for portal
  children: React.ReactElement; // children must be a single element with a ref pointing to an html element
}

export const DynamicColorProvider = forwardRef<HTMLElement, DynamicColorProviderProps>(function DynamicColorProvider(
  { color, force, children },
  ref,
) {
  const localRef = useRef<HTMLElement | null>(null);
  const mergedRef = useMergeRefs(ref, localRef, getRefProperty(children));

  const childrenWithRef = useMemo(() => {
    const renderProps = { ...children.props, ref: mergedRef };
    return cloneElement(children, renderProps);
  }, [children, mergedRef]);

  const parentColor = useContext(DynamicColorContext);
  const currentColor = color ?? parentColor;
  const shouldUpdateContext = currentColor !== parentColor;
  const shouldSetColor = shouldUpdateContext || force;

  useLayoutEffect(() => {
    if (!shouldSetColor) return;
    const elem = localRef.current;
    if (!elem) return;
    const colorsVariables = dynamicColors(colors[currentColor]);
    Object.entries(colorsVariables).forEach(([key, value]) => {
      elem.style.setProperty(key, value);
    });
    return () => {
      Object.keys(colorsVariables).forEach((key) => {
        elem.style.removeProperty(key);
      });
    };
  }, [currentColor, shouldSetColor]);

  if (currentColor !== parentColor) {
    return <DynamicColorContext.Provider value={currentColor}>{childrenWithRef}</DynamicColorContext.Provider>;
  }

  return childrenWithRef;
});

function getRefProperty(element: unknown) {
  if (!isValidElementWithRef(element)) return null;
  return element.ref as Ref<any> | undefined;
}

function isValidElementWithRef<P>(element: unknown): element is ReactElement<P> & RefAttributes<any> {
  if (!element) return false;
  if (!isValidElement(element)) return false;
  if (!("ref" in element)) return false;
  return true;
}
