import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { downloadDataUrl, fileToDataUrl } from '../lib/image';

const ImgBase64Tool = memo(function ImgBase64Tool() {
  const { t } = useTranslation();
  const [dataUrl, setDataUrl] = useState('');
  const [name, setName] = useState('image.png');
  const [decodeInput, setDecodeInput] = useState('');
  const [decodeError, setDecodeError] = useState(false);

  const onFile = async (file: File) => {
    const url = await fileToDataUrl(file);
    setDataUrl(url);
    setName(file.name || 'image.png');
  };

  const raw = dataUrl.includes(',') ? dataUrl.slice(dataUrl.indexOf(',') + 1) : dataUrl;

  const downloadDecoded = () => {
    try {
      const input = decodeInput.trim();
      const isData = input.startsWith('data:');
      const b64 = isData ? input.slice(input.indexOf(',') + 1) : input;
      const mime = isData ? (input.slice(5, input.indexOf(';')) || 'image/png') : 'image/png';
      const binary = atob(b64.replace(/\s/g, ''));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
      const a = document.createElement('a');
      a.href = url;
      a.download = name || 'image.png';
      a.click();
      URL.revokeObjectURL(url);
      setDecodeError(false);
    } catch {
      setDecodeError(true);
    }
  };

  return (
    <ToolLayout id="img-base64" color="#22d3ee">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">{t('tools.img-base64.encode')}</h2>
          <Dropzone label={t('tools.img-base64.dropLabel')} inputLabel={t('tools.img-base64.dropLabel')} onFile={onFile} />
          {dataUrl && (
            <>
              <img src={dataUrl} alt="" className="max-h-48 w-auto self-start rounded-lg border border-[var(--color-border)]" />
              <div className="flex items-center justify-between"><span className="text-sm font-semibold">Data URL</span><CopyButton value={dataUrl} /></div>
              <div className="flex items-center justify-between"><span className="text-sm font-semibold">Base64</span><CopyButton value={raw} /></div>
              <GlassInput multiline readOnly rows={6} className="font-mono text-xs" value={raw} onChange={() => {}} />
            </>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">{t('tools.img-base64.decode')}</h2>
          <GlassInput multiline rows={8} className={`font-mono text-xs ${decodeError ? 'border-red-400/60' : ''}`} value={decodeInput} onChange={(e) => { setDecodeInput(e.target.value); setDecodeError(false); }} placeholder={t('tools.img-base64.decodePlaceholder')} />
          <label className="text-sm text-[var(--color-text-muted)]">{t('tools.img-base64.filename')}<GlassInput className="mt-1" value={name} onChange={(e) => setName(e.target.value)} /></label>
          <GlassButton disabled={!decodeInput.trim()} onClick={downloadDecoded}>{t('tools.img-base64.download')}</GlassButton>
          {decodeError && <p className="text-sm text-red-500 dark:text-red-300">{t('tools.img-base64.invalid')}</p>}
          {decodeInput.startsWith('data:image') && <img src={decodeInput} alt="" className="max-h-48 w-auto self-start rounded-lg border border-[var(--color-border)]" onError={() => setDecodeError(true)} />}
        </div>
      </div>
    </ToolLayout>
  );
});

export default ImgBase64Tool;
