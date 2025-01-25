/* SYNCED FILE */
import { IconContext, IconProps } from "@phosphor-icons/react";
import { Fragment, useContext } from "react";
import { pick } from "../../styles/utils";

export function LoadingIcon(props: IconProps) {
  const iconProps = useContext(IconContext);
  const size = props.size ?? iconProps?.size;
  const weight = props.weight ?? iconProps?.weight ?? "regular";
  const color = props.color ?? iconProps?.color ?? "currentColor";

  const strokeWidth = pick(weight, {
    thin: 8,
    light: 12,
    regular: 16,
    bold: 24,
    duotone: 16,
    fill: 16,
  });

  const bgStrokeWidth = weight === "duotone" ? 28 : strokeWidth;
  const bgFill = weight === "duotone" ? color : "none";

  return (
    <div role="status">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        ria-hidden="true"
        className="animate-spin"
        fill="none"
        style={{ width: size, height: size }}
        viewBox="0 0 256 256"
      >
        <path fill="none" d="M0 0H256V256H0z"></path>
        {weight === "fill" ? (
          <path
            d="M128 24a104 104 0 10104 104A104.11 104.11 0 00128 24zm0 176A72 72 0 0192 65.64a8 8 0 018 13.85 56 56 0 1056 0 8 8 0 018-13.85A72 72 0 01128 200z"
            fill={color}
          />
        ) : (
          <Fragment>
            <path
              fill="none"
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={strokeWidth}
              d="M 128 32 A 96 96 0 0 1 224 128"
            />
            <circle cx="128" cy="128" r="96" stroke={color} strokeWidth={bgStrokeWidth} fill={bgFill} opacity={0.2} />
          </Fragment>
        )}
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
