import React from 'react';
import { cn } from '@riteflow/lib/utils';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * The heading level (h1, h2, h3, h4, h5, h6)
   * 
   * @example
   * // Main page title (for SEO)
   * <Heading as="h1">Welcome</Heading>
   * 
   * // Section heading (default)
   * <Heading as="h2">Get Demo</Heading>
   * 
   * // Subsection
   * <Heading as="h3">Features</Heading>
   * 
   * @default 'h2'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /**
   * Size variant for the heading
   * 
   * @example
   * // Hero section - the largest
   * <Heading size="xl">Hero Title</Heading>
   * 
   * // Regular section (default)
   * <Heading size="default">Section Title</Heading>
   * 
   * // Cards, small sections
   * <Heading size="small">Card Title</Heading>
   * 
   * @default 'default'
   */
  size?: 'small' | 'default' | 'large' | 'xl';
  /**
   * Whether to apply gradient text effect
   * @default true
   */
  gradient?: boolean;
  /**
   * Children content
   */
  children: React.ReactNode;
}

const sizeClasses = {
  small: 'text-2xl sm:text-3xl lg:text-4xl',
  default: 'text-3xl sm:text-4xl lg:text-5xl xl:text-[51px]',
  large: 'text-4xl sm:text-5xl lg:text-6xl xl:text-[64px]',
  xl: 'text-5xl sm:text-6xl lg:text-7xl xl:text-[80px]',
};

const Heading: React.FC<HeadingProps> = ({
  as: Component = 'h2',
  size = 'default',
  gradient = true,
  className,
  children, // children = component inside the content
  ...props // ...props = all other HTML attributes (id, data-*, onClick, etc.)
}) => {
  return (
    <Component
      className={cn(
        gradient && 'gradient-text',
        sizeClasses[size],
        'font-semibold -tracking-[0.4px] !leading-[1.1]',
        className
      )}
      {...props} // pass all HTML attributes (id, data-title, onClick, etc.)
    >
      {children} {/* children = component inside the content */}
    </Component>
  );
};

export default Heading;

