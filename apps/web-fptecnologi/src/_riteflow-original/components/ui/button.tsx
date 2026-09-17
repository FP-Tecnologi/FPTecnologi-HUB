import * as React from "react";
import Link from "next/link";
import { cn } from "@riteflow/lib/utils";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /**
   * Button visual variant
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "gradient" | "outline" | "ghost";
  /**
   * Button size
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * If provided, renders as Link component
   */
  href?: string;
  /**
   * Makes button full width
   */
  fullWidth?: boolean;
  /**
   * Shows loading state
   */
  loading?: boolean;
  /**
   * Button type (only for button element, not Link)
   * @default "button"
   */
  type?: "button" | "submit" | "reset";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      href,
      fullWidth = false,
      loading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    // Base styles for all variants
    const baseStyles = "inline-flex items-center justify-center font-medium leading-normal rounded-[10px] relative z-1 overflow-hidden text-center transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    // Variant styles
    const variants = {
      primary: cn(
        "button-primary inline-flex items-center justify-center px-[22px] py-3 text-white font-medium text-sm leading-normal rounded-[10px] relative z-1 overflow-hidden text-center"
      ),
      secondary: cn(
        "button-secondary text-secondary"
      ),
      gradient: cn(
        "bg-gradient-to-b from-slateBlue to-royalBlue text-white",
        "hover:from-royalBlue hover:to-slateBlue"
      ),
      outline: cn(
        "bg-charcoalBlue border-[1.5px] border-tertiary text-tertiary",
        "hover:bg-charcoalBlue/80 hover:border-tertiary/80"
      ),
      ghost: cn(
        "bg-transparent text-white hover:bg-white/10"
      ),
    };

    // Size styles
    const sizes = {
      sm: "px-4 py-2 text-xs",
      md: "px-[22px] py-3 text-sm",
      lg: "px-6 py-4 text-base",
    };

    // Outline variant has custom padding, others use size-based padding
    const paddingStyles = variant === "outline" 
      ? "py-[6px] px-3 text-sm tracking-[-.1px]"
      : sizes[size];

    const combinedClassName = cn(
      baseStyles,
      variants[variant],
      paddingStyles,
      fullWidth && "w-full",
      loading && "cursor-wait",
      className
    );

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    // Content with loading state
    const content = (
      <>
        {loading && <LoadingSpinner />}
        {children}
      </>
    );

    // If href is provided, render as Link
    if (href) {
      return (
        <Link
          href={href}
          className={combinedClassName}
          aria-disabled={disabled || loading}
          {...(disabled || loading ? { onClick: (e) => e.preventDefault() } : {})}
        >
          {content}
        </Link>
      );
    }

    // Render as button
    return (
      <button
        className={combinedClassName}
        ref={ref}
        type={type}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };

