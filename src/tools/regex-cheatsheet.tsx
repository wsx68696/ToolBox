import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const sections = [
  {
    title: 'sectionChars',
    rows: [
      { token: '\\d', key: 'd' }, { token: '\\D', key: 'notD' }, { token: '\\w', key: 'w' }, { token: '\\W', key: 'notW' },
      { token: '\\s', key: 's' }, { token: '\\S', key: 'notS' }, { token: '.', key: 'dot' },
      { token: '[abc]', key: 'set' }, { token: '[^abc]', key: 'negSet' }, { token: '[a-z]', key: 'range' },
    ],
  },
  {
    title: 'sectionAnchors',
    rows: [
      { token: '^', key: 'caret' }, { token: '$', key: 'dollar' }, { token: '\\b', key: 'wordBoundary' }, { token: '\\B', key: 'nonWordBoundary' },
    ],
  },
  {
    title: 'sectionQuantifiers',
    rows: [
      { token: '*', key: 'star' }, { token: '+', key: 'plus' }, { token: '?', key: 'question' },
      { token: '{3}', key: 'exactN' }, { token: '{3,}', key: 'atLeastN' }, { token: '{3,5}', key: 'between' }, { token: '*?', key: 'lazy' },
    ],
  },
  {
    title: 'sectionGroups',
    rows: [
      { token: '(abc)', key: 'group' }, { token: '(?:abc)', key: 'nonCapture' }, { token: '(?<name>abc)', key: 'named' },
      { token: '\\1', key: 'backref' }, { token: 'a|b', key: 'alternation' },
    ],
  },
  {
    title: 'sectionLookaround',
    rows: [
      { token: '(?=abc)', key: 'lookahead' }, { token: '(?!abc)', key: 'negLookahead' },
      { token: '(?<=abc)', key: 'lookbehind' }, { token: '(?<!abc)', key: 'negLookbehind' },
    ],
  },
  {
    title: 'sectionFlags',
    rows: [
      { token: 'g', key: 'flagG' }, { token: 'i', key: 'flagI' }, { token: 'm', key: 'flagM' },
      { token: 's', key: 'flagS' }, { token: 'u', key: 'flagU' }, { token: 'y', key: 'flagY' },
    ],
  },
] as const;

const RegexCheatsheetTool = memo(function RegexCheatsheetTool() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sections;
    return sections
      .map((section) => ({
        ...section,
        rows: section.rows.filter((row) =>
          row.token.toLowerCase().includes(term) || t(`tools.regex-cheatsheet.${row.key}`).toLowerCase().includes(term),
        ),
      }))
      .filter((section) => section.rows.length > 0);
  }, [query, t]);

  return (
    <ToolLayout id="regex-cheatsheet" color="#fbbf24">
      <GlassInput aria-label={t('tools.regex-cheatsheet.searchPlaceholder')} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('tools.regex-cheatsheet.searchPlaceholder')} />
      {filtered.length === 0 && <p className="mt-5 text-sm text-[var(--color-text-muted)]">{t('tools.regex-cheatsheet.noResults')}</p>}
      <div className="mt-5 space-y-6">
        {filtered.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{t(`tools.regex-cheatsheet.${section.title}`)}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {section.rows.map((row) => (
                <div key={row.key} className="glass-input flex items-center gap-3 p-3">
                  <code className="w-24 shrink-0 font-mono text-sm font-semibold text-amber-600 dark:text-amber-300">{row.token}</code>
                  <span className="text-sm text-[var(--color-text-muted)]">{t(`tools.regex-cheatsheet.${row.key}`)}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ToolLayout>
  );
});

export default RegexCheatsheetTool;
