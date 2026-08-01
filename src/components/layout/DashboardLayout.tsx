import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sparkles } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';

interface DashboardLayoutProps {
  children: ReactNode;
  action?: ReactNode;
}

export function DashboardLayout({ children, action }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-navy-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 glass border-b border-slate-200 dark:border-navy-800">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-600 dark:text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span>AI analysis runs locally — your documents never leave your browser</span>
            </div>
            <div className="flex items-center gap-3">
              {action}
              <Link to="/upload">
                <Button variant="gold" size="sm">
                  <Sparkles className="w-4 h-4" />
                  New Analysis
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
        <footer className="px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-600 border-t border-slate-200 dark:border-navy-800">
          LegalLens AI · For demonstration only — not legal advice · {theme} mode
        </footer>
      </div>
    </div>
  );
}
