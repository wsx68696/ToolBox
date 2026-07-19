import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import GlassButton from './GlassButton';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <GlassButton
        onClick={() => setSidebarOpen((v) => !v)}
        aria-label={sidebarOpen ? t('common.close') : t('common.searchTools')}
        className="fixed left-4 top-4 z-50 h-10 w-10 min-w-0 p-0 lg:hidden"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </GlassButton>

      <div className="fixed right-4 top-4 z-30 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <main className="relative z-10 min-h-screen pt-16 lg:pt-0 lg:pl-72">{children}</main>
    </div>
  );
}
