import { entropyToMnemonic, generateMnemonic, mnemonicToEntropy, validateMnemonic } from '@scure/bip39';
import { wordlist as czech } from '@scure/bip39/wordlists/czech.js';
import { wordlist as english } from '@scure/bip39/wordlists/english.js';
import { wordlist as french } from '@scure/bip39/wordlists/french.js';
import { wordlist as italian } from '@scure/bip39/wordlists/italian.js';
import { wordlist as japanese } from '@scure/bip39/wordlists/japanese.js';
import { wordlist as korean } from '@scure/bip39/wordlists/korean.js';
import { wordlist as portuguese } from '@scure/bip39/wordlists/portuguese.js';
import { wordlist as simplifiedChinese } from '@scure/bip39/wordlists/simplified-chinese.js';
import { wordlist as spanish } from '@scure/bip39/wordlists/spanish.js';
import { wordlist as traditionalChinese } from '@scure/bip39/wordlists/traditional-chinese.js';
import { RefreshCw } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const LANGUAGES: { key: string; label: string; wordlist: string[] }[] = [
  { key: 'english', label: 'English', wordlist: english },
  { key: 'simplifiedChinese', label: '简体中文', wordlist: simplifiedChinese },
  { key: 'traditionalChinese', label: '繁體中文', wordlist: traditionalChinese },
  { key: 'czech', label: 'Čeština', wordlist: czech },
  { key: 'french', label: 'Français', wordlist: french },
  { key: 'italian', label: 'Italiano', wordlist: italian },
  { key: 'japanese', label: '日本語', wordlist: japanese },
  { key: 'korean', label: '한국어', wordlist: korean },
  { key: 'portuguese', label: 'Português', wordlist: portuguese },
  { key: 'spanish', label: 'Español', wordlist: spanish },
];

const STRENGTHS = [128, 160, 192, 224, 256];
const WORD_COUNT: Record<number, number> = { 128: 12, 160: 15, 192: 18, 224: 21, 256: 24 };

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

const Bip39GeneratorTool = memo(function Bip39GeneratorTool() {
  const { t } = useTranslation();
  const [langKey, setLangKey] = useState('english');
  const [strength, setStrength] = useState(128);
  const [mnemonic, setMnemonic] = useState('');

  const wordlist = useMemo(() => LANGUAGES.find((lang) => lang.key === langKey)?.wordlist ?? english, [langKey]);
  const separator = langKey === 'japanese' ? '　' : ' ';

  const generate = useCallback(() => {
    setMnemonic(generateMnemonic(wordlist, strength));
  }, [wordlist, strength]);

  useEffect(() => { generate(); }, [generate]);

  const analysis = useMemo(() => {
    const trimmed = mnemonic.trim();
    if (!trimmed) return null;
    const valid = validateMnemonic(trimmed, wordlist);
    let entropy = '';
    if (valid) {
      try { entropy = toHex(mnemonicToEntropy(trimmed, wordlist)); } catch { /* ignore */ }
    }
    return { valid, entropy, words: trimmed.split(/\s+/).length };
  }, [mnemonic, wordlist]);

  const [entropyHex, setEntropyHex] = useState('');
  const [entropyError, setEntropyError] = useState(false);
  const fromEntropy = (value: string) => {
    setEntropyHex(value);
    const clean = value.replace(/[^0-9a-fA-F]/g, '');
    if (!clean || clean.length % 2 !== 0 || !STRENGTHS.includes(clean.length * 4)) { setEntropyError(true); return; }
    try {
      const bytes = new Uint8Array(clean.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));
      setMnemonic(entropyToMnemonic(bytes, wordlist));
      setEntropyError(false);
    } catch {
      setEntropyError(true);
    }
  };

  return (
    <ToolLayout id="bip39-generator" color="#fbbf24">
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="block text-sm text-[var(--color-text-muted)]">
          {t('tools.bip39-generator.language')}
          <select className="glass-select mt-2 block" value={langKey} onChange={(event) => setLangKey(event.target.value)} aria-label={t('tools.bip39-generator.language')}>
            {LANGUAGES.map((lang) => <option key={lang.key} value={lang.key}>{lang.label}</option>)}
          </select>
        </label>
        <label className="block text-sm text-[var(--color-text-muted)]">
          {t('tools.bip39-generator.strength')}
          <select className="glass-select mt-2 block" value={strength} onChange={(event) => setStrength(Number(event.target.value))} aria-label={t('tools.bip39-generator.strength')}>
            {STRENGTHS.map((value) => <option key={value} value={value}>{value} {t('tools.bip39-generator.bits')} · {WORD_COUNT[value]} {t('tools.bip39-generator.words')}</option>)}
          </select>
        </label>
        <GlassButton onClick={generate}><RefreshCw size={16} /> {t('tools.bip39-generator.generate')}</GlassButton>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">{t('tools.bip39-generator.mnemonic')}</h2>
        <CopyButton value={mnemonic} />
      </div>
      <GlassInput
        multiline
        rows={3}
        aria-label={t('tools.bip39-generator.mnemonic')}
        value={mnemonic}
        onChange={(event) => setMnemonic(event.target.value)}
        className={`text-lg ${analysis && !analysis.valid ? 'border-red-400/60' : ''}`}
      />
      {mnemonic.trim() && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {mnemonic.trim().split(/\s+/).map((word, index) => (
            <span key={index} className="rounded-md bg-white/5 px-2 py-1 font-mono text-sm">
              <span className="mr-1.5 text-xs text-[var(--color-text-muted)]">{index + 1}</span>{word}
            </span>
          ))}
        </div>
      )}

      {analysis && (
        <div className="mono-panel mt-4 divide-y divide-white/5">
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-[var(--color-text-muted)]">{t('tools.bip39-generator.valid')}</span>
            <span className={analysis.valid ? 'text-emerald-600 dark:text-emerald-300' : 'text-red-500 dark:text-red-300'}>{analysis.valid ? t('tools.bip39-generator.yes') : t('tools.bip39-generator.no')}</span>
          </div>
          <div className="flex justify-between px-4 py-2.5 text-sm">
            <span className="text-[var(--color-text-muted)]">{t('tools.bip39-generator.wordCount')}</span>
            <span className="font-mono">{analysis.words}</span>
          </div>
          {analysis.entropy && (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span className="shrink-0 text-[var(--color-text-muted)]">{t('tools.bip39-generator.entropy')}</span>
              <span className="flex items-center gap-2 truncate font-mono"><span className="truncate">{analysis.entropy}</span><CopyButton value={analysis.entropy} /></span>
            </div>
          )}
        </div>
      )}

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold" htmlFor="bip39-entropy">{t('tools.bip39-generator.fromEntropy')}</label>
        <GlassInput
          id="bip39-entropy"
          value={entropyHex}
          onChange={(event) => fromEntropy(event.target.value)}
          placeholder={t('tools.bip39-generator.entropyPlaceholder')}
          className={`font-mono ${entropyError ? 'border-red-400/60' : ''}`}
        />
        {entropyError && <p className="mt-2 text-sm text-red-500 dark:text-red-300">{t('tools.bip39-generator.entropyInvalid')}</p>}
      </div>

      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.bip39-generator.hint')}</p>
    </ToolLayout>
  );
});

export default Bip39GeneratorTool;
