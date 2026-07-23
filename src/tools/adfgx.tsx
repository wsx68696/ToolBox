import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function encryptAdfgx(plainIn: string, squareIn: string, keywordIn: string): string {
  let plaintext = plainIn.toLowerCase().replace(/[^a-z]/g, '').replace(/j/g, 'i');
  let keysquare = squareIn.toLowerCase().replace(/[^a-z]/g, '');
  let keyword = keywordIn.toLowerCase().replace(/[^a-z]/g, '');
  if (plaintext.length < 1) throw new Error('empty plaintext');
  if (keysquare.length !== 25) throw new Error('keysquare must be 25 letters');
  if (keyword.length <= 1) throw new Error('keyword too short');
  const adfgvx = 'ADFGX';
  let ciphertext1 = '';
  for (let i = 0; i < plaintext.length; i += 1) {
    const index = keysquare.indexOf(plaintext.charAt(i));
    if (index < 0) continue;
    ciphertext1 += adfgvx.charAt(Math.floor(index / 5)) + adfgvx.charAt(index % 5);
  }
  const colLength = ciphertext1.length / keyword.length;
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let ciphertext = '';
  let k = 0;
  for (let i = 0; i < keyword.length; i += 1) {
    let t = -1;
    while (k < 26) {
      t = keyword.indexOf(chars.charAt(k));
      const arrkw = keyword.split('');
      if (t >= 0) arrkw[t] = '_';
      keyword = arrkw.join('');
      if (t >= 0) break;
      k += 1;
    }
    for (let j = 0; j < colLength; j += 1) ciphertext += ciphertext1.charAt(j * keyword.length + t);
  }
  return ciphertext;
}

function decryptAdfgx(cipherIn: string, squareIn: string, keywordIn: string): string {
  const ciphertext = cipherIn.toLowerCase().replace(/[^a-z]/g, '');
  const keysquare = squareIn.toLowerCase().replace(/[^a-z]/g, '');
  let keyword = keywordIn.toLowerCase().replace(/[^a-z]/g, '');
  const klen = keyword.length;
  if (ciphertext.length < 1) throw new Error('empty ciphertext');
  if (/[^adfgx]/.test(ciphertext)) throw new Error('ciphertext must be A/D/F/G/X');
  if (ciphertext.length % 2 !== 0) throw new Error('ciphertext length must be even');
  if (keysquare.length !== 25) throw new Error('keysquare must be 25 letters');
  if (klen <= 1) throw new Error('keyword too short');
  const numLongCols = ciphertext.length % klen;
  const cols: string[] = new Array(klen);
  const colLength = Math.floor(ciphertext.length / klen);
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  let i = 0;
  let upto = 0;
  for (let j = 0; j < klen; ) {
    const t = keyword.indexOf(chars.charAt(i));
    if (t >= 0) {
      const cl = t < numLongCols ? colLength + 1 : colLength;
      cols[t] = ciphertext.substr(upto, cl);
      upto += cl;
      const arrkw = keyword.split('');
      arrkw[t] = '_';
      keyword = arrkw.join('');
      j += 1;
    } else i += 1;
  }
  let plaintext1 = '';
  for (let j = 0; j < colLength + 1; j += 1) {
    for (let c = 0; c < klen; c += 1) plaintext1 += cols[c].charAt(j);
  }
  const adfgvx = 'adfgx';
  let plaintext = '';
  for (let p = 0; p + 1 < plaintext1.length; p += 2) {
    const keyindex = adfgvx.indexOf(plaintext1.charAt(p)) * 5 + adfgvx.indexOf(plaintext1.charAt(p + 1));
    plaintext += keysquare.charAt(keyindex);
  }
  return plaintext;
}

const DEFAULT_SQUARE = 'phqgmeaynofdxkrcvszwbutil';

const AdfgxTool = memo(function AdfgxTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('attack');
  const [square, setSquare] = useState(DEFAULT_SQUARE);
  const [keyword, setKeyword] = useState('cargo');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const run = (mode: 'enc' | 'dec') => {
    try {
      setOutput(mode === 'enc' ? encryptAdfgx(input, square, keyword) : decryptAdfgx(input, square, keyword));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.adfgx.error'));
      setOutput('');
    }
  };

  return (
    <ToolLayout id="adfgx" color="#22d3ee">
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.adfgx.square')}
            <GlassInput className="mt-1 font-mono" value={square} onChange={(e) => setSquare(e.target.value)} />
          </label>
          <label className="text-sm text-[var(--color-text-muted)]">
            {t('tools.adfgx.keyword')}
            <GlassInput className="mt-1 font-mono" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </label>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 font-semibold">{t('tools.adfgx.input')}</h2>
            <GlassInput multiline rows={6} className="font-mono" value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.adfgx.output')}</h2>
              <CopyButton value={output} />
            </div>
            <GlassInput multiline readOnly rows={6} className="font-mono" value={output} onChange={() => {}} />
          </div>
        </div>
        <div className="flex gap-2">
          <GlassButton onClick={() => run('enc')}>{t('tools.adfgx.encrypt')}</GlassButton>
          <GlassButton onClick={() => run('dec')}>{t('tools.adfgx.decrypt')}</GlassButton>
        </div>
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.adfgx.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default AdfgxTool;
