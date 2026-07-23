import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function shiftChar(code: number, offset: number, base: number): number {
  return ((((code - base + offset) % 26) + 26) % 26) + base;
}

function caesar(text: string, offset: number): string {
  let out = '';
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i);
    if (c >= 65 && c <= 90) out += String.fromCharCode(shiftChar(c, offset, 65));
    else if (c >= 97 && c <= 122) out += String.fromCharCode(shiftChar(c, offset, 97));
    else out += text[i];
  }
  return out;
}

const CaesarTool = memo(function CaesarTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('Hello Toolbox');
  const [offset, setOffset] = useState(3);
  const [output, setOutput] = useState(() => caesar('Hello Toolbox', 3));

  return (
    <ToolLayout id="caesar" color="#fbbf24">
      <div className="flex flex-col gap-4">
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.caesar.offset')}
          <GlassInput
            type="number"
            min={0}
            max={25}
            className="mt-1 w-28"
            value={offset}
            onChange={(e) => setOffset(Math.max(0, Math.min(25, Number(e.target.value) || 0)))}
          />
        </label>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 font-semibold">{t('tools.caesar.input')}</h2>
            <GlassInput multiline rows={8} value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.caesar.output')}</h2>
              <CopyButton value={output} />
            </div>
            <GlassInput multiline readOnly rows={8} className="font-mono" value={output} onChange={() => {}} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <GlassButton onClick={() => setOutput(caesar(input, offset))}>{t('tools.caesar.encrypt')}</GlassButton>
          <GlassButton onClick={() => setOutput(caesar(input, -offset))}>{t('tools.caesar.decrypt')}</GlassButton>
          <GlassButton
            onClick={() =>
              setOutput(Array.from({ length: 26 }, (_, i) => `${String(i).padStart(2, '0')}: ${caesar(input, -i)}`).join('\n'))
            }
          >
            {t('tools.caesar.enumerate')}
          </GlassButton>
        </div>
      </div>
    </ToolLayout>
  );
});

export default CaesarTool;
