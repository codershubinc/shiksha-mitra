import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'info' | 'warning' | 'destructive' | 'success';
}

export function Alert({
  className,
  variant = 'default',
  children,
  ...props
}: AlertProps) {
  const variants = {
    default: 'bg-slate-900/70 border-white/10 text-slate-200',
    info: 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200 [&>svg]:text-cyan-400',
    warning: 'bg-amber-950/40 border-amber-500/30 text-amber-200 [&>svg]:text-amber-400',
    destructive: 'bg-rose-950/40 border-rose-500/30 text-rose-200 [&>svg]:text-rose-400',
    success: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200 [&>svg]:text-emerald-400',
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-2xl border p-4 backdrop-blur-xl [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-slate-200 [&>svg~*]:pl-7',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn('mb-1 font-headline font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h5>
  );
}

export function AlertDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={cn('text-xs md:text-sm text-slate-300 leading-relaxed [&_p]:leading-relaxed', className)} {...props}>
      {children}
    </div>
  );
}
