import { Camera, Circle, Download, Square } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';

const CameraRecorderTool = memo(function CameraRecorderTool() {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [active, setActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const supported = useMemo(() => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (photo) URL.revokeObjectURL(photo);
  }, [videoUrl, photo]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      setError(false);
    } catch {
      setError(true);
    }
  };

  const stop = () => {
    recorderRef.current?.state === 'recording' && recorderRef.current.stop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
    setRecording(false);
  };

  const snapshot = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (photo) URL.revokeObjectURL(photo);
      setPhoto(URL.createObjectURL(blob));
    }, 'image/png');
  };

  const toggleRecording = () => {
    if (recording) {
      recorderRef.current?.stop();
      setRecording(false);
      return;
    }
    if (!streamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current);
    recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      setVideoUrl(URL.createObjectURL(blob));
    };
    recorder.start();
    recorderRef.current = recorder;
    setRecording(true);
  };

  if (!supported) {
    return (
      <ToolLayout id="camera-recorder" color="#f472b6">
        <p className="text-sm text-red-500 dark:text-red-300">{t('tools.camera-recorder.unsupported')}</p>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout id="camera-recorder" color="#f472b6">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mono-panel aspect-video overflow-hidden">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {!active ? (
              <GlassButton onClick={() => void start()}><Camera size={16} /> {t('tools.camera-recorder.start')}</GlassButton>
            ) : (
              <>
                <GlassButton onClick={snapshot}><Camera size={16} /> {t('tools.camera-recorder.snapshot')}</GlassButton>
                <GlassButton onClick={toggleRecording} className={recording ? 'border-red-300/50 bg-red-300/10' : ''}>
                  {recording ? <><Square size={16} /> {t('tools.camera-recorder.stopRecording')}</> : <><Circle size={16} /> {t('tools.camera-recorder.record')}</>}
                </GlassButton>
                <GlassButton onClick={stop}>{t('tools.camera-recorder.stop')}</GlassButton>
              </>
            )}
          </div>
          {error && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.camera-recorder.error')}</p>}
        </div>
        <div className="space-y-5">
          {photo && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{t('tools.camera-recorder.photo')}</h2>
                <a className="glass-button px-3 py-1.5 text-sm" href={photo} download="snapshot.png"><Download size={14} /> {t('tools.camera-recorder.download')}</a>
              </div>
              <img src={photo} alt={t('tools.camera-recorder.photo')} className="mono-panel w-full" />
            </div>
          )}
          {videoUrl && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-semibold">{t('tools.camera-recorder.recording')}</h2>
                <a className="glass-button px-3 py-1.5 text-sm" href={videoUrl} download="recording.webm"><Download size={14} /> {t('tools.camera-recorder.download')}</a>
              </div>
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={videoUrl} controls className="mono-panel w-full" />
            </div>
          )}
          {!photo && !videoUrl && <p className="text-sm text-[var(--color-text-muted)]">{t('tools.camera-recorder.hintCapture')}</p>}
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.camera-recorder.hint')}</p>
    </ToolLayout>
  );
});

export default CameraRecorderTool;
