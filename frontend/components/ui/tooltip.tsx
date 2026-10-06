import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 overflow-hidden rounded-lg bg-slate-900/95 border border-white/15 px-3 py-1.5 text-xs font-medium text-slate-200 shadow-xl backdrop-blur-md whitespace-nowrap animate-in fade-in-0 zoom-in-95 pointer-events-none',
            sideClasses[side],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
