// components/icons/LeftArrow.tsx
import * as React from "react";
import { IconProps } from "./types";

const LeftArrow: React.FC<IconProps> = ({ className, ...props }) => (
  <>

<svg width="10" height="17" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg"
className={className}
{...props}
>
<path d="M9.07594 0.321562C8.64719 -0.107188 7.95594 -0.107188 7.52719 0.321562L0.255938 7.59281C-0.0853125 7.93406 -0.0853125 8.48531 0.255938 8.82656L7.52719 16.0978C7.95594 16.5266 8.64719 16.5266 9.07594 16.0978C9.50469 15.6691 9.50469 14.9778 9.07594 14.5491L2.74094 8.20531L9.08469 1.86156C9.50469 1.44156 9.50469 0.741562 9.07594 0.321562Z" fill="white"/>
</svg>




  </>




);

export default LeftArrow;

