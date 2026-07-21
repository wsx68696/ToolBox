import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

// Encodes UTF-8 text into the 12 socialist core values (24 chinese chars)
// using a duodecimal scheme popular in Chinese CTF challenges.
const VALUES = '富强民主文明和谐自由平等公正法治爱国敬业诚信友善';

function randBin(): boolean {
  return Math.random() >= 0.5;
}

function str2utf8(str: string): string {
  const notEncoded = /[A-Za-z0-9-_.!~*'()]/g;
  const str1 = str.replace(notEncoded, (c) => (c.codePointAt(0) as number).toString(16));
  return encodeURIComponent(str1).replace(/%/g, '').toUpperCase();
}

function utf82str(utfs: string): string {
  if ((utfs.length & 1) !== 0) throw new Error('bad length');
  const splited: string[] = [];
  for (let i = 0; i < utfs.length; i += 1) {
    if ((i & 1) === 0) splited.push('%');
    splited.push(utfs[i]);
  }
  return decodeURIComponent(splited.join(''));
}

function hex2duo(hexs: string): number[] {
  const duo: number[] = [];
  for (const c of hexs) {
    const n = Number.parseInt(c, 16);
    if (n < 10) {
      duo.push(n);
    } else if (randBin()) {
      duo.push(10, n - 10);
    } else {
      duo.push(11, n - 6);
    }
  }
  return duo;
}

function duo2hex(duo: number[]): string {
  const hex: number[] = [];
  let i = 0;
  while (i < duo.length) {
    if (duo[i] < 10) {
      hex.push(duo[i]);
    } else if (duo[i] === 10) {
      i += 1;
      hex.push(duo[i] + 10);
    } else {
      i += 1;
      hex.push(duo[i] + 6);
    }
    i += 1;
  }
  return hex.map((v) => v.toString(16).toUpperCase()).join('');
}

function encode(str: string): string {
  return hex2duo(str2utf8(str)).map((d) => VALUES[2 * d] + VALUES[2 * d + 1]).join('');
}

function decode(encoded: string): string {
  const duo: number[] = [];
  for (const c of encoded) {
    const i = VALUES.indexOf(c);
    if (i === -1 || (i & 1)) continue;
    duo.push(i >> 1);
  }
  const hexs = duo2hex(duo);
  if ((hexs.length & 1) !== 0) throw new Error('bad');
  return utf82str(hexs);
}

const CoreValuesCipherTool = memo(function CoreValuesCipherTool() {
  const { t } = useTranslation();
  const [text, setText] = useState('工具箱');
  const [cipher, setCipher] = useState('');
  const [error, setError] = useState('');

  const doEncode = () => {
    try {
      setCipher(encode(text));
      setError('');
    } catch {
      setError(t('tools.core-values-cipher.encodeError'));
    }
  };

  const doDecode = () => {
    try {
      setText(decode(cipher));
      setError('');
    } catch {
      setError(t('tools.core-values-cipher.decodeError'));
    }
  };

  return (
    <ToolLayout id="core-values-cipher" color="#f87171">
      <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.core-values-cipher.text')}</h2>
            <CopyButton value={text} />
          </div>
          <GlassInput multiline aria-label={t('tools.core-values-cipher.text')} rows={10} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.core-values-cipher.textPlaceholder')} />
        </div>
        <div className="flex flex-row justify-center gap-2 lg:flex-col">
          <GlassButton onClick={doEncode}>{t('tools.core-values-cipher.encode')}</GlassButton>
          <GlassButton onClick={doDecode}>{t('tools.core-values-cipher.decode')}</GlassButton>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.core-values-cipher.cipher')}</h2>
            <CopyButton value={cipher} />
          </div>
          <GlassInput multiline aria-label={t('tools.core-values-cipher.cipher')} rows={10} value={cipher} onChange={(event) => setCipher(event.target.value)} placeholder={t('tools.core-values-cipher.cipherPlaceholder')} />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-500 dark:text-red-300">{error}</p>}
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.core-values-cipher.hint')}</p>
    </ToolLayout>
  );
});

export default CoreValuesCipherTool;
