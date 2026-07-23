import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchFile } from '@ffmpeg/util';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';
import { fileDataToBlob, formatBytes, getFFmpeg } from '../lib/ffmpeg';

const FORMATS = [
  { label: 'MP3', mime: 'audio/mpeg', ext: 'mp3' },
  { label: 'WAV', mime: 'audio/wav', ext: 'wav' },
  { label: 'AAC', mime: 'audio/aac', ext: 'aac' },
  { label: 'OGG', mime: 'audio/ogg', ext: 'ogg' },
  { label: 'FLAC', mime: 'audio/flac', ext: 'flac' },
  { label: 'M4A', mime: 'audio/mp4', ext: 'm4a' },
] as const;

const AudioConvertTool = memo(function AudioConvertTool() {
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
        setLog(t('tools.audio-convert.loadingCore'));
        await getFFmpeg((m) => setLog(m));
        coreReady.current = true;
      }
      const ffmpeg = await getFFmpeg((m) => setLog(m));
      const inputName = 'input' + (file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '.mp3');
      const outputName = `output.${format.ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = fileDataToBlob(data as Uint8Array, format.mime);
      setResultSize(blob.size);
      setResultUrl(URL.createObjectURL(blob));
      try { await ffmpeg.deleteFile(inputName); } catch { /* ignore */ }
      try { await ffmpeg.deleteFile(outputName); } catch { /* ignore */ }
      setLog(t('tools.audio-convert.done'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.audio-convert.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout id="audio-convert" color="#4ade80">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.audio-convert.dropLabel')} inputLabel={t('tools.audio-convert.dropLabel')} onFile={(f) => { setFile(f); setResultUrl(''); setError(''); }} />
        {file && <p className="text-sm text-[var(--color-text-muted)]">{file.name} · {formatBytes(file.size)}</p>}
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.audio-convert.format')}
            <select className="glass-select mt-1 block" value={format.ext} onChange={(e) => setFormat(FORMATS.find((f) => f.ext === e.target.value) ?? FORMATS[0])}>
              {FORMATS.map((f) => <option key={f.ext} value={f.ext}>{f.label}</option>)}
            </select>
          </label>
          <GlassButton disabled={!file || busy} onClick={() => void convert()}>{busy ? t('tools.audio-convert.working') : t('tools.audio-convert.convert')}</GlassButton>
          {resultUrl && file && (
            <GlassButton onClick={() => {
              const a = document.createElement('a');
              a.href = resultUrl;
              a.download = `${file.name.replace(/\.[^.]+$/, '') || 'output'}.${format.ext}`;
              a.click();
            }}>{t('tools.audio-convert.download')}{resultSize ? ` (${formatBytes(resultSize)})` : ''}</GlassButton>
          )}
        </div>
        {log && <pre className="mono-panel glass-card max-h-32 overflow-auto p-3 text-xs text-[var(--color-text-muted)]">{log}</pre>}
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        {resultUrl && <audio src={resultUrl} controls className="w-full" />}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.audio-convert.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default AudioConvertTool;
