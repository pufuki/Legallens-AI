import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/format';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-navy-700 text-white hover:bg-navy-600 dark:bg-navy-600 dark:hover:bg-navy-500 shadow-soft',
  secondary: 'bg-slate-100 text-navy-800 hover:bg-slate-200 dark:bg-navy-800 dark:text-slate-100 dark:hover:bg-navy-700',
  ghost: 'text-navy-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-navy-800',
  outline: 'border border-slate-300 text-navy-800 hover:bg-slate-50 dark:border-navy-700 dark:text-slate-100 dark:hover:bg-navy-800',
  gold: 'bg-gold-400 text-navy-900 hover:bg-gold-300 shadow-glow font-semibold',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2.5',
};

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gold-400/40',
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
