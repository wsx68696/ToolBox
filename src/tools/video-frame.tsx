import { memo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';
import { downloadDataUrl } from '../lib/image';

const VideoFrameTool = memo(function VideoFrameTool() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState('');
  const [frame, setFrame] = useState('');
  const [name, setName] = useState('frame');

  const onFile = (file: File) => {
    if (url) URL.revokeObjectURL(url);
    setUrl(URL.createObjectURL(file));
    setName((file.name || 'video').replace(/\.[^.]+$/, ''));
    setFrame('');
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setFrame(canvas.toDataURL('image/png'));
  };

  return (
    <ToolLayout id="video-frame" color="#f472b6">
      <div className="flex flex-col gap-4">
        <Dropzone label={t('tools.video-frame.dropLabel')} inputLabel={t('tools.video-frame.dropLabel')} onFile={onFile} />
        {url && (
          <>
            <video ref={videoRef} src={url} controls className="max-h-96 w-full rounded-xl border border-[var(--color-border)] bg-black" />
            <GlassButton onClick={capture}>{t('tools.video-frame.capture')}</GlassButton>
          </>
        )}
        {frame && (
          <div>
            <h3 className="mb-2 text-sm text-[var(--color-text-muted)]">{t('tools.video-frame.result')}</h3>
            <img src={frame} alt="" className="max-h-80 rounded-lg border border-[var(--color-border)]" />
            <GlassButton className="mt-3" onClick={() => downloadDataUrl(frame, `${name}-frame.png`)}>{t('tools.video-frame.download')}</GlassButton>
          </div>
        )}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.video-frame.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default VideoFrameTool;
