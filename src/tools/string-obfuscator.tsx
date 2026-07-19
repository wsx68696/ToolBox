import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassCheckbox from '../components/GlassCheckbox';
import GlassInput from '../components/GlassInput';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

function obfuscate(value: string, keepFirst: number, keepLast: number, keepSpaces: boolean): string {
  const chars = [...value];
  return chars.map((ch, index) => {
    if (index < keepFirst || index >= chars.length - keepLast) return ch;
    if (keepSpaces && ch === ' ') return ch;
    return '*';
  }).join('');
}

const StringObfuscatorTool = memo(function StringObfuscatorTool() {
  const { t } = useTranslation();
  const [text, setText] = useState('sk-a1b2c3d4e5f6g7h8i9j0');
  const [keepFirst, setKeepFirst] = useState(4);
  const [keepLast, setKeepLast] = useState(4);
  const [keepSpaces, setKeepSpaces] = useState(true);

  const output = useMemo(() => obfuscate(text, keepFirst, keepLast, keepSpaces), [text, keepFirst, keepLast, keepSpaces]);

  return (
    <ToolLayout id="string-obfuscator" color="#818cf8">
      <GlassInput aria-label={t('tools.string-obfuscator.inputPlaceholder')} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.string-obfuscator.inputPlaceholder')} autoComplete="off" />
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div className="text-sm text-[var(--color-text-muted)]">
          <span className="mb-2 block">{t('tools.string-obfuscator.keepFirst')}</span>
          <NumberStepper aria-label={t('tools.string-obfuscator.keepFirst')} min={0} max={64} value={keepFirst} onChange={setKeepFirst} />
        </div>
        <div className="text-sm text-[var(--color-text-muted)]">
          <span className="mb-2 block">{t('tools.string-obfuscator.keepLast')}</span>
          <NumberStepper aria-label={t('tools.string-obfuscator.keepLast')} min={0} max={64} value={keepLast} onChange={setKeepLast} />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <GlassCheckbox checked={keepSpaces} onChange={(event) => setKeepSpaces(event.target.checked)} />
          {t('tools.string-obfuscator.keepSpaces')}
        </label>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t('tools.string-obfuscator.result')}</h2>
          <CopyButton value={output} />
        </div>
        <div className="glass-input mono-panel min-h-[3rem] p-4 text-lg">{output}</div>
      </div>
      <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t('tools.string-obfuscator.hint')}</p>
    </ToolLayout>
  );
});

export default StringObfuscatorTool;
