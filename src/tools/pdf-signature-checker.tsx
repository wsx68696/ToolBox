import { FileCheck2 } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import ToolLayout from '../components/ToolLayout';

interface SignatureInfo {
  offset: number;
  name?: string;
  reason?: string;
  location?: string;
  date?: string;
  contactInfo?: string;
  subFilter?: string;
}

interface Report {
  fileName: string;
  fileSize: number;
  pdfVersion: string;
  signed: boolean;
  signatures: SignatureInfo[];
}

function readField(text: string, from: number, key: string): string | undefined {
  const idx = text.indexOf(`/${key}`, from);
  if (idx < 0 || idx > from + 4000) return undefined;
  const rest = text.slice(idx + key.length + 1, idx + key.length + 400);
  const paren = rest.match(/^\s*\(((?:[^()\\]|\\.)*)\)/);
  if (paren) return paren[1].replace(/\\([()\\])/g, '$1');
  const name = rest.match(/^\s*\/([^\s/<>\]]+)/);
  if (name) return name[1];
  return undefined;
}

function parsePdfDate(raw?: string): string | undefined {
  if (!raw) return undefined;
  const match = raw.match(/D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/);
  if (!match) return raw;
  const [, y, mo = '01', d = '01', h = '00', mi = '00', s = '00'] = match;
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}

function analyze(bytes: Uint8Array, file: File): Report {
  const text = new TextDecoder('latin1').decode(bytes);
  const versionMatch = text.match(/^%PDF-(\d\.\d)/);
  const signatures: SignatureInfo[] = [];
  const regex = /\/ByteRange\s*\[/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const offset = match.index;
    signatures.push({
      offset,
      name: readField(text, offset, 'Name'),
      reason: readField(text, offset, 'Reason'),
      location: readField(text, offset, 'Location'),
      contactInfo: readField(text, offset, 'ContactInfo'),
      subFilter: readField(text, offset, 'SubFilter'),
      date: parsePdfDate(readField(text, offset, 'M')),
    });
  }
  return {
    fileName: file.name,
    fileSize: file.size,
    pdfVersion: versionMatch ? versionMatch[1] : '?',
    signed: signatures.length > 0,
    signatures,
  };
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const PdfSignatureCheckerTool = memo(function PdfSignatureCheckerTool() {
  const { t } = useTranslation();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState(false);

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const bytes = new Uint8Array(reader.result as ArrayBuffer);
        const header = new TextDecoder('latin1').decode(bytes.slice(0, 5));
        if (header !== '%PDF-') { setError(true); setReport(null); return; }
        setReport(analyze(bytes, file));
        setError(false);
      } catch {
        setError(true);
        setReport(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <ToolLayout id="pdf-signature-checker" color="#f87171">
      <Dropzone label={t('tools.pdf-signature-checker.dropLabel')} inputLabel={t('tools.pdf-signature-checker.dropLabel')} onFile={onFile} />
      {error && <p className="mt-4 text-sm text-red-500 dark:text-red-300">{t('tools.pdf-signature-checker.invalid')}</p>}
      {report && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${report.signed ? 'bg-emerald-400/15 text-emerald-600 dark:text-emerald-300' : 'bg-white/10 text-[var(--color-text-muted)]'}`}>
              <FileCheck2 size={16} />
              {report.signed ? t('tools.pdf-signature-checker.signed', { count: report.signatures.length }) : t('tools.pdf-signature-checker.notSigned')}
            </span>
          </div>
          <div className="mono-panel divide-y divide-white/5">
            <div className="flex justify-between px-4 py-2.5 text-sm"><span className="text-[var(--color-text-muted)]">{t('tools.pdf-signature-checker.fileName')}</span><span className="truncate font-mono">{report.fileName}</span></div>
            <div className="flex justify-between px-4 py-2.5 text-sm"><span className="text-[var(--color-text-muted)]">{t('tools.pdf-signature-checker.fileSize')}</span><span className="font-mono">{formatSize(report.fileSize)}</span></div>
            <div className="flex justify-between px-4 py-2.5 text-sm"><span className="text-[var(--color-text-muted)]">{t('tools.pdf-signature-checker.pdfVersion')}</span><span className="font-mono">PDF {report.pdfVersion}</span></div>
          </div>
          {report.signatures.map((signature, index) => (
            <div key={index} className="glass-input p-4">
              <h3 className="mb-2 text-sm font-semibold">{t('tools.pdf-signature-checker.signature', { index: index + 1 })}</h3>
              <div className="space-y-1 text-sm">
                {([
                  ['signer', signature.name],
                  ['reason', signature.reason],
                  ['location', signature.location],
                  ['date', signature.date],
                  ['contact', signature.contactInfo],
                  ['subFilter', signature.subFilter],
                ] as const).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <span className="text-[var(--color-text-muted)]">{t(`tools.pdf-signature-checker.${key}`)}</span>
                    <span className="truncate font-mono">{value ?? '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.pdf-signature-checker.hint')}</p>
    </ToolLayout>
  );
});

export default PdfSignatureCheckerTool;
