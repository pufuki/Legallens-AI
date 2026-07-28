import { Scale } from 'lucide-react';
import { cn } from '@/utils/format';

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-navy-800 dark:bg-navy-700 shadow-soft">
          <Scale className="w-5 h-5 text-gold-400" strokeWidth={2.2} />
        </div>
        <div className="absolute -inset-0.5 rounded-xl bg-gold-400/20 blur-md -z-10" />
      </div>
      {showText && (
        <div className="leading-none">
          <span className="font-serif text-lg font-semibold text-navy-900 dark:text-slate-100">LegalLens</span>
          <span className="ml-1 text-xs font-medium text-gold-500">AI</span>
        </div>
      )}
    </div>
  );
}
