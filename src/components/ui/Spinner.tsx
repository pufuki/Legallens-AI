import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/format';

export function Spinner({ className, size = 20 }: { className?: string; size?: number }) {
  return <Loader2 className={cn('animate-spin text-gold-500', className)} size={size} />;
}

export function LoadingDots({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-gold-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('rounded-lg bg-slate-200/70 dark:bg-navy-800/70 shimmer', className)} />;
}
