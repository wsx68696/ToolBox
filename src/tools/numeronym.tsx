import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function numeronym(word: string): string {
  if (word.length <= 2) return word;
  return `${word[0]}${word.length - 2}${word[word.length - 1]}`;
}

function processText(text: string): string {
  return text.replace(/[A-Za-z]+/g, (word) => numeronym(word));
}

const examples = ['internationalization', 'accessibility', 'localization', 'Kubernetes'];

const NumeronymTool = memo(function NumeronymTool() {
  const { t } = useTranslation();
  const [text, setText] = useState('internationalization');
  const output = useMemo(() => processText(text), [text]);

  return (
    <ToolLayout id="numeronym" color="#818cf8">
      <GlassInput aria-label={t('tools.numeronym.inputPlaceholder')} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.numeronym.inputPlaceholder')} />
      <div className="mt-3 flex flex-wrap gap-2">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setText(example)}
            className="glass-input px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition hover:text-[var(--color-text)]"
          >
            {example} → {numeronym(example)}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t('tools.numeronym.result')}</h2>
          <CopyButton value={output} />
        </div>
        <div className="glass-input mono-panel min-h-[3rem] p-4 text-lg">{output}</div>
      </div>
      <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t('tools.numeronym.hint')}</p>
    </ToolLayout>
  );
});

export default NumeronymTool;
