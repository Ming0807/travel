/* eslint-disable @next/next/no-img-element */
import { forwardRef, type ImgHTMLAttributes } from "react";
type FixtureImageProps = ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; preload?: boolean; unoptimized?: boolean };
export default forwardRef<HTMLImageElement, FixtureImageProps>(function FixtureImage({ fill, priority, preload, unoptimized: _unoptimized, style, alt, ...props }, ref) {
  return <img {...props} alt={alt} ref={ref} loading={priority || preload ? "eager" : "lazy"} style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style} />;
});
