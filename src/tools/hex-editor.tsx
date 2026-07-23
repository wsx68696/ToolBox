import { memo, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropzone from '../components/Dropzone';
import GlassButton from '../components/GlassButton';
import ToolLayout from '../components/ToolLayout';

const BYTES_PER_ROW = 16;

function toHex(n: number, width: number) {
  return n.toString(16).padStart(width, '0').toUpperCase();
}

function printable(n: number) {
  return n >= 0x20 && n <= 0x7e ? String.fromCharCode(n) : '.';
}

const HexEditorTool = memo(function HexEditorTool() {
  const { t } = useTranslation();
  const [bytes, setBytes] = useState<Uint8Array>(new Uint8Array());
  const [fileName, setFileName] = useState('data.bin');
  const [dirty, setDirty] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const onFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setBytes(new Uint8Array(reader.result as ArrayBuffer));
      setFileName(file.name || 'data.bin');
      setDirty(false);
      setSelected(null);
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const rows = useMemo(() => Math.ceil(bytes.length / BYTES_PER_ROW), [bytes.length]);

  const setByte = (offset: number, value: number) => {
    if (offset < 0 || offset >= bytes.length) return;
    const next = bytes.slice();
    next[offset] = value & 0xff;
    setBytes(next);
    setDirty(true);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([bytes]));
    const a = document.createElement('a');
    a.href = url;
    a.download = dirty ? fileName.replace(/(\.[^.]+)?$/, '-edited$1') : fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout id="hex-editor" color="#818cf8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Dropzone label={t('tools.hex-editor.dropLabel')} inputLabel={t('tools.hex-editor.dropLabel')} onFile={onFile} className="flex-1" />
          {bytes.length > 0 && (
            <>
              <span className="text-sm text-[var(--color-text-muted)]">{fileName} · {bytes.length} B{dirty ? ` · ${t('tools.hex-editor.modified')}` : ''}</span>
              <GlassButton onClick={download}>{t('tools.hex-editor.download')}</GlassButton>
            </>
          )}
        </div>
        {bytes.length > 0 && (
          <div className="glass-card max-h-[32rem] overflow-auto p-2 font-mono text-xs leading-6">
            <div className="sticky top-0 z-10 mb-1 grid grid-cols-[5rem_1fr_10rem] gap-2 bg-[var(--color-bg-elevated)] px-2 py-1 text-[var(--color-text-muted)]">
              <span>Offset</span>
              <span>00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F</span>
              <span>ASCII</span>
            </div>
            {Array.from({ length: rows }, (_, row) => {
              const base = row * BYTES_PER_ROW;
              const cells = Array.from({ length: BYTES_PER_ROW }, (_, col) => {
                const offset = base + col;
                if (offset >= bytes.length) return null;
                return (
                  <button
                    key={col}
                    type="button"
                    className={`w-6 rounded text-center hover:bg-[var(--color-surface-hover)] ${selected === offset ? 'bg-[var(--color-ring)] text-[var(--color-bg)]' : dirty && false ? '' : ''}`}
                    onClick={() => setSelected(offset)}
                    onDoubleClick={() => {
                      const next = window.prompt(t('tools.hex-editor.editPrompt'), toHex(bytes[offset], 2));
                      if (next == null) return;
                      const clean = next.replace(/[^0-9a-fA-F]/g, '');
                      if (clean.length === 0) return;
                      setByte(offset, parseInt(clean.slice(-2), 16));
                    }}
                  >
                    {toHex(bytes[offset], 2)}
                  </button>
                );
              });
              const ascii = Array.from({ length: BYTES_PER_ROW }, (_, col) => {
                const offset = base + col;
                return offset < bytes.length ? printable(bytes[offset]) : ' ';
              }).join('');
              return (
                <div key={row} className="grid grid-cols-[5rem_1fr_10rem] gap-2 px-2 hover:bg-[var(--color-surface)]">
                  <span className="text-[var(--color-text-muted)]">{toHex(base, 8)}</span>
                  <div className="flex flex-wrap gap-x-1">{cells}</div>
                  <span className="text-[var(--color-text-muted)]">{ascii}</span>
                </div>
              );
            })}
          </div>
        )}
        {selected != null && selected < bytes.length && (
          <p className="text-sm text-[var(--color-text-muted)]">
            {t('tools.hex-editor.selected', { offset: toHex(selected, 8), hex: toHex(bytes[selected], 2), dec: bytes[selected], ascii: printable(bytes[selected]) })}
          </p>
        )}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.hex-editor.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default HexEditorTool;
