// components/icons/RightArrow.tsx
import * as React from "react";
import { IconProps } from "./types";

const RightArrow: React.FC<IconProps> = ({ className, ...props }) => (
  <>

<svg width="10" height="17" viewBox="0 0 10 17" fill="none" xmlns="http://www.w3.org/2000/svg"
className={className}
{...props}
>
<path d="M0.322499 0.321562C0.751249 -0.107188 1.4425 -0.107188 1.87125 0.321562L9.1425 7.59281C9.48375 7.93406 9.48375 8.48531 9.1425 8.82656L1.87125 16.0978C1.4425 16.5266 0.751249 16.5266 0.322499 16.0978C-0.106251 15.6691 -0.106251 14.9778 0.322499 14.5491L6.6575 8.20531L0.31375 1.86156C-0.10625 1.44156 -0.106251 0.741562 0.322499 0.321562Z" fill="white"/>
</svg>




  </>




);

export default RightArrow;

