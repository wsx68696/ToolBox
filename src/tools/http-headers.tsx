import { memo, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import {
  httpRequestHeaders,
  requestHeaderCategories,
  type RequestHeaderCategory,
} from '../data/http-request-headers';

type CategoryFilter = RequestHeaderCategory | 'all';

interface CategoryOption {
  value: CategoryFilter;
  label: string;
}

function CategorySelect({ options, value, onChange, label }: {
  options: CategoryOption[];
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedLabel = options[selectedIndex]?.label ?? options[0]?.label;

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    const frame = requestAnimationFrame(() => optionRefs.current[selectedIndex]?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, selectedIndex]);

  const moveFocus = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % options.length;
    else if (event.key === 'ArrowUp') nextIndex = (index - 1 + options.length) % options.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = options.length - 1;
    else return;
    event.preventDefault();
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      ref={containerRef}
      className="relative min-w-0 sm:w-64"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="glass-input flex min-h-9 w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm transition-colors hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)]"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown aria-hidden="true" className={`shrink-0 text-[var(--color-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`} size={17} />
      </button>
      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label={label}
          className="absolute right-0 top-full z-40 mt-2 max-h-80 w-full min-w-64 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/95 p-1.5 shadow-xl backdrop-blur-2xl"
        >
          {options.map((option, index) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                ref={(node) => { optionRefs.current[index] = node; }}
                type="button"
                role="option"
                aria-selected={selected}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${selected ? 'bg-cyan-400/10 text-cyan-700 dark:text-cyan-200' : 'text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'}`}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                onKeyDown={(event) => moveFocus(event, index)}
              >
                <span>{option.label}</span>
                {selected && <Check aria-hidden="true" className="shrink-0" size={16} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const HttpHeadersTool = memo(function HttpHeadersTool() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');
  const isChinese = (i18n.resolvedLanguage ?? i18n.language).toLowerCase().startsWith('zh');
  const categoryOptions = useMemo<CategoryOption[]>(() => [
    { value: 'all', label: t('tools.http-headers.allCategories') },
    ...requestHeaderCategories.map((item) => ({
      value: item,
      label: t(`tools.http-headers.${item}`),
    })),
  ], [t]);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return httpRequestHeaders.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!normalizedQuery) return true;
      return [item.name, item.purposeEn, item.purposeZh, item.keywords ?? '']
        .join(' ')
        .toLocaleLowerCase()
        .includes(normalizedQuery);
    });
  }, [category, query]);

  return (
    <ToolLayout id="http-headers" color="#22d3ee">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <label className="relative block">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            size={18}
          />
          <GlassInput
            autoFocus
            className="w-full pl-10"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('tools.http-headers.searchPlaceholder')}
            aria-label={t('tools.http-headers.searchPlaceholder')}
          />
        </label>
        <CategorySelect
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          label={t('tools.http-headers.category')}
        />
      </div>

      <div className="my-4 flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--color-text-muted)]">
        <span>{t('tools.http-headers.results', { count: results.length })}</span>
        <span>{t('tools.http-headers.hint')}</span>
      </div>

      {results.length > 0 ? (
        <div className="space-y-3">
          {results.map((item) => {
            const purpose = isChinese ? item.purposeZh : item.purposeEn;
            return (
              <details key={item.name} className="group overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40">
                <summary className="flex cursor-pointer list-none items-start gap-3 p-4 marker:content-none">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="font-mono text-base font-semibold text-cyan-600 dark:text-cyan-300">{item.name}</code>
                      <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                        {t(`tools.http-headers.${item.category}`)}
                      </span>
                      {item.deprecated && (
                        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
                          {t('tools.http-headers.deprecated')}
                        </span>
                      )}
                      {item.nonStandard && (
                        <span className="rounded-full border border-violet-400/40 bg-violet-400/10 px-2 py-0.5 text-xs text-violet-700 dark:text-violet-300">
                          {t('tools.http-headers.nonStandard')}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">{purpose}</p>
                  </div>
                  <span aria-hidden="true" className="mt-1 text-lg leading-none text-[var(--color-text-muted)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="grid gap-4 border-t border-[var(--color-border)] p-4 lg:grid-cols-2">
                  <section className="min-w-0">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h2 className="text-sm font-semibold">{t('tools.http-headers.syntax')}</h2>
                      <CopyButton value={item.syntax} />
                    </div>
                    <pre className="mono-panel overflow-x-auto whitespace-pre-wrap break-words p-3 text-sm"><code>{item.syntax}</code></pre>
                  </section>
                  <section className="min-w-0">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h2 className="text-sm font-semibold">{t('tools.http-headers.example')}</h2>
                      <CopyButton value={item.example} />
                    </div>
                    <pre className="mono-panel overflow-x-auto whitespace-pre-wrap break-words p-3 text-sm"><code>{item.example}</code></pre>
                  </section>
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <div className="mono-panel py-12 text-center text-sm text-[var(--color-text-muted)]">
          {t('tools.http-headers.noResults')}
        </div>
      )}
    </ToolLayout>
  );
});

export default HttpHeadersTool;
