import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function addLineNumbers(text: string, start: number, sep: string): string {
  return text
    .split('\n')
    .map((line, index) => `${start + index}${sep}${line}`)
    .join('\n');
}

const initial = 'first line\nsecond line\nthird line';

const LineNumbersTool = memo(function LineNumbersTool() {
  const { t } = useTranslation();
  const [text, setText] = useState(initial);
  const [start, setStart] = useState('1');
  const [sep, setSep] = useState(' ');

  const startNum = Number.isInteger(+start) ? +start : 1;
  const output = addLineNumbers(text, startNum, sep);

  return (
    <ToolLayout id="line-numbers" color="#f472b6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.line-numbers.start')}
            <GlassInput type="number" aria-label={t('tools.line-numbers.start')} value={start} onChange={(event) => setStart(event.target.value)} className="mt-2 w-28" />
          </label>
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.line-numbers.separator')}
            <GlassInput aria-label={t('tools.line-numbers.separator')} value={sep} onChange={(event) => setSep(event.target.value)} className="mt-2 w-28" />
          </label>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 font-semibold">{t('tools.line-numbers.input')}</h2>
            <GlassInput multiline aria-label={t('tools.line-numbers.input')} rows={12} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.line-numbers.inputPlaceholder')} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.line-numbers.output')}</h2>
              <CopyButton value={output} />
            </div>
            <GlassInput multiline readOnly aria-label={t('tools.line-numbers.output')} rows={12} className="font-mono" value={output} onChange={() => {}} />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
});

export default LineNumbersTool;
