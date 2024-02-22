import Image, { ImageProps } from "next/image";
import spinnerLightSvg from "@/../public/spinner-light.svg";
import spinnerDarkSvg from "@/../public/spinner-dark.svg";

/**
 * spinners taken from: https://www.svgbackgrounds.com/elements/animated-svg-preloaders/
 */

export function LoadingSpinner({
  visible,
  isDark = true,
  width = 40,
  ...props
}: Partial<ImageProps> & { visible?: boolean; isDark?: boolean }) {
  if (!visible) return null;
  return (
    <Image
      {...props}
      width={width}
      src={isDark ? spinnerDarkSvg : spinnerLightSvg}
      alt=""
    />
  );
}
