import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';
import { canvasFromImage, downloadDataUrl, fileToDataUrl, loadImage } from '../lib/image';

const ImageGrayscaleTool = memo(function ImageGrayscaleTool() {
  const { t } = useTranslation();
  const [original, setOriginal] = useState('');
  const [result, setResult] = useState('');
  const [name, setName] = useState('image.png');

  const onFile = async (file: File) => {
    const url = await fileToDataUrl(file);
    setOriginal(url);
    setName(file.name || 'image.png');
    const img = await loadImage(url);
    const canvas = canvasFromImage(img);
    const ctx = canvas.getContext('2d')!;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < data.data.length; i += 4) {
      const avg = (data.data[i] + data.data[i + 1] + data.data[i + 2]) / 3;
      data.data[i] = data.data[i + 1] = data.data[i + 2] = avg;
    }
    ctx.putImageData(data, 0, 0);
    setResult(canvas.toDataURL('image/png'));
  };

  return (
    <ToolLayout id="image-grayscale" color="#818cf8">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.image-grayscale.dropLabel')} inputLabel={t('tools.image-grayscale.dropLabel')} onFile={onFile} />
        {(original || result) && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div><h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-grayscale.original')}</h3>{original && <img src={original} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" />}</div>
            <div>
              <h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.image-grayscale.result')}</h3>
              {result && <img src={result} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" />}
              {result && <GlassButton className="mt-3" onClick={() => downloadDataUrl(result, name.replace(/\.[^.]+$/, '') + '-gray.png')}>{t('tools.image-grayscale.download')}</GlassButton>}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
});

export default ImageGrayscaleTool;
