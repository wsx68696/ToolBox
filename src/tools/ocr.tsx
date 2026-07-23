import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { fileToDataUrl } from '../lib/image';

type Lang = 'eng' | 'chi_sim' | 'jpn' | 'kor' | 'deu' | 'fra' | 'rus';

const LANGS: { id: Lang; labelKey: 'langEng' | 'langZh' | 'langJa' | 'langKo' | 'langDe' | 'langFr' | 'langRu' }[] = [
  { id: 'eng', labelKey: 'langEng' },
  { id: 'chi_sim', labelKey: 'langZh' },
  { id: 'jpn', labelKey: 'langJa' },
  { id: 'kor', labelKey: 'langKo' },
  { id: 'deu', labelKey: 'langDe' },
  { id: 'fra', labelKey: 'langFr' },
  { id: 'rus', labelKey: 'langRu' },
];

const OcrTool = memo(function OcrTool() {
  const { t } = useTranslation();
  const [langs, setLangs] = useState<Record<Lang, boolean>>({ eng: true, chi_sim: true, jpn: false, kor: false, deu: false, fra: false, rus: false });
  const [preview, setPreview] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workerRef = useRef<any>(null);

  const toggle = (id: Lang) => setLangs((prev) => ({ ...prev, [id]: !prev[id] }));

  const recognize = async (file: File) => {
    const selected = LANGS.filter((l) => langs[l.id]).map((l) => l.id);
    if (selected.length === 0) { setError(t('tools.ocr.langRequired')); return; }
    setBusy(true);
    setError('');
    setText('');
    setStatus(t('tools.ocr.loading'));
    setPreview(await fileToDataUrl(file));
    try {
      const { createWorker } = await import('tesseract.js');
      if (workerRef.current) {
        try { await workerRef.current.terminate(); } catch { /* ignore */ }
        workerRef.current = null;
      }
      const worker = await createWorker(selected.join('+'), 1, {
        logger: (m: { status?: string; progress?: number }) => {
          if (m.status) {
            const pct = typeof m.progress === 'number' ? ` ${Math.round(m.progress * 100)}%` : '';
            setStatus(`${m.status}${pct}`);
          }
        },
      });
      workerRef.current = worker;
      const result = await worker.recognize(file);
      setText(result.data.text);
      setStatus(t('tools.ocr.done'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.ocr.error'));
      setStatus('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout id="ocr" color="#22d3ee">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          {LANGS.map((l) => (
            <label key={l.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="glass-checkbox" checked={langs[l.id]} onChange={() => toggle(l.id)} />
              {t(`tools.ocr.${l.labelKey}`)}
            </label>
          ))}
        </div>
        <Dropzone label={busy ? t('tools.ocr.working') : t('tools.ocr.dropLabel')} inputLabel={t('tools.ocr.dropLabel')} onFile={(f) => void recognize(f)} />
        {status && <p className="text-sm text-[var(--color-text-muted)]">{status}</p>}
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 font-semibold">{t('tools.ocr.image')}</h2>
            {preview
              ? <img src={preview} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" />
              : <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-sm text-[var(--color-text-muted)]">—</div>}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.ocr.result')}</h2>
              <CopyButton value={text} />
            </div>
            <GlassInput multiline readOnly rows={14} value={text} onChange={() => {}} placeholder={t('tools.ocr.placeholder')} />
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.ocr.hint')}</p>
        {workerRef.current && !busy && (
          <GlassButton onClick={async () => { try { await workerRef.current?.terminate(); } catch { /* ignore */ } workerRef.current = null; setStatus(''); }}>{t('tools.ocr.unload')}</GlassButton>
        )}
      </div>
    </ToolLayout>
  );
});

export default OcrTool;
