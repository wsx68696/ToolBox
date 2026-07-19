import { Loader2 } from 'lucide-react';
import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useParams } from 'react-router';
import AuroraBackground from './components/AuroraBackground';
import AppShell from './components/AppShell';
import ToolGrid from './components/ToolGrid';
import { useLocalStorage } from './hooks/useLocalStorage';

interface RecentContextValue {
  recent: string[];
  markRecent: (id: string) => void;
}

const RecentContext = createContext<RecentContextValue | null>(null);

export function useRecentTools() {
  const context = useContext(RecentContext);
  if (!context) throw new Error('useRecentTools must be used inside RecentContext');
  return context;
}

// Vite turns every discovered tool into its own async chunk. The filename is
// also the public tool id, so adding a tool no longer requires a static import
// or an additional route declaration here.
const toolModules = import.meta.glob<{ default: ComponentType }>('./tools/*.tsx');
const lazyTools: Record<string, LazyExoticComponent<ComponentType>> = {};

for (const [path, loader] of Object.entries(toolModules)) {
  const id = path.match(/\/([^/]+)\.tsx$/)?.[1];
  if (id) lazyTools[id] = lazy(loader);
}

function ToolLoading() {
  const { t } = useTranslation();
  return (
    <div className="relative z-10 mx-auto flex min-h-80 w-full max-w-6xl items-center justify-center gap-2 px-4 text-sm text-[var(--color-text-muted)] sm:px-6">
      <Loader2 size={18} className="animate-spin" aria-hidden="true" />
      <span>{t('common.loading')}</span>
    </div>
  );
}

function LazyToolRoute() {
  const { toolId } = useParams();
  const Tool = toolId ? lazyTools[toolId] : undefined;
  if (!Tool) return <Navigate to="/" replace />;
  return (
    <Suspense fallback={<ToolLoading />}>
      <Tool />
    </Suspense>
  );
}

export default function App() {
  const [recent, setRecent] = useLocalStorage<string[]>('toolbox:recent', []);
  const markRecent = useCallback((id: string) => {
    setRecent((current) => [id, ...current.filter((item) => item !== id)].slice(0, 3));
  }, [setRecent]);
  const value = useMemo(() => ({ recent, markRecent }), [recent, markRecent]);

  return (
    <RecentContext.Provider value={value}>
      <AppShell>
        <AuroraBackground />
        <Routes>
          <Route path="/" element={<ToolGrid />} />
          <Route path="/tool/:toolId" element={<LazyToolRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </RecentContext.Provider>
  );
}
