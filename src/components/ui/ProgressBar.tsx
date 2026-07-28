import { type ReactNode } from 'react';
import { cn } from '@/utils/format';

export function ProgressBar({ value, max = 100, className, tone = 'gold' }: { value: number; max?: number; className?: string; tone?: 'gold' | 'navy' | 'green' | 'red' | 'amber' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const tones = {
    gold: 'bg-gold-400',
    navy: 'bg-navy-600',
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
  };
  return (
    <div className={cn('h-2 w-full rounded-full bg-slate-200 dark:bg-navy-800 overflow-hidden', className)}>
      <div className={cn('h-full rounded-full transition-all duration-700 ease-out', tones[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Stat({ label, value, icon, tone = 'navy' }: { label: string; value: ReactNode; icon?: ReactNode; tone?: 'navy' | 'gold' | 'green' | 'red' | 'amber' }) {
  const tones = {
    navy: 'text-navy-700 dark:text-navy-200',
    gold: 'text-gold-600 dark:text-gold-300',
    green: 'text-emerald-600 dark:text-emerald-300',
    red: 'text-red-600 dark:text-red-300',
    amber: 'text-amber-600 dark:text-amber-300',
  };
  return (
    <div className="flex items-center gap-3">
      {icon && <div className={cn('flex-shrink-0', tones[tone])}>{icon}</div>}
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
        <p className={cn('text-lg font-semibold', tones[tone])}>{value}</p>
      </div>
    </div>
  );
}
