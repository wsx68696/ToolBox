import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const UU = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_';
const XX = '+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function encodeUnix(text: string, alphabet: string): string {
  const bytes = new TextEncoder().encode(text);
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const remaining = Math.min(3, bytes.length - i);
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    // length char for this line segment — classic uu uses one line; emit chunk with length
    // For simplicity emit continuous body with leading length for whole buffer once at start later.
    const c1 = alphabet[(b0 >> 2) & 0x3f];
    const c2 = alphabet[((b0 << 4) | (b1 >> 4)) & 0x3f];
    const c3 = alphabet[((b1 << 2) | (b2 >> 6)) & 0x3f];
    const c4 = alphabet[b2 & 0x3f];
    if (remaining === 1) out += c1 + c2;
    else if (remaining === 2) out += c1 + c2 + c3;
    else out += c1 + c2 + c3 + c4;
  }
  // classic line: length char + data
  const lenChar = alphabet[bytes.length & 0x3f] ?? alphabet[0];
  return lenChar + out;
}

function decodeUnix(text: string, alphabet: string): string {
  const clean = text.replace(/\s+/g, '');
  if (!clean) return '';
  const map = new Map(alphabet.split('').map((c, i) => [c, i]));
  // skip length char
  const body = clean.slice(1);
  const out: number[] = [];
  for (let i = 0; i < body.length; i += 4) {
    const v = [0, 1, 2, 3].map((k) => map.get(body[i + k] ?? alphabet[0]) ?? 0);
    out.push(((v[0] << 2) | (v[1] >> 4)) & 0xff);
    if (i + 2 < body.length) out.push(((v[1] << 4) | (v[2] >> 2)) & 0xff);
    if (i + 3 < body.length) out.push(((v[2] << 6) | v[3]) & 0xff);
  }
  // trim by length char
  const expected = map.get(clean[0]) ?? out.length;
  return new TextDecoder().decode(Uint8Array.from(out.slice(0, expected)));
}

const UuXxTool = memo(function UuXxTool() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'uu' | 'xx'>('uu');
  const [input, setInput] = useState('Toolbox');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const alphabet = mode === 'uu' ? UU : XX;

  const run = (enc: boolean) => {
    try {
      setOutput(enc ? encodeUnix(input, alphabet) : decodeUnix(input, alphabet));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.uu-xx.error'));
    }
  };

  return (
    <ToolLayout id="uu-xx" color="#818cf8">
      <div className="flex flex-col gap-4">
        <select className="glass-select self-start" value={mode} onChange={(e) => setMode(e.target.value as 'uu' | 'xx')}>
          <option value="uu">UUencode</option>
          <option value="xx">XXencode</option>
        </select>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 font-semibold">{t('tools.uu-xx.input')}</h2>
            <GlassInput multiline rows={8} className="font-mono" value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.uu-xx.output')}</h2>
              <CopyButton value={output} />
            </div>
            <GlassInput multiline readOnly rows={8} className="font-mono" value={output} onChange={() => {}} />
          </div>
        </div>
        <div className="flex gap-2">
          <GlassButton onClick={() => run(true)}>{t('tools.uu-xx.encode')}</GlassButton>
          <GlassButton onClick={() => run(false)}>{t('tools.uu-xx.decode')}</GlassButton>
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.uu-xx.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default UuXxTool;
