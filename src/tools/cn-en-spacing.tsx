import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const CJK = '\\u4e00-\\u9fa5，。！？；：·（）「」【】‘“’”《》';
const ASCII = "a-zA-Z,.!?;:`\\(\\)\\{\\}\\[\\]'\"<>0-9";
const RE_A = new RegExp(`([${CJK}])([${ASCII}])`, 'g');
const RE_B = new RegExp(`([${ASCII}])([${CJK}])`, 'g');

function addSpacing(input: string): string {
  return input.replace(RE_A, '$1 $2').replace(RE_B, '$1 $2');
}

const initial = '你好世界1234你好世界ACVs你好世界';

const CnEnSpacingTool = memo(function CnEnSpacingTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState(initial);
  const output = addSpacing(input);

  return (
    <ToolLayout id="cn-en-spacing" color="#818cf8">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.cn-en-spacing.input')}</h2>
          <GlassInput multiline aria-label={t('tools.cn-en-spacing.input')} rows={10} value={input} onChange={(event) => setInput(event.target.value)} placeholder={t('tools.cn-en-spacing.inputPlaceholder')} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.cn-en-spacing.output')}</h2>
            <CopyButton value={output} />
          </div>
          <GlassInput multiline readOnly aria-label={t('tools.cn-en-spacing.output')} rows={10} value={output} onChange={() => {}} />
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.cn-en-spacing.hint')}</p>
    </ToolLayout>
  );
});

export default CnEnSpacingTool;
