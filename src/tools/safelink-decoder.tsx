import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const REDIRECT_PARAMS = ['url', 'q', 'u', 'target', 'redirect', 'dest', 'destination'];

function decodeSafelink(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('invalid');
  }
  if (url.hostname.endsWith('.safelinks.protection.outlook.com')) {
    const target = url.searchParams.get('url');
    if (target) return target;
  }
  for (const key of REDIRECT_PARAMS) {
    const value = url.searchParams.get(key);
    if (value && /^https?:\/\//i.test(value)) return value;
  }
  throw new Error('no-target');
}

const SafelinkDecoderTool = memo(function SafelinkDecoderTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  const result = useMemo(() => {
    try {
      return { value: decodeSafelink(input), error: false };
    } catch {
      return { value: null, error: true };
    }
  }, [input]);

  return (
    <ToolLayout id="safelink-decoder" color="#f87171">
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t('tools.safelink-decoder.inputLabel')}</h2>
        </div>
        <GlassInput
          multiline
          aria-label={t('tools.safelink-decoder.inputLabel')}
          rows={5}
          className={result.error ? 'border-red-400/60' : ''}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t('tools.safelink-decoder.placeholder')}
        />
        {result.error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.safelink-decoder.invalid')}</p>}
      </div>
      {result.value && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.safelink-decoder.outputLabel')}</h2>
            <CopyButton value={result.value} />
          </div>
          <div className="mono-panel break-all px-4 py-3 font-mono text-sm">{result.value}</div>
        </div>
      )}
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.safelink-decoder.hint')}</p>
    </ToolLayout>
  );
});

export default SafelinkDecoderTool;
