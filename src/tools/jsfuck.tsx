import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
// @ts-expect-error -- jsfuck ships no type declarations
import jsfuck from 'jsfuck';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const { JSFuck } = jsfuck as { JSFuck: { encode: (source: string) => string } };

const JsfuckTool = memo(function JsfuckTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState("alert('toolbox')");
  const [output, setOutput] = useState('');

  const encode = () => {
    setOutput(JSFuck.encode(input));
  };

  return (
    <ToolLayout id="jsfuck" color="#818cf8">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.jsfuck.input')}</h2>
          <GlassInput multiline aria-label={t('tools.jsfuck.input')} rows={5} className="font-mono" value={input} onChange={(event) => setInput(event.target.value)} placeholder={t('tools.jsfuck.inputPlaceholder')} />
        </div>
        <div>
          <GlassButton onClick={encode}>{t('tools.jsfuck.encode')}</GlassButton>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-semibold">{t('tools.jsfuck.output')}</h2>
            <span className="flex items-center gap-3">
              {output && <span className="text-xs text-[var(--color-text-muted)]">{t('tools.jsfuck.length', { count: output.length })}</span>}
              <CopyButton value={output} />
            </span>
          </div>
          <GlassInput multiline readOnly aria-label={t('tools.jsfuck.output')} rows={10} className="font-mono break-all" value={output} onChange={() => {}} placeholder={t('tools.jsfuck.outputPlaceholder')} />
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.jsfuck.hint')}</p>
    </ToolLayout>
  );
});

export default JsfuckTool;
