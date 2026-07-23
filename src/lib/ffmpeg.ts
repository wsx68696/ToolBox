import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

// Single-thread core loaded from CDN as blob URLs so it works under COEP.
const CORE_BASE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';

let ffmpeg: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

export type FfmpegLogHandler = (message: string) => void;

export async function getFFmpeg(onLog?: FfmpegLogHandler): Promise<FFmpeg> {
  if (ffmpeg?.loaded) {
    if (onLog) ffmpeg.on('log', ({ message }) => onLog(message));
    return ffmpeg;
  }
  if (!loading) {
    loading = (async () => {
      const instance = new FFmpeg();
      await instance.load({
        coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      ffmpeg = instance;
      return instance;
    })();
  }
  const instance = await loading;
  if (onLog) instance.on('log', ({ message }) => onLog(message));
  return instance;
}

export function fileDataToBlob(data: Uint8Array | string, type: string): Blob {
  if (typeof data === 'string') {
    return new Blob([data], { type });
  }
  // Copy into a plain ArrayBuffer-backed Uint8Array for BlobPart compatibility.
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return new Blob([copy.buffer], { type });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}
