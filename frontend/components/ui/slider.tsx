import React from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (val: number) => void;
  label?: string;
}

export function Slider({
  className,
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  label,
  ...props
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange?.(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
        aria-label={label || 'Slider'}
        {...props}
      />
    </div>
  );
}
