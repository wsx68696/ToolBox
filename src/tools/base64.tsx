import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import Dropzone from '../components/Dropzone';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function encodeUtf8(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function decodeUtf8(value: string) {
  const binary = atob(value.trim());
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

const Base64Tool = memo(function Base64Tool() {
  const { t } = useTranslation();
  const [plain, setPlain] = useState('');
  const [encoded, setEncoded] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [fileResult, setFileResult] = useState('');

  const changePlain = (value: string) => {
    setPlain(value);
    setEncoded(encodeUtf8(value));
    setInvalid(false);
  };

  const changeEncoded = (value: string) => {
    setEncoded(value);
    try {
      setPlain(decodeUtf8(value));
      setInvalid(false);
    } catch {
      setInvalid(true);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setFileResult(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <ToolLayout id="base64" color="#818cf8">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.base64.text')}</h2>
            <CopyButton value={plain} />
          </div>
          <GlassInput multiline aria-label={t('tools.base64.text')} rows={12} value={plain} onChange={(event) => changePlain(event.target.value)} placeholder={t('tools.base64.textPlaceholder')} />
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.base64.encoded')}</h2>
            <CopyButton value={encoded} />
          </div>
          <GlassInput multiline aria-label={t('tools.base64.encoded')} rows={12} className={invalid ? 'border-red-400/60' : ''} value={encoded} onChange={(event) => changeEncoded(event.target.value)} placeholder={t('tools.base64.encodedPlaceholder')} />
          {invalid && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.base64.invalid')}</p>}
        </div>
      </div>
      <Dropzone className="mt-5" label={t('tools.base64.dropzone')} inputLabel={t('tools.base64.uploadLabel')} onFile={readFile} />
      {fileResult && <div className="mt-4"><div className="mb-2 flex justify-end"><CopyButton value={fileResult} /></div><div className="glass-input mono-panel max-h-56 overflow-auto p-4 text-xs">{fileResult}</div></div>}
    </ToolLayout>
  );
});

export default Base64Tool;
