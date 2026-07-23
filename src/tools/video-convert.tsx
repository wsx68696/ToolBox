import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchFile } from '@ffmpeg/util';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';
import { downloadBlob, fileDataToBlob, formatBytes, getFFmpeg } from '../lib/ffmpeg';

const FORMATS = [
  { label: 'MP4', mime: 'video/mp4', ext: 'mp4' },
  { label: 'WEBM', mime: 'video/webm', ext: 'webm' },
  { label: 'MKV', mime: 'video/x-matroska', ext: 'mkv' },
  { label: 'AVI', mime: 'video/x-msvideo', ext: 'avi' },
  { label: 'MOV', mime: 'video/quicktime', ext: 'mov' },
  { label: 'GIF', mime: 'image/gif', ext: 'gif' },
] as const;

const VideoConvertTool = memo(function VideoConvertTool() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<(typeof FORMATS)[number]>(FORMATS[0]);
  const [resultUrl, setResultUrl] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const [log, setLog] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const coreReady = useRef(false);

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl('');
    try {
      if (!coreReady.current) {
        setLog(t('tools.video-convert.loadingCore'));
        await getFFmpeg((m) => setLog(m));
        coreReady.current = true;
      }
      const ffmpeg = await getFFmpeg((m) => setLog(m));
      const inputName = 'input' + (file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '.mp4');
      const outputName = `output.${format.ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = fileDataToBlob(data as Uint8Array, format.mime);
      setResultSize(blob.size);
      setResultUrl(URL.createObjectURL(blob));
      try { await ffmpeg.deleteFile(inputName); } catch { /* ignore */ }
      try { await ffmpeg.deleteFile(outputName); } catch { /* ignore */ }
      setLog(t('tools.video-convert.done'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.video-convert.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout id="video-convert" color="#22d3ee">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.video-convert.dropLabel')} inputLabel={t('tools.video-convert.dropLabel')} onFile={(f) => { setFile(f); setResultUrl(''); setError(''); }} />
        {file && <p className="text-sm text-[var(--color-text-muted)]">{file.name} · {formatBytes(file.size)}</p>}
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.video-convert.format')}
            <select className="glass-select mt-1 block" value={format.ext} onChange={(e) => setFormat(FORMATS.find((f) => f.ext === e.target.value) ?? FORMATS[0])}>
              {FORMATS.map((f) => <option key={f.ext} value={f.ext}>{f.label}</option>)}
            </select>
          </label>
          <GlassButton disabled={!file || busy} onClick={() => void convert()}>{busy ? t('tools.video-convert.working') : t('tools.video-convert.convert')}</GlassButton>
          {resultUrl && file && (
            <GlassButton onClick={() => {
              const a = document.createElement('a');
              a.href = resultUrl;
              a.download = `${file.name.replace(/\.[^.]+$/, '') || 'output'}.${format.ext}`;
              a.click();
            }}>{t('tools.video-convert.download')}{resultSize ? ` (${formatBytes(resultSize)})` : ''}</GlassButton>
          )}
        </div>
        {log && <pre className="mono-panel glass-card max-h-32 overflow-auto p-3 text-xs text-[var(--color-text-muted)]">{log}</pre>}
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        {resultUrl && format.mime.startsWith('video/') && <video src={resultUrl} controls className="max-h-80 w-full rounded-xl border border-[var(--color-border)] bg-black" />}
        {resultUrl && format.mime === 'image/gif' && <img src={resultUrl} alt="gif" className="max-h-80 self-start rounded-lg border border-[var(--color-border)]" />}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.video-convert.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default VideoConvertTool;
