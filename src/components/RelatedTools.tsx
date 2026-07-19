import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { tools, type ToolId } from '../data/tools';
import { useTranslatedTools } from '../hooks/useTranslatedTools';
import GlassCard from './GlassCard';

interface RelatedToolsProps {
  currentId: ToolId;
}

const ignoredKeywords = new Set([
  'tool', 'tools', 'utility', 'utilities', 'convert', 'converter', 'generate', 'generator',
  'format', 'formatter', '工具', '转换', '生成', '格式', '格式化',
]);

function keywordSet(value: string): Set<string> {
  return new Set(value
    .toLocaleLowerCase()
    .split(/[^\p{L}\p{N}+#.-]+/u)
    .map((word) => word.replace(/^[+.-]+|[+.-]+$/g, ''))
    .filter((word) => word.length > 1 && !ignoredKeywords.has(word)));
}

const RelatedTools = memo(function RelatedTools({ currentId }: RelatedToolsProps) {
  const { t } = useTranslation();
  const translatedTools = useTranslatedTools();

  const related = useMemo(() => {
    const current = translatedTools.find((tool) => tool.id === currentId);
    const currentMeta = tools.find((tool) => tool.id === currentId);
    if (!current || !currentMeta) return [];

    const currentKeywords = keywordSet(current.keywords);
    const currentIndex = tools.findIndex((tool) => tool.id === currentId);
    return translatedTools
      .filter((tool) => tool.id !== currentId)
      .map((tool) => {
        const meta = tools.find((item) => item.id === tool.id);
        const candidateKeywords = keywordSet(tool.keywords);
        let overlap = 0;
        for (const keyword of currentKeywords) if (candidateKeywords.has(keyword)) overlap += 1;
        const sameCategory = meta?.category === currentMeta.category;
        const index = tools.findIndex((item) => item.id === tool.id);
        return {
          tool,
          score: overlap * 10 + (sameCategory ? 5 : 0) - Math.abs(index - currentIndex) / 1000,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ tool }) => tool);
  }, [currentId, translatedTools]);

  return (
    <section className="mt-8" aria-labelledby="related-tools-title">
      <h2 id="related-tools-title" className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        {t('common.relatedTools')}
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {related.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.id} to={`/tool/${tool.id}`} aria-label={tool.name} className="block h-full">
              <GlassCard interactive themeColor={tool.color} className="flex h-full min-h-28 items-start gap-3 p-4">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                  style={{ color: tool.color }}
                >
                  <Icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{tool.name}</span>
                  <span className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-text-muted)]">{tool.description}</span>
                </span>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </section>
  );
});

export default RelatedTools;
