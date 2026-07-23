import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';
import { canvasFromImage, downloadDataUrl, fileToDataUrl, formatBytes, loadImage } from '../lib/image';

const FORMATS = [
  { label: 'PNG', mime: 'image/png', ext: 'png' },
  { label: 'JPEG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'WEBP', mime: 'image/webp', ext: 'webp' },
  { label: 'BMP', mime: 'image/bmp', ext: 'bmp' },
] as const;

const ImageConvertTool = memo(function ImageConvertTool() {
  const { t } = useTranslation();
  const [src, setSrc] = useState('');
  const [name, setName] = useState('image');
  const [format, setFormat] = useState<(typeof FORMATS)[number]>(FORMATS[0]);
  const [result, setResult] = useState('');
  const [size, setSize] = useState(0);

  const onFile = async (file: File) => {
    const url = await fileToDataUrl(file);
    setSrc(url);
    setName((file.name || 'image').replace(/\.[^.]+$/, ''));
    setResult('');
  };

  const convert = async () => {
    if (!src) return;
    const img = await loadImage(src);
    const canvas = canvasFromImage(img);
    const dataUrl = canvas.toDataURL(format.mime, 0.92);
    setResult(dataUrl);
    // Approximate size from base64.
    const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    setSize(Math.round(b64.length * 0.75));
  };

  return (
    <ToolLayout id="image-convert" color="#4ade80">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.image-convert.dropLabel')} inputLabel={t('tools.image-convert.dropLabel')} onFile={onFile} />
        {src && (
          <>
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm text-[var(--color-text-muted)]">
                {t('tools.image-convert.format')}
                <select className="glass-select mt-1 block" value={format.mime} onChange={(e) => setFormat(FORMATS.find((f) => f.mime === e.target.value) ?? FORMATS[0])}>
                  {FORMATS.map((f) => <option key={f.mime} value={f.mime}>{f.label}</option>)}
                </select>
              </label>
              <GlassButton onClick={convert}>{t('tools.image-convert.convert')}</GlassButton>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div><h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-convert.original')}</h3><img src={src} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" /></div>
              <div>
                <h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-convert.result')}{result ? ` · ${formatBytes(size)}` : ''}</h3>
                {result && <img src={result} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" />}
                {result && <GlassButton className="mt-3" onClick={() => downloadDataUrl(result, `${name}.${format.ext}`)}>{t('tools.image-convert.download')}</GlassButton>}
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
});

export default ImageConvertTool;
