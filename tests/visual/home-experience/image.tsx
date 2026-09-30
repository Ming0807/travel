import type { ImgHTMLAttributes } from "react";
import FixtureImage from "../routes/image";

type Props = ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; preload?: boolean; unoptimized?: boolean };
export default function HomeFixtureImage({ preload, priority, unoptimized: _unoptimized, ...props }: Props) {
  return <FixtureImage {...props} priority={preload || priority} fetchPriority={preload || priority ? "high" : props.fetchPriority} />;
}
