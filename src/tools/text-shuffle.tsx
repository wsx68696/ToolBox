import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

// Lightweight shuffle: sort by random sign (stable enough for this use case).
function shuffleChars(text: string): string {
  return text.split('\n').map((line) => line.split('').sort(() => 0.5 - Math.random()).join('')).join('\n');
}

function shuffleLines(text: string): string {
  return text.split('\n').sort(() => 0.5 - Math.random()).join('\n');
}

const initial = 'The quick brown fox\njumps over the lazy dog';

const TextShuffleTool = memo(function TextShuffleTool() {
  const { t } = useTranslation();
  const [text, setText] = useState(initial);
  const [output, setOutput] = useState('');

  return (
    <ToolLayout id="text-shuffle" color="#fbbf24">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.text-shuffle.input')}</h2>
          <GlassInput multiline aria-label={t('tools.text-shuffle.input')} rows={8} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.text-shuffle.inputPlaceholder')} />
        </div>
        <div className="flex flex-wrap gap-2">
          <GlassButton onClick={() => setOutput(shuffleChars(text))}>{t('tools.text-shuffle.shuffleChars')}</GlassButton>
          <GlassButton onClick={() => setOutput(shuffleLines(text))}>{t('tools.text-shuffle.shuffleLines')}</GlassButton>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.text-shuffle.output')}</h2>
            <CopyButton value={output} />
          </div>
          <GlassInput multiline readOnly aria-label={t('tools.text-shuffle.output')} rows={8} value={output} onChange={() => {}} />
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.text-shuffle.hint')}</p>
    </ToolLayout>
  );
});

export default TextShuffleTool;
