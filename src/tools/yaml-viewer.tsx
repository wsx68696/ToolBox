import { load } from 'js-yaml';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const initialYaml = `name: Toolbox
version: 1
features:
  - client-side
  - i18n
  - dark mode
server:
  host: localhost
  ports:
    - 80
    - 443
  tls:
    enabled: true
    cert: /etc/ssl/cert.pem
tags: null`;

interface NodeProps {
  label: string | number;
  value: unknown;
  depth: number;
}

function typeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

const TreeNode = memo(function TreeNode({ label, value, depth }: NodeProps) {
  const [open, setOpen] = useState(depth < 2);
  const kind = typeOf(value);
  const isBranch = kind === 'object' || kind === 'array';

  if (!isBranch) {
    const display = kind === 'string' ? `"${value as string}"` : String(value);
    const color = kind === 'number' ? 'text-amber-500 dark:text-amber-300'
      : kind === 'boolean' ? 'text-purple-500 dark:text-purple-300'
      : kind === 'null' ? 'text-red-400 dark:text-red-300'
      : 'text-emerald-600 dark:text-emerald-300';
    return (
      <div className="flex gap-2 py-0.5" style={{ paddingLeft: `${depth * 1.1}rem` }}>
        <span className="text-[var(--color-text-muted)]">{label}:</span>
        <span className={`font-mono ${color}`}>{display}</span>
      </div>
    );
  }

  const entries: [string | number, unknown][] = Array.isArray(value)
    ? value.map((item, index) => [index, item])
    : Object.entries(value as Record<string, unknown>);
  const summary = Array.isArray(value) ? `[${entries.length}]` : `{${entries.length}}`;

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center gap-1 py-0.5 text-left hover:text-[var(--color-accent)]"
        style={{ paddingLeft: `${depth * 1.1}rem` }}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="text-[var(--color-text-muted)]">{label}</span>
        <span className="text-xs text-[var(--color-text-muted)]/70">{summary}</span>
      </button>
      {open && entries.map(([childLabel, childValue]) => (
        <TreeNode key={childLabel} label={childLabel} value={childValue} depth={depth + 1} />
      ))}
    </div>
  );
});

const YamlViewerTool = memo(function YamlViewerTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState(initialYaml);

  const parsed = useMemo(() => {
    if (!input.trim()) return { data: null, error: false };
    try {
      return { data: load(input), error: false };
    } catch {
      return { data: null, error: true };
    }
  }, [input]);

  const rootEntries: [string | number, unknown][] = parsed.data && typeof parsed.data === 'object'
    ? (Array.isArray(parsed.data)
      ? parsed.data.map((item, index) => [index, item] as [number, unknown])
      : Object.entries(parsed.data as Record<string, unknown>))
    : [];

  return (
    <ToolLayout id="yaml-viewer" color="#f472b6">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">YAML</h2>
            <CopyButton value={input} />
          </div>
          <GlassInput
            multiline
            aria-label="YAML"
            rows={20}
            className={`font-mono text-sm ${parsed.error ? 'border-red-400/60' : ''}`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t('tools.yaml-viewer.placeholder')}
          />
          {parsed.error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.yaml-viewer.invalid')}</p>}
        </div>
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.yaml-viewer.tree')}</h2>
          <div className="mono-panel max-h-[32rem] overflow-auto p-4 text-sm">
            {rootEntries.length > 0 ? (
              rootEntries.map(([label, value]) => <TreeNode key={label} label={label} value={value} depth={0} />)
            ) : (
              <p className="text-[var(--color-text-muted)]">{parsed.data === null && !parsed.error ? t('tools.yaml-viewer.empty') : t('tools.yaml-viewer.scalar', { value: String(parsed.data) })}</p>
            )}
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.yaml-viewer.hint')}</p>
    </ToolLayout>
  );
});

export default YamlViewerTool;
