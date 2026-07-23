import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import jsQR from 'jsqr';
import CopyButton from '../components/CopyButton';
import Dropzone from '../components/Dropzone';
import ToolLayout from '../components/ToolLayout';
import { fileToDataUrl, loadImage } from '../lib/image';

interface Result {
  name: string;
  data: string | null;
  error?: string;
}

const QrDecodeTool = memo(function QrDecodeTool() {
  const { t } = useTranslation();
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);

  const decodeFile = async (file: File): Promise<Result> => {
    try {
      const url = await fileToDataUrl(file);
      const img = await loadImage(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return { name: file.name, data: null, error: t('tools.qr-decode.failed') };
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
      if (!code) return { name: file.name, data: null, error: t('tools.qr-decode.notFound') };
      return { name: file.name, data: code.data };
    } catch {
      return { name: file.name, data: null, error: t('tools.qr-decode.failed') };
    }
  };

  const onFile = async (file: File) => {
    setBusy(true);
    const result = await decodeFile(file);
    setResults((prev) => [result, ...prev]);
    setBusy(false);
  };

  return (
    <ToolLayout id="qr-decode" color="#4ade80">
      <div className="flex flex-col gap-4">
        <Dropzone label={busy ? t('tools.qr-decode.working') : t('tools.qr-decode.dropLabel')} inputLabel={t('tools.qr-decode.dropLabel')} onFile={onFile} />
        {results.length > 0 && (
          <div className="flex flex-col gap-2">
            {results.map((r, i) => (
              <div key={i} className="glass-card flex items-start gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 truncate text-xs text-[var(--color-text-muted)]">{r.name}</div>
                  {r.data
                    ? <pre className="mono-panel whitespace-pre-wrap break-all text-sm">{r.data}</pre>
                    : <p className="text-sm text-red-500 dark:text-red-300">{r.error}</p>}
                </div>
                {r.data && <CopyButton value={r.data} />}
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.qr-decode.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default QrDecodeTool;
