import { type ReactNode } from 'react';
import { cn } from '@/utils/format';

type Tone = 'navy' | 'gold' | 'green' | 'red' | 'amber' | 'slate' | 'blue';

const tones: Record<Tone, string> = {
  navy: 'bg-navy-100 text-navy-700 dark:bg-navy-800 dark:text-navy-200',
  gold: 'bg-gold-100 text-gold-700 dark:bg-gold-900/40 dark:text-gold-300',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  slate: 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
};

export function Badge({ tone = 'slate', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', tones[tone], className)}>
      {children}
    </span>
  );
}
