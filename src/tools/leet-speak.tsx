import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const EASY_MAP: Record<string, string> = {
  a: '4', b: '8', e: '3', g: '6', i: '1', o: '0', s: '5', t: '7', l: '1',
};

// Reference: https://en.wikipedia.org/wiki/Leet
const HARD_MAP: Record<string, string[]> = {
  a: ['4', '/\\', '@', '/-\\', '^', '(L', 'Д'],
  b: ['I3', '8', '13', '|3', 'ß', '!3', '(3', '/3', ')3', '|-]', 'j3'],
  c: ['[', '¢', '<', '(', '©'],
  d: [')', '|)', '(|', '[)', 'I>', '|>', '?', 'T)', 'I7', 'cl', '|}', '|]'],
  e: ['3', '&', '£', '€', '[-', '|=-'],
  f: ['|=', 'ƒ', '|#', 'ph', '/=', 'v'],
  g: ['6', '&', '(_+', '9', 'C-', 'gee', '(?,', '[,', '{,', '<-', '(.'],
  h: ['#', '/-/', '\\-\\', '[-]', ']-[', ')-(', '(-)', ':-:', '|~|', '|-|', ']~[', '}{', '!-!', '1-1', '\\-/', 'I+I'],
  i: ['1', '|', '][', '!', 'eye', '3y3'],
  j: [',_|', '_|', '._|', '._]', '_]', ',_]', ']'],
  k: ['>|', '|<', '1<', '|c', '|(', '7<'],
  l: ['1', '7', '2', '£', '|_', '|'],
  m: ['/\\/', '/V\\', '[V]', '|\\/|', '^^', '<\\/>', '{V}', '(v)', '(V)', '|\\|\\', ']\\/[', 'nn', '11'],
  n: ['^/', '|\\|', '/\\/', '[\\]', '<\\>', '{\\}', '/V', '^', 'ท', 'И'],
  o: ['0', '()', 'oh', '[]', 'p', '<>', 'Ø'],
  p: ['|*', '|o', '|º', '?', '|^', '|>', '|"', '9', '[]D', '|°', '|7'],
  q: ['(_)', '()_', '2', '0_', '<|', '&', '9', '¶', '⁋', '℗'],
  r: ['I2', '9', '|`', '|~', '|?', '/2', '|^', 'lz', '7', '2', '12', '®', '[z', 'Я', '.-', '|2', '|-'],
  s: ['5', '$', 'z', '§', 'ehs', 'es', '2'],
  t: ['7', '+', '-|-', "']['", '†', '«|»', '~|~'],
  u: ['(_)', '|_|', 'v', 'L|', 'บ'],
  v: ['\\/', '|/', '\\|'],
  w: ['\\/\\/', 'vv', '\\N', '//', '\\\\', '\\^/', '(n)', '\\V/', '\\X/', '\\|/', 'uu', '2u', 'พ', '₩'],
  x: ['><', '}{', 'ecks', '×', '?', ')(', ']['],
  y: ['j', '`/', '\\|/', '¥', '\\//'],
  z: ['2', '7_', '-/_', '%', '>_', 's', '~/_', '-_\\', '/-|_'],
};

function toLeetEasy(word: string): string {
  return word.split('').map((c) => EASY_MAP[c.toLowerCase()] ?? c).join('');
}

function toLeetHard(word: string): string {
  return word.split('').map((c) => {
    const variants = HARD_MAP[c.toLowerCase()];
    return variants ? variants[Math.floor(Math.random() * variants.length)] : c;
  }).join('');
}

const LeetSpeakTool = memo(function LeetSpeakTool() {
  const { t } = useTranslation();
  const [value, setValue] = useState('Toolbox');
  const [mode, setMode] = useState<'EASY' | 'HARD'>('EASY');
  const [seed, setSeed] = useState(0);

  const output = useMemo(() => {
    void seed;
    return mode === 'EASY' ? toLeetEasy(value) : toLeetHard(value);
  }, [value, mode, seed]);

  return (
    <ToolLayout id="leet-speak" color="#4ade80">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <select className="glass-select" value={mode} onChange={(event) => setMode(event.target.value as 'EASY' | 'HARD')}>
            <option value="EASY">{t('tools.leet-speak.easy')}</option>
            <option value="HARD">{t('tools.leet-speak.hard')}</option>
          </select>
          {mode === 'HARD' && <button className="glass-button-sm" onClick={() => setSeed((s) => s + 1)}>{t('tools.leet-speak.reroll')}</button>}
        </div>
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.leet-speak.input')}</h2>
          <GlassInput multiline aria-label={t('tools.leet-speak.input')} rows={6} value={value} onChange={(event) => setValue(event.target.value)} placeholder={t('tools.leet-speak.inputPlaceholder')} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.leet-speak.output')}</h2>
            <CopyButton value={output} />
          </div>
          <GlassInput multiline readOnly aria-label={t('tools.leet-speak.output')} rows={6} className="font-mono" value={output} onChange={() => {}} />
        </div>
      </div>
    </ToolLayout>
  );
});

export default LeetSpeakTool;
