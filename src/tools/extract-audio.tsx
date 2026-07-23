import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';
import { bufferToWave } from '../lib/wav';

const ExtractAudioTool = memo(function ExtractAudioTool() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleBuffer = async (buffer: ArrayBuffer, fileName: string) => {
    setBusy(true);
    setError('');
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl('');
    try {
      const base = fileName.replace(/\.[^.]+$/, '') || 'audio';
      setName(base);
      const ctx = new AudioContext();
      const audioBuffer = await ctx.decodeAudioData(buffer.slice(0));
      const blob = bufferToWave(audioBuffer);
      setAudioUrl(URL.createObjectURL(blob));
      await ctx.close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.extract-audio.error'));
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    await handleBuffer(buffer, file.name);
  };

  return (
    <ToolLayout id="extract-audio" color="#fbbf24">
      <div className="flex flex-col gap-4">
        <Dropzone
          label={busy ? t('tools.extract-audio.working') : t('tools.extract-audio.dropLabel')}
          inputLabel={t('tools.extract-audio.dropLabel')}
          onFile={(f) => void onFile(f)}
        />
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        {audioUrl && (
          <div className="glass-card flex flex-col gap-3 p-4">
            <h2 className="font-semibold">{t('tools.extract-audio.result')}</h2>
            <audio src={audioUrl} controls className="w-full" />
            <GlassButton
              className="self-start"
              onClick={() => {
                const a = document.createElement('a');
                a.href = audioUrl;
                a.download = `${name}.wav`;
                a.click();
              }}
            >
              {t('tools.extract-audio.download')}
            </GlassButton>
          </div>
        )}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.extract-audio.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default ExtractAudioTool;
