import { memo, useMemo } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useRecentTools } from '../App';
import { useTranslatedTools, type TranslatedTool } from '../hooks/useTranslatedTools';
import GlassCard from './GlassCard';

const ToolGrid = memo(function ToolGrid() {
  const { t } = useTranslation();
  const tools = useTranslatedTools();
  const { recent } = useRecentTools();

  const recentTools = useMemo(() => {
    return recent
      .map((id) => tools.find((tool) => tool.id === id))
      .filter((tool): tool is TranslatedTool => Boolean(tool));
  }, [recent, tools]);

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-10">
        <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">{t('home.title')}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)] sm:text-base">{t('home.subtitle')}</p>
      </header>

      {recentTools.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{t('home.recentlyUsed')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">{t('home.allTools')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
});

interface ToolCardProps {
  tool: TranslatedTool;
}

function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;
  return (
    <Link to={`/tool/${tool.id}`} aria-label={tool.name} className="block h-full">
      <GlassCard interactive themeColor={tool.color} className="flex h-[8.25rem] flex-col p-5">
        <div className="flex min-h-0 flex-1 items-start gap-3">
          <div
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
            style={{ color: tool.color }}
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-1 text-base font-semibold tracking-normal">{tool.name}</h3>
            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[var(--color-text-muted)]">{tool.description}</p>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

export default ToolGrid;
