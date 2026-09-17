// components/icons/XIcon.tsx
import * as React from "react";
import { IconProps } from "./types";

const XIcon: React.FC<IconProps> = ({ className, ...props }) => (


<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"
className={className}
{...props}
>
<path d="M10.5222 7.77491L16.4785 1H15.0671L9.89516 6.88256L5.76437 1H1L7.24656 9.89547L1 17H2.41155L7.87321 10.7878L12.2356 17H17L10.5218 7.77491H10.5222ZM8.58887 9.97384L7.95596 9.08805L2.92015 2.03974H5.0882L9.15216 7.72795L9.78507 8.61374L15.0677 16.0075H12.8997L8.58887 9.97418V9.97384Z" fill="white"/>
</svg>





);

export default XIcon;

