import { Search } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router';
import { useTranslatedTools, type TranslatedTool } from '../hooks/useTranslatedTools';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const categoryOrder = ['Encode', 'Format', 'Crypto', 'Generate', 'Web', 'Text', 'Network'] as const;

const Sidebar = memo(function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const tools = useTranslatedTools();
  const [query, setQuery] = useState('');
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditable = target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || target instanceof HTMLSelectElement
        || (target instanceof HTMLElement && target.isContentEditable);
      if (event.key === '/' && !isEditable) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('');
        setActiveResultIndex(0);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return tools;
    return tools.filter((tool) => tool.searchText.includes(term));
  }, [query, tools]);

  const grouped = useMemo(() => {
    const map = new Map<string, TranslatedTool[]>();
    categoryOrder.forEach((cat) => map.set(cat, []));
    filtered.forEach((tool) => {
      const list = map.get(tool.category) ?? [];
      list.push(tool);
      map.set(tool.category, list);
    });
    return Array.from(map.entries()).filter(([, list]) => list.length > 0);
  }, [filtered]);
  const orderedResults = useMemo(() => grouped.flatMap(([, items]) => items), [grouped]);
  const activeResult = query.trim() ? orderedResults[activeResultIndex] : undefined;

  useEffect(() => {
    setActiveResultIndex((index) => Math.min(index, Math.max(orderedResults.length - 1, 0)));
  }, [orderedResults.length]);

  useEffect(() => {
    if (!activeResult) return;
    document.getElementById(`tool-search-result-${activeResult.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [activeResult]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 w-72 border-r border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="p-4 pt-16 lg:pt-4">
            <label className="glass-search">
              <Search size={16} className="glass-search-icon" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                aria-label={t('common.searchTools')}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveResultIndex(0);
                }}
                onKeyDown={(event) => {
                  if (event.nativeEvent.isComposing || !query.trim() || orderedResults.length === 0) return;
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    setActiveResultIndex((index) => (index + 1) % orderedResults.length);
                  } else if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    setActiveResultIndex((index) => (index - 1 + orderedResults.length) % orderedResults.length);
                  } else if (event.key === 'Home') {
                    event.preventDefault();
                    setActiveResultIndex(0);
                  } else if (event.key === 'End') {
                    event.preventDefault();
                    setActiveResultIndex(orderedResults.length - 1);
                  } else if (event.key === 'Enter' && activeResult) {
                    event.preventDefault();
                    navigate(`/tool/${activeResult.id}`);
                    onClose();
                  }
                }}
                placeholder={t('common.searchPlaceholder')}
                className="glass-search-input"
                role="combobox"
                aria-autocomplete="list"
                aria-controls="tool-search-results"
                aria-expanded={Boolean(query.trim() && filtered.length)}
                aria-activedescendant={activeResult ? `tool-search-result-${activeResult.id}` : undefined}
              />
            </label>
          </div>

          <nav id="tool-search-results" className="flex-1 overflow-y-auto px-4 pb-6">
            {grouped.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--color-text-muted)]">{t('common.noResults')}</p>
            ) : (
              <div className="space-y-6">
                {grouped.map(([category, items]) => (
                  <div key={category}>
                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                      {items[0]?.categoryLabel ?? category}
                    </h3>
                    <ul className="space-y-1">
                      {items.map((tool) => {
                        const isActive = location.pathname === `/tool/${tool.id}`;
                        const isSearchResultActive = activeResult?.id === tool.id;
                        const isHighlighted = isSearchResultActive || (!query.trim() && isActive);
                        const Icon = tool.icon;
                        return (
                          <li key={tool.id}>
                            <Link
                              id={`tool-search-result-${tool.id}`}
                              to={`/tool/${tool.id}`}
                              onClick={onClose}
                              className={`sidebar-tool-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                                isHighlighted
                                  ? 'bg-[var(--color-surface-active)] text-[var(--color-text)]'
                                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                              }`}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              <span
                                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                                style={{ color: tool.color }}
                              >
                                <Icon size={16} />
                              </span>
                              <span className="truncate font-medium">{tool.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
});

export default Sidebar;
