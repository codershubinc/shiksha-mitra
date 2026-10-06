import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  glow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = false, children, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98] cursor-pointer whitespace-nowrap';

    const variants = {
      primary:
        'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-amber-900/30 border border-amber-500/30',
      secondary:
        'bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-950/40 border border-teal-500/30',
      outline:
        'border border-slate-700/80 bg-slate-900/40 text-slate-200 hover:bg-slate-800/80 hover:text-white hover:border-slate-600',
      glass:
        'bg-slate-900/60 backdrop-blur-xl border border-white/10 text-slate-200 hover:bg-slate-800/80 hover:border-amber-500/40 hover:text-white',
      ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/30',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
      lg: 'text-base px-6 py-3.5 rounded-2xl gap-2.5 font-semibold',
      icon: 'h-10 w-10 p-0 rounded-full',
    };

    const glowClass = glow ? 'shadow-[0_0_20px_rgba(245,158,11,0.35)]' : '';

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], glowClass, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
