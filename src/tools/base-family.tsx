import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { BASE_CODECS, type BaseId, bytesToText, textToBytes } from '../lib/base-codecs';

const OPTIONS: BaseId[] = ['base16', 'base32', 'base58', 'base62', 'base64', 'base85', 'base91', 'base92', 'base100'];

const BaseFamilyTool = memo(function BaseFamilyTool() {
  const { t } = useTranslation();
  const [base, setBase] = useState<BaseId>('base32');
  const [text, setText] = useState('Hello Toolbox');
  const [encoded, setEncoded] = useState('');
  const [error, setError] = useState('');

  const codec = BASE_CODECS[base];

  const doEncode = (value: string) => {
    try {
      setEncoded(codec.encode(textToBytes(value)));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.base-family.error'));
    }
  };

  const doDecode = (value: string) => {
    try {
      setText(bytesToText(codec.decode(value)));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.base-family.error'));
    }
  };

  useEffect(() => {
    try {
      setEncoded(codec.encode(textToBytes(text)));
      setError('');
    } catch {
      /* keep */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  return (
    <ToolLayout id="base-family" color="#818cf8">
      <div className="flex flex-col gap-4">
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.base-family.base')}
          <select className="glass-select mt-1 block" value={base} onChange={(e) => setBase(e.target.value as BaseId)}>
            {OPTIONS.map((id) => (
              <option key={id} value={id}>{id.toUpperCase()}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.base-family.text')}</h2>
              <CopyButton value={text} />
            </div>
            <GlassInput
              multiline
              rows={10}
              value={text}
              onChange={(e) => { setText(e.target.value); doEncode(e.target.value); }}
              placeholder={t('tools.base-family.textPlaceholder')}
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.base-family.encoded')}</h2>
              <CopyButton value={encoded} />
            </div>
            <GlassInput
              multiline
              rows={10}
              className={`font-mono text-sm ${error ? 'border-red-400/60' : ''}`}
              value={encoded}
              onChange={(e) => { setEncoded(e.target.value); doDecode(e.target.value); }}
              placeholder={t('tools.base-family.encodedPlaceholder')}
            />
            {error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{error}</p>}
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.base-family.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default BaseFamilyTool;
