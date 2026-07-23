import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const defaultLess = `.button {\n  color: #fff;\n  background: #0ea5e9;\n  &:hover {\n    background: darken(#0ea5e9, 10%);\n  }\n  .icon {\n    margin-right: 8px;\n  }\n}`;

const LessCssTool = memo(function LessCssTool() {
  const { t } = useTranslation();
  const [less, setLess] = useState(defaultLess);
  const [css, setCss] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const convert = async () => {
    setBusy(true);
    setError('');
    try {
      const lessjs = await import('less');
      const result = await lessjs.default.render(less, { compress: false });
      setCss(result.css);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.less-css.error'));
      setCss('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout id="less-css" color="#4ade80">
      <div className="flex flex-col gap-4">
        <div>
          <GlassButton disabled={busy} onClick={() => void convert()}>{busy ? t('tools.less-css.working') : t('tools.less-css.convert')}</GlassButton>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 font-semibold">LESS</h2>
            <GlassInput multiline rows={16} className="font-mono text-sm" value={less} onChange={(e) => setLess(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">CSS</h2>
              <CopyButton value={css} />
            </div>
            <GlassInput multiline readOnly rows={16} className={`font-mono text-sm ${error ? 'border-red-400/60' : ''}`} value={error ? '' : css} onChange={() => {}} />
            {error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{error}</p>}
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.less-css.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default LessCssTool;
