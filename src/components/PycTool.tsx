import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import Dropzone from '../components/Dropzone';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { loadEmscriptenModule } from '../lib/emscripten';

type Mode = 'py' | 'asm';

const CONFIG: Record<Mode, { script: string; id: 'pyc-decompile' | 'pyc-disassemble' }> = {
  py: { script: '/wasm/pycdc.js', id: 'pyc-decompile' },
  asm: { script: '/wasm/pycdas.js', id: 'pyc-disassemble' },
};

const PycTool = memo(function PycTool({ mode }: { mode: Mode }) {
  const { t } = useTranslation();
  const raw = t as unknown as (key: string) => string;
  const cfg = CONFIG[mode];
  const tk = (key: string) => raw(`tools.${cfg.id}.${key}`);

  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onFile = async (file: File) => {
    setBusy(true);
    setError('');
    setResult('');
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const mod = await loadEmscriptenModule(cfg.script);
      const out = mod.ccall(
        'decompile',
        'string',
        ['string', 'array', 'number'],
        [file.name, bytes, bytes.byteLength],
      );
      setResult(typeof out === 'string' ? out : String(out ?? ''));
    } catch (err) {
      setError(err instanceof Error ? err.message : tk('error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout id={cfg.id} color={mode === 'py' ? '#4ade80' : '#818cf8'}>
      <div className="flex flex-col gap-4">
        <Dropzone
          label={busy ? tk('working') : tk('dropLabel')}
          inputLabel={tk('dropLabel')}
          onFile={(f) => void onFile(f)}
        />
        {fileName && <p className="text-sm text-[var(--color-text-muted)]">{fileName}</p>}
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        {result && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{tk('result')}</h2>
              <CopyButton value={result} />
            </div>
            <GlassInput multiline readOnly rows={18} className="font-mono text-sm" value={result} onChange={() => {}} />
          </div>
        )}
        <p className="text-xs text-[var(--color-text-muted)]">{tk('hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default PycTool;
