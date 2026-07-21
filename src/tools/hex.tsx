import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function textToHex(text: string): string {
  return Array.from(new TextEncoder().encode(text), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hexToText(hex: string): string | null {
  const clean = hex.replace(/(0x|\\x|[\s:,])/gi, '');
  if (clean.length === 0) return '';
  if (clean.length % 2 !== 0 || /[^0-9a-fA-F]/.test(clean)) return null;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

const initial = 'Hello';

const HexTool = memo(function HexTool() {
  const { t } = useTranslation();
  const [text, setText] = useState(initial);
  const [hex, setHex] = useState(() => textToHex(initial));
  const [invalid, setInvalid] = useState(false);

  const changeText = (value: string) => {
    setText(value);
    setHex(textToHex(value));
    setInvalid(false);
  };

  const changeHex = (value: string) => {
    setHex(value);
    const decoded = hexToText(value);
    if (decoded === null) { setInvalid(true); return; }
    setText(decoded);
    setInvalid(false);
  };

  return (
    <ToolLayout id="hex" color="#818cf8">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.hex.text')}</h2>
            <CopyButton value={text} />
          </div>
          <GlassInput multiline aria-label={t('tools.hex.text')} rows={10} value={text} onChange={(event) => changeText(event.target.value)} placeholder={t('tools.hex.textPlaceholder')} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.hex.hex')}</h2>
            <CopyButton value={hex} />
          </div>
          <GlassInput multiline aria-label={t('tools.hex.hex')} rows={10} className={`font-mono ${invalid ? 'border-red-400/60' : ''}`} value={hex} onChange={(event) => changeHex(event.target.value)} placeholder="48656c6c6f" />
          {invalid && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.hex.invalid')}</p>}
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.hex.hint')}</p>
    </ToolLayout>
  );
});

export default HexTool;
