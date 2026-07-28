import { Link } from 'react-router-dom';
import { Home, Scale } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex flex-col">
      <nav className="px-6 py-3.5 flex items-center justify-between">
        <Link to="/"><Logo /></Link>
        <ThemeToggle />
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center mb-6">
          <Scale className="w-10 h-10 text-gold-500" />
        </div>
        <p className="font-serif text-7xl font-bold gradient-text mb-2">404</p>
        <h1 className="font-serif text-2xl font-semibold text-navy-900 dark:text-slate-100 mb-2">Page not found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/"><Button variant="primary" size="lg"><Home className="w-5 h-5" /> Back to home</Button></Link>
      </div>
    </div>
  );
}
