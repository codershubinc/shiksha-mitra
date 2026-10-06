import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ className, size = 'md', children, ...props }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-xl',
  };

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full ring-2 ring-white/10 shadow-md',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AvatarImage({
  src,
  alt = 'Avatar',
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [error, setError] = React.useState(false);

  if (error || !src) return null;

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-orange-600 font-bold text-white',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
