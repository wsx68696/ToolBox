import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchFile } from '@ffmpeg/util';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { downloadBlob, fileDataToBlob, getFFmpeg } from '../lib/ffmpeg';

const VideoToGifTool = memo(function VideoToGifTool() {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [start, setStart] = useState(0);
  const [duration, setDuration] = useState(3);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [gifUrl, setGifUrl] = useState('');
  const [log, setLog] = useState('');
  const [loadingCore, setLoadingCore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const coreReady = useRef(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
  }, [preview, gifUrl]);

  const ensureCore = async () => {
    if (coreReady.current) return;
    setLoadingCore(true);
    setLog(t('tools.video-to-gif.loadingCore'));
    try {
      await getFFmpeg((message) => setLog(message));
      coreReady.current = true;
      setLog(t('tools.video-to-gif.coreReady'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.video-to-gif.error'));
    } finally {
      setLoadingCore(false);
    }
  };

  const onFile = (picked: File) => {
    if (preview) URL.revokeObjectURL(preview);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setGifUrl('');
    setFile(picked);
    setPreview(URL.createObjectURL(picked));
    setError('');
  };

  const convert = async () => {
    if (!file) return;
    setBusy(true);
    setError('');
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setGifUrl('');
    try {
      await ensureCore();
      const ffmpeg = await getFFmpeg((message) => setLog(message));
      const inputName = 'input' + (file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '.mp4');
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      const ss = Math.max(0, start);
      const clip = Math.max(0.1, duration);
      // Two-pass palette for better quality GIFs.
      await ffmpeg.exec([
        '-ss', String(ss),
        '-t', String(clip),
        '-i', inputName,
        '-vf', `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`,
        'palette.png',
      ]);
      await ffmpeg.exec([
        '-ss', String(ss),
        '-t', String(clip),
        '-i', inputName,
        '-i', 'palette.png',
        '-lavfi', `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`,
        'output.gif',
      ]);
      const data = await ffmpeg.readFile('output.gif');
      const blob = fileDataToBlob(data as Uint8Array, 'image/gif');
      setGifUrl(URL.createObjectURL(blob));
      try { await ffmpeg.deleteFile(inputName); } catch { /* ignore */ }
      try { await ffmpeg.deleteFile('palette.png'); } catch { /* ignore */ }
      try { await ffmpeg.deleteFile('output.gif'); } catch { /* ignore */ }
      setLog(t('tools.video-to-gif.done'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.video-to-gif.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolLayout id="video-to-gif" color="#f472b6">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.video-to-gif.dropLabel')} inputLabel={t('tools.video-to-gif.dropLabel')} onFile={onFile} />
        {preview && <video src={preview} controls className="max-h-80 w-full rounded-xl border border-[var(--color-border)] bg-black" />}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm text-[var(--color-text-muted)]">{t('tools.video-to-gif.start')}<GlassInput type="number" min={0} step={0.1} className="mt-1" value={start} onChange={(e) => setStart(Number(e.target.value) || 0)} /></label>
          <label className="text-sm text-[var(--color-text-muted)]">{t('tools.video-to-gif.duration')}<GlassInput type="number" min={0.1} step={0.1} className="mt-1" value={duration} onChange={(e) => setDuration(Number(e.target.value) || 0.1)} /></label>
          <label className="text-sm text-[var(--color-text-muted)]">{t('tools.video-to-gif.fps')}<GlassInput type="number" min={1} max={30} className="mt-1" value={fps} onChange={(e) => setFps(Math.max(1, Number(e.target.value) || 1))} /></label>
          <label className="text-sm text-[var(--color-text-muted)]">{t('tools.video-to-gif.width')}<GlassInput type="number" min={64} max={1280} className="mt-1" value={width} onChange={(e) => setWidth(Math.max(64, Number(e.target.value) || 64))} /></label>
        </div>
        <div className="flex flex-wrap gap-2">
          <GlassButton disabled={!file || busy || loadingCore} onClick={() => void convert()}>{busy ? t('tools.video-to-gif.working') : t('tools.video-to-gif.convert')}</GlassButton>
          {gifUrl && file && (
            <GlassButton onClick={() => {
              const a = document.createElement('a');
              a.href = gifUrl;
              a.download = (file.name.replace(/\.[^.]+$/, '') || 'output') + '.gif';
              a.click();
            }}>{t('tools.video-to-gif.download')}</GlassButton>
          )}
        </div>
        {log && <pre className="mono-panel glass-card max-h-32 overflow-auto p-3 text-xs text-[var(--color-text-muted)]">{log}</pre>}
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        {gifUrl && <img src={gifUrl} alt="gif" className="max-h-80 self-start rounded-lg border border-[var(--color-border)]" />}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.video-to-gif.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default VideoToGifTool;
