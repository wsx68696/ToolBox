import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassCheckbox from '../components/GlassCheckbox';
import NumberStepper from '../components/NumberStepper';
import ToolLayout from '../components/ToolLayout';

const LOREM = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum'.split(' ');

function pick(count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i += 1) out.push(LOREM[Math.floor(Math.random() * LOREM.length)]);
  return out;
}

function makeSentence(): string {
  const len = 6 + Math.floor(Math.random() * 10);
  const words = pick(len);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function makeParagraph(): string {
  const count = 3 + Math.floor(Math.random() * 4);
  return Array.from({ length: count }, makeSentence).join(' ');
}

const LoremIpsumTool = memo(function LoremIpsumTool() {
  const { t } = useTranslation();
  const [paragraphs, setParagraphs] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState('');

  const generate = () => {
    const result = Array.from({ length: Math.max(paragraphs, 1) }, makeParagraph);
    if (startWithLorem && result.length) {
      result[0] = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + result[0];
    }
    setOutput(result.join('\n\n'));
  };

  return (
    <ToolLayout id="lorem-ipsum" color="#f472b6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="text-sm text-[var(--color-text-muted)]">
          <span className="mb-2 block">{t('tools.lorem-ipsum.paragraphs')}</span>
          <NumberStepper aria-label={t('tools.lorem-ipsum.paragraphs')} min={1} max={50} value={paragraphs} onChange={setParagraphs} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <GlassCheckbox checked={startWithLorem} onChange={(event) => setStartWithLorem(event.target.checked)} />
          {t('tools.lorem-ipsum.startWithLorem')}
        </label>
        <GlassButton aria-label={t('tools.lorem-ipsum.generate')} onClick={generate}>{t('tools.lorem-ipsum.generate')}</GlassButton>
      </div>
      {output && (
        <div className="mt-5">
          <div className="mb-2 flex justify-end"><CopyButton value={output} /></div>
          <div className="glass-input min-h-48 whitespace-pre-wrap p-4 leading-7">{output}</div>
        </div>
      )}
    </ToolLayout>
  );
});

export default LoremIpsumTool;
