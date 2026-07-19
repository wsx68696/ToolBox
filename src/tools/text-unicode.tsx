import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function encodeUnicode(text: string): string {
  return text.split('').map((ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
}

function decodeUnicode(value: string): string | null {
  try {
    return value.replace(/\\u\{([0-9a-fA-F]{1,6})\}|\\u([0-9a-fA-F]{4})/g, (_, brace: string | undefined, four: string | undefined) =>
      String.fromCodePoint(parseInt(brace ?? four ?? '0', 16)),
    );
  } catch {
    return null;
  }
}

const initialText = '你好, World!';

const TextUnicodeTool = memo(function TextUnicodeTool() {
  const { t } = useTranslation();
  const [text, setText] = useState(initialText);
  const [unicode, setUnicode] = useState(() => encodeUnicode(initialText));
  const [invalid, setInvalid] = useState(false);

  const changeText = (value: string) => {
    setText(value);
    setUnicode(encodeUnicode(value));
    setInvalid(false);
  };

  const changeUnicode = (value: string) => {
    setUnicode(value);
    const decoded = decodeUnicode(value);
    if (decoded === null) { setInvalid(true); return; }
    setText(decoded);
    setInvalid(false);
  };

  return (
    <ToolLayout id="text-unicode" color="#22d3ee">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.text-unicode.text')}</h2>
            <CopyButton value={text} />
          </div>
          <GlassInput multiline aria-label={t('tools.text-unicode.text')} rows={10} value={text} onChange={(event) => changeText(event.target.value)} placeholder={t('tools.text-unicode.textPlaceholder')} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">Unicode</h2>
            <CopyButton value={unicode} />
          </div>
          <GlassInput multiline aria-label="Unicode" rows={10} className={invalid ? 'border-red-400/60' : ''} value={unicode} onChange={(event) => changeUnicode(event.target.value)} placeholder="你好" />
          {invalid && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.text-unicode.invalid')}</p>}
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.text-unicode.hint')}</p>
    </ToolLayout>
  );
});

export default TextUnicodeTool;
