import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import type { ToolId } from '../data/tools';

export type FormatMode = 'html' | 'css' | 'javascript' | 'typescript' | 'yaml';

interface CodeFormatToolProps {
  id: ToolId;
  color: string;
  mode: FormatMode;
  mock: string;
  accept: string;
}

async function formatWithPrettier(code: string, mode: FormatMode, tabWidth: number): Promise<string> {
  const prettier = await import('prettier/standalone');
  const plugins: unknown[] = [];
  let parser = 'babel';

  if (mode === 'html') {
    plugins.push(await import('prettier/plugins/html'));
    parser = 'html';
  } else if (mode === 'css') {
    plugins.push(await import('prettier/plugins/postcss'));
    parser = 'css';
  } else if (mode === 'javascript') {
    plugins.push(await import('prettier/plugins/babel'), await import('prettier/plugins/estree'));
    parser = 'babel';
  } else if (mode === 'typescript') {
    plugins.push(await import('prettier/plugins/typescript'), await import('prettier/plugins/estree'));
    parser = 'typescript';
  } else if (mode === 'yaml') {
    plugins.push(await import('prettier/plugins/yaml'));
    parser = 'yaml';
  }

  return prettier.format(code, {
    parser,
    plugins: plugins as never[],
    tabWidth,
    printWidth: 100,
    singleQuote: true,
    semi: true,
  });
}

const CodeFormatTool = memo(function CodeFormatTool({ id, color, mode, mock, accept }: CodeFormatToolProps) {
  const { t } = useTranslation();
  const raw = t as unknown as (key: string, opts?: Record<string, unknown>) => string;
  const tk = (key: string, opts?: Record<string, unknown>) => raw(`tools.${id}.${key}`, opts);

  const [input, setInput] = useState(mock);
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (code: string, tab: number) => {
    setBusy(true);
    setError('');
    try {
      const formatted = await formatWithPrettier(code, mode, tab);
      setOutput(formatted);
      setInput(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : tk('error'));
      setOutput('');
    } finally {
      setBusy(false);
    }
  }, [mode, tk]);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { void run(String(reader.result ?? ''), indent); };
    reader.readAsText(file);
  };

  const download = () => {
    const blob = new Blob([output || input], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted${accept.split(',')[0].trim() || '.txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout id={id} color={color}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-[var(--color-text-muted)]">
            {tk('indent')}
            <select className="glass-select mt-1 block" value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
              {[2, 4, 8].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <GlassButton disabled={busy} onClick={() => void run(input, indent)}>{busy ? tk('working') : tk('format')}</GlassButton>
          <label className="glass-button cursor-pointer">
            {tk('upload')}
            <input type="file" accept={accept} className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
          </label>
          {(output || input) && <GlassButton onClick={download}>{tk('download')}</GlassButton>}
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 font-semibold">{tk('input')}</h2>
            <GlassInput multiline rows={16} className="font-mono text-sm" value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{tk('output')}</h2>
              <CopyButton value={output} />
            </div>
            <GlassInput multiline readOnly rows={16} className={`font-mono text-sm ${error ? 'border-red-400/60' : ''}`} value={error ? '' : output} onChange={() => {}} />
            {error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{error}</p>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
});

export default CodeFormatTool;
