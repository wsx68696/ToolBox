import { FileUp } from 'lucide-react';
import { memo, useState, type DragEvent } from 'react';

interface DropzoneProps {
  label: string;
  inputLabel: string;
  onFile: (file: File) => void;
  className?: string;
}

const Dropzone = memo(function Dropzone({ label, inputLabel, onFile, className = '' }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);

  const pick = (file: File | null | undefined) => { if (file) onFile(file); };

  return (
    <label
      className={`glass-dropzone ${dragging ? 'glass-dropzone-active' : ''} ${className}`}
      onDragOver={(event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event: DragEvent<HTMLLabelElement>) => { event.preventDefault(); setDragging(false); pick(event.dataTransfer.files.item(0)); }}
    >
      <FileUp size={22} className="glass-dropzone-icon" aria-hidden="true" />
      <span className="text-sm">{label}</span>
      <input aria-label={inputLabel} type="file" className="sr-only" onChange={(event) => pick(event.target.files?.item(0))} />
    </label>
  );
});

export default Dropzone;
