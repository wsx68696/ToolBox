import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import ToolLayout from '../components/ToolLayout';

interface Signature {
  offset: number;
  bytes: number[];
  ext: string;
  mime: string;
  desc: string;
}

// Common file magic numbers. Longer/more-specific signatures first.
const SIGNATURES: Signature[] = [
  { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], ext: 'png', mime: 'image/png', desc: 'PNG image' },
  { offset: 0, bytes: [0xff, 0xd8, 0xff], ext: 'jpg', mime: 'image/jpeg', desc: 'JPEG image' },
  { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38], ext: 'gif', mime: 'image/gif', desc: 'GIF image' },
  { offset: 0, bytes: [0x42, 0x4d], ext: 'bmp', mime: 'image/bmp', desc: 'BMP image' },
  { offset: 0, bytes: [0x00, 0x00, 0x01, 0x00], ext: 'ico', mime: 'image/x-icon', desc: 'ICO icon' },
  { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50], ext: 'webp', mime: 'image/webp', desc: 'WebP image' },
  { offset: 0, bytes: [0x25, 0x50, 0x44, 0x46], ext: 'pdf', mime: 'application/pdf', desc: 'PDF document' },
  { offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04], ext: 'zip', mime: 'application/zip', desc: 'ZIP archive (or docx/xlsx/jar/apk)' },
  { offset: 0, bytes: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07], ext: 'rar', mime: 'application/x-rar-compressed', desc: 'RAR archive' },
  { offset: 0, bytes: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c], ext: '7z', mime: 'application/x-7z-compressed', desc: '7-Zip archive' },
  { offset: 0, bytes: [0x1f, 0x8b], ext: 'gz', mime: 'application/gzip', desc: 'GZIP archive' },
  { offset: 0, bytes: [0x42, 0x5a, 0x68], ext: 'bz2', mime: 'application/x-bzip2', desc: 'BZIP2 archive' },
  { offset: 0, bytes: [0x75, 0x73, 0x74, 0x61, 0x72], ext: 'tar', mime: 'application/x-tar', desc: 'TAR archive' },
  { offset: 0, bytes: [0x7f, 0x45, 0x4c, 0x46], ext: 'elf', mime: 'application/x-elf', desc: 'ELF executable' },
  { offset: 0, bytes: [0x4d, 0x5a], ext: 'exe', mime: 'application/x-msdownload', desc: 'Windows PE executable' },
  { offset: 0, bytes: [0xca, 0xfe, 0xba, 0xbe], ext: 'class', mime: 'application/java-vm', desc: 'Java class file' },
  { offset: 0, bytes: [0x25, 0x21, 0x50, 0x53], ext: 'ps', mime: 'application/postscript', desc: 'PostScript' },
  { offset: 4, bytes: [0x66, 0x74, 0x79, 0x70], ext: 'mp4', mime: 'video/mp4', desc: 'MP4 / MOV video' },
  { offset: 0, bytes: [0x49, 0x44, 0x33], ext: 'mp3', mime: 'audio/mpeg', desc: 'MP3 audio (ID3)' },
  { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46], ext: 'wav', mime: 'audio/wav', desc: 'RIFF (WAV / AVI)' },
  { offset: 0, bytes: [0x4f, 0x67, 0x67, 0x53], ext: 'ogg', mime: 'audio/ogg', desc: 'OGG media' },
  { offset: 0, bytes: [0x66, 0x4c, 0x61, 0x43], ext: 'flac', mime: 'audio/flac', desc: 'FLAC audio' },
  { offset: 0, bytes: [0x1a, 0x45, 0xdf, 0xa3], ext: 'mkv', mime: 'video/x-matroska', desc: 'Matroska / WebM' },
  { offset: 0, bytes: [0x3c, 0x3f, 0x78, 0x6d, 0x6c], ext: 'xml', mime: 'text/xml', desc: 'XML document' },
];

interface Result {
  name: string;
  size: number;
  desc: string;
  ext: string;
  mime: string;
  hex: string;
}

function matches(bytes: Uint8Array, sig: Signature): boolean {
  if (bytes.length < sig.offset + sig.bytes.length) return false;
  for (let i = 0; i < sig.bytes.length; i += 1) if (bytes[sig.offset + i] !== sig.bytes[i]) return false;
  return true;
}

const FileTypeTool = memo(function FileTypeTool() {
  const { t } = useTranslation();
  const [result, setResult] = useState<Result | null>(null);
  const [unknown, setUnknown] = useState(false);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const bytes = new Uint8Array((reader.result as ArrayBuffer).slice(0, 32));
      const hex = Array.from(bytes.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join(' ');
      const sig = SIGNATURES.find((s) => matches(bytes, s));
      if (sig) {
        setResult({ name: file.name, size: file.size, desc: sig.desc, ext: sig.ext, mime: sig.mime, hex });
        setUnknown(false);
      } else {
        setResult({ name: file.name, size: file.size, desc: '', ext: '', mime: file.type || '', hex });
        setUnknown(true);
      }
    };
    reader.readAsArrayBuffer(file.slice(0, 32));
  };

  return (
    <ToolLayout id="file-type" color="#22d3ee">
      <div className="flex flex-col gap-5">
        <Dropzone label={t('tools.file-type.dropLabel')} inputLabel={t('tools.file-type.dropLabel')} onFile={onFile} />
        {result && (
          <div className="glass-card flex flex-col gap-2 p-4 text-sm">
            <div className="flex justify-between gap-4"><span className="text-[var(--color-text-muted)]">{t('tools.file-type.name')}</span><span className="truncate font-mono">{result.name}</span></div>
            <div className="flex justify-between gap-4"><span className="text-[var(--color-text-muted)]">{t('tools.file-type.size')}</span><span className="font-mono">{result.size} B</span></div>
            {unknown ? (
              <div className="text-[var(--color-text-muted)]">{t('tools.file-type.unknown')}</div>
            ) : (
              <>
                <div className="flex justify-between gap-4"><span className="text-[var(--color-text-muted)]">{t('tools.file-type.type')}</span><span className="font-medium">{result.desc}</span></div>
                <div className="flex justify-between gap-4"><span className="text-[var(--color-text-muted)]">{t('tools.file-type.ext')}</span><span className="font-mono">.{result.ext}</span></div>
                <div className="flex justify-between gap-4"><span className="text-[var(--color-text-muted)]">MIME</span><span className="font-mono">{result.mime}</span></div>
              </>
            )}
            <div className="flex justify-between gap-4"><span className="text-[var(--color-text-muted)]">{t('tools.file-type.magic')}</span><span className="font-mono">{result.hex}</span></div>
          </div>
        )}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.file-type.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default FileTypeTool;
