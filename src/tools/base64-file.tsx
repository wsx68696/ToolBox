import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

interface LoadedFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function rawBase64(dataUrl: string): string {
  const index = dataUrl.indexOf(',');
  return index >= 0 ? dataUrl.slice(index + 1) : dataUrl;
}

const Base64FileTool = memo(function Base64FileTool() {
  const { t } = useTranslation();
  const [file, setFile] = useState<LoadedFile | null>(null);
  const [encoded, setEncoded] = useState('');
  const [filename, setFilename] = useState('file.bin');
  const [decodeError, setDecodeError] = useState(false);

  const onFile = (picked: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setFile({ name: picked.name, size: picked.size, type: picked.type || 'application/octet-stream', dataUrl: String(reader.result) });
    };
    reader.readAsDataURL(picked);
  };

  const download = () => {
    try {
      const input = encoded.trim();
      const isDataUrl = input.startsWith('data:');
      const base64 = isDataUrl ? rawBase64(input) : input;
      const mime = isDataUrl ? (input.slice(5, input.indexOf(';')) || 'application/octet-stream') : 'application/octet-stream';
      const binary = atob(base64.replace(/\s/g, ''));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename.trim() || 'file.bin';
      anchor.click();
      URL.revokeObjectURL(url);
      setDecodeError(false);
    } catch {
      setDecodeError(true);
    }
  };

  return (
    <ToolLayout id="base64-file" color="#22d3ee">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.base64-file.encodeTitle')}</h2>
          <Dropzone label={t('tools.base64-file.dropLabel')} inputLabel={t('tools.base64-file.dropLabel')} onFile={onFile} />
          {file && (
            <div className="mt-4">
              <p className="mb-2 text-sm text-[var(--color-text-muted)]">{file.name} · {formatSize(file.size)} · {file.type}</p>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Base64</h3>
                <span className="flex gap-2">
                  <CopyButton value={rawBase64(file.dataUrl)} />
                </span>
              </div>
              <GlassInput multiline readOnly aria-label="Base64" rows={6} value={rawBase64(file.dataUrl)} onChange={() => {}} />
              <div className="mt-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Data URL</h3>
                <CopyButton value={file.dataUrl} />
              </div>
            </div>
          )}
        </div>
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.base64-file.decodeTitle')}</h2>
          <GlassInput
            multiline
            aria-label={t('tools.base64-file.decodeTitle')}
            rows={8}
            className={decodeError ? 'border-red-400/60' : ''}
            value={encoded}
            onChange={(event) => { setEncoded(event.target.value); setDecodeError(false); }}
            placeholder={t('tools.base64-file.decodePlaceholder')}
          />
          <label className="mt-3 block text-sm text-[var(--color-text-muted)]">
            {t('tools.base64-file.filename')}
            <GlassInput aria-label={t('tools.base64-file.filename')} value={filename} onChange={(event) => setFilename(event.target.value)} className="mt-2" />
          </label>
          <GlassButton className="mt-3" disabled={!encoded.trim()} onClick={download}>{t('tools.base64-file.download')}</GlassButton>
          {decodeError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.base64-file.invalid')}</p>}
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.base64-file.hint')}</p>
    </ToolLayout>
  );
});

export default Base64FileTool;
