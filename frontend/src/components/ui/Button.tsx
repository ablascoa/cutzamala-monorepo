'use client';

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

export function Button({
  className,
  variant = 'filled',
  size = 'default',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-full text-label-large font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-38 disabled:pointer-events-none";
  
  const variants = {
    filled: "bg-primary-500 text-white shadow-elevation-0 hover:bg-primary-600 hover:shadow-elevation-1 active:bg-primary-700 dark:bg-primary-400 dark:hover:bg-primary-300",
    outlined: "border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 active:bg-primary-100 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950",
    text: "text-primary-500 bg-transparent hover:bg-primary-50 active:bg-primary-100 dark:text-primary-400 dark:hover:bg-primary-950",
    elevated: "bg-surface-100 text-primary-500 shadow-elevation-1 hover:shadow-elevation-2 hover:bg-surface-200 active:bg-surface-300 dark:bg-surface-800 dark:text-primary-400 dark:hover:bg-surface-700",
    tonal: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 dark:bg-secondary-800 dark:text-secondary-100 dark:hover:bg-secondary-700"
  };
  
  const sizes = {
    default: "h-10 px-6",
    sm: "h-8 px-4 text-label-medium",
    lg: "h-12 px-8 text-label-large"
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}