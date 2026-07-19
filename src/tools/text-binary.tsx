import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function textToBinary(text: string): string {
  return Array.from(new TextEncoder().encode(text), (byte) => byte.toString(2).padStart(8, '0')).join(' ');
}

function binaryToText(binary: string): string | null {
  const groups = binary.trim().split(/\s+/).filter(Boolean);
  if (groups.some((group) => !/^[01]{1,8}$/.test(group))) return null;
  const bytes = groups.map((group) => parseInt(group, 2));
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes));
  } catch {
    return null;
  }
}

const initialText = 'Hi!';

const TextBinaryTool = memo(function TextBinaryTool() {
  const { t } = useTranslation();
  const [text, setText] = useState(initialText);
  const [binary, setBinary] = useState(() => textToBinary(initialText));
  const [invalid, setInvalid] = useState(false);

  const changeText = (value: string) => {
    setText(value);
    setBinary(textToBinary(value));
    setInvalid(false);
  };

  const changeBinary = (value: string) => {
    setBinary(value);
    const decoded = binaryToText(value);
    if (decoded === null) { setInvalid(true); return; }
    setText(decoded);
    setInvalid(false);
  };

  return (
    <ToolLayout id="text-binary" color="#818cf8">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.text-binary.text')}</h2>
            <CopyButton value={text} />
          </div>
          <GlassInput multiline aria-label={t('tools.text-binary.text')} rows={10} value={text} onChange={(event) => changeText(event.target.value)} placeholder={t('tools.text-binary.textPlaceholder')} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.text-binary.binary')}</h2>
            <CopyButton value={binary} />
          </div>
          <GlassInput multiline aria-label={t('tools.text-binary.binary')} rows={10} className={invalid ? 'border-red-400/60' : ''} value={binary} onChange={(event) => changeBinary(event.target.value)} placeholder="01001000 01101001" />
          {invalid && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.text-binary.invalid')}</p>}
        </div>
      </div>
    </ToolLayout>
  );
});

export default TextBinaryTool;
