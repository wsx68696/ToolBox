import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

const SlugifyTool = memo(function SlugifyTool() {
  const { t } = useTranslation();
  const [text, setText] = useState('Hello World — This is an Example!');
  const slug = useMemo(() => slugify(text), [text]);

  return (
    <ToolLayout id="slugify" color="#818cf8">
      <GlassInput multiline aria-label={t('tools.slugify.inputPlaceholder')} rows={4} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.slugify.inputPlaceholder')} />
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t('tools.slugify.result')}</h2>
          <CopyButton value={slug} />
        </div>
        <div className="glass-input mono-panel min-h-[2.75rem] p-3">{slug}</div>
      </div>
    </ToolLayout>
  );
});

export default SlugifyTool;
