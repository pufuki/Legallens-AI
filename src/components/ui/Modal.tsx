import { type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/format';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative glass-strong rounded-2xl shadow-float max-w-lg w-full max-h-[85vh] overflow-y-auto', className)}>
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-navy-800">
            <h3 className="font-serif text-lg font-semibold text-navy-900 dark:text-slate-100">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
