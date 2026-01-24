import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean; // Added for mobile responsiveness
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, children, ...props }, ref) => {
    // baseStyles now includes touch-action manipulation for better mobile feel
    const baseStyles = 'inline-flex items-center justify-center rounded-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-[0.98]';
    
    const variants = {
      primary: 'bg-brand-primary text-white hover:opacity-90 focus:ring-[color:var(--brand-primary)] shadow-sm',
      secondary: 'bg-white text-brand-primary border border-brand-primary hover:bg-brand-soft focus:ring-[color:var(--brand-primary)] shadow-sm',
      outline: 'border border-brand-primary bg-transparent text-brand-primary hover:bg-brand-soft/70 focus:ring-[color:var(--brand-primary)] shadow-sm',
      destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
      ghost: 'text-brand-primary hover:bg-brand-soft focus:ring-[color:var(--brand-primary)]'
    };

    const sizes = {
      // sm: Increased vertical padding slightly for mobile touch targets
      sm: 'px-3 py-2 md:py-1.5 text-sm',
      // md: standard size
      md: 'px-4 py-2.5 md:py-2 text-sm',
      // lg: larger for desktop, prominent on mobile
      lg: 'px-6 py-3.5 md:py-3 text-base'
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : 'w-auto', // Responsive width logic
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };