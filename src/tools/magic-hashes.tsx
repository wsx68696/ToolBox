import { memo, useMemo, useState } from 'react';
import { Search, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { magicHashAlgorithms, magicHashes, type MagicHashAlgorithm } from '../data/magic-hashes';

type AlgorithmFilter = MagicHashAlgorithm | 'all';

const MagicHashesTool = memo(function MagicHashesTool() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [algorithm, setAlgorithm] = useState<AlgorithmFilter>('all');

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return magicHashes.filter((entry) => (
      (algorithm === 'all' || entry.algorithm === algorithm)
      && (!term || `${entry.algorithm} ${entry.input} ${entry.hash}`.toLowerCase().includes(term))
    ));
  }, [algorithm, query]);

  return (
    <ToolLayout id="magic-hashes" color="#f87171">
      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" size={20} aria-hidden="true" />
          <div>
            <h2 className="font-semibold text-amber-800 dark:text-amber-200">{t('tools.magic-hashes.warningTitle')}</h2>
            <p className="mt-1 text-sm leading-6 text-amber-800/80 dark:text-amber-100/80">{t('tools.magic-hashes.warning')}</p>
            <code className="mt-2 inline-block rounded-lg bg-black/10 px-2 py-1 text-xs dark:bg-black/30">/^0+e\d+$/i</code>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="relative block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            size={18}
          />
          <GlassInput
            className="w-full pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('tools.magic-hashes.searchPlaceholder')}
            aria-label={t('tools.magic-hashes.searchPlaceholder')}
          />
        </label>
        <select
          className="glass-select min-w-44"
          value={algorithm}
          onChange={(event) => setAlgorithm(event.target.value as AlgorithmFilter)}
          aria-label={t('tools.magic-hashes.algorithm')}
        >
          <option value="all">{t('tools.magic-hashes.allAlgorithms')}</option>
          {magicHashAlgorithms.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </div>

      <p className="my-4 text-sm text-[var(--color-text-muted)]">
        {t('tools.magic-hashes.results', { count: results.length })}
      </p>

      {results.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-surface)] text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                <tr>
                  <th className="p-3">{t('tools.magic-hashes.algorithm')}</th>
                  <th className="min-w-52 p-3">{t('tools.magic-hashes.input')}</th>
                  <th className="min-w-[28rem] p-3">{t('tools.magic-hashes.hash')}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((entry) => (
                  <tr key={`${entry.algorithm}-${entry.input}`} className="border-t border-[var(--color-border)] align-middle">
                    <td className="p-3 font-semibold text-red-600 dark:text-red-300">{entry.algorithm}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <code className="font-mono">{entry.input}</code>
                        <CopyButton className="shrink-0" value={entry.input} />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <code className="font-mono text-xs">{entry.hash}</code>
                        <CopyButton className="shrink-0" value={entry.hash} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mono-panel py-12 text-center text-sm text-[var(--color-text-muted)]">
          {t('tools.magic-hashes.noResults')}
        </div>
      )}

      <p className="mt-5 text-xs leading-5 text-[var(--color-text-muted)]">{t('tools.magic-hashes.hint')}</p>
    </ToolLayout>
  );
});

export default MagicHashesTool;
