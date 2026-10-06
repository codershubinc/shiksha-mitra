import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'success'
    | 'saffron'
    | 'teal'
    | 'glass';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variants = {
    default:
      'bg-slate-800 text-slate-200 border-white/10 hover:bg-slate-700',
    secondary:
      'bg-teal-500/15 text-teal-300 border-teal-500/30 hover:bg-teal-500/25',
    outline:
      'border-white/15 text-slate-300 bg-transparent',
    destructive:
      'bg-rose-500/15 text-rose-300 border-rose-500/30',
    success:
      'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    saffron:
      'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    teal:
      'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]',
    glass:
      'bg-slate-900/60 backdrop-blur-md text-slate-200 border-white/10 shadow-sm',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
