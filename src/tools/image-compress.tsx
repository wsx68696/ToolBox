import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';
import { canvasFromImage, downloadDataUrl, fileToDataUrl, formatBytes, loadImage } from '../lib/image';

const ImageCompressTool = memo(function ImageCompressTool() {
  const { t } = useTranslation();
  const [src, setSrc] = useState('');
  const [result, setResult] = useState('');
  const [quality, setQuality] = useState(0.7);
  const [name, setName] = useState('image');
  const [origSize, setOrigSize] = useState(0);
  const [outSize, setOutSize] = useState(0);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    (async () => {
      const img = await loadImage(src);
      if (cancelled) return;
      const canvas = canvasFromImage(img);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      if (cancelled) return;
      setResult(dataUrl);
      const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
      setOutSize(Math.round(b64.length * 0.75));
    })();
    return () => { cancelled = true; };
  }, [src, quality]);

  const onFile = async (file: File) => {
    setSrc(await fileToDataUrl(file));
    setName((file.name || 'image').replace(/\.[^.]+$/, ''));
    setOrigSize(file.size);
  };

  const ratio = origSize > 0 && outSize > 0 ? Math.round((1 - outSize / origSize) * 100) : 0;

  return (
    <ToolLayout id="image-compress" color="#f87171">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.image-compress.dropLabel')} inputLabel={t('tools.image-compress.dropLabel')} onFile={onFile} />
        {src && (
          <>
            <label className="text-sm text-[var(--color-text-muted)]">
              {t('tools.image-compress.quality')}: {Math.round(quality * 100)}%
              {outSize > 0 && <span className="ml-2">({formatBytes(origSize)} → {formatBytes(outSize)}{ratio > 0 ? `, −${ratio}%` : ''})</span>}
              <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-2 w-full" />
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
              <div><h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-compress.original')}</h3><img src={src} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" /></div>
              <div>
                <h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-compress.result')}</h3>
                {result && <img src={result} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" />}
                {result && <GlassButton className="mt-3" onClick={() => downloadDataUrl(result, `${name}-compressed.jpg`)}>{t('tools.image-compress.download')}</GlassButton>}
              </div>
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">{t('tools.image-compress.hint')}</p>
          </>
        )}
      </div>
    </ToolLayout>
  );
});

export default ImageCompressTool;
