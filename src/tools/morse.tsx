import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

// International Morse code table.
const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
};
const REVERSE: Record<string, string> = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));

function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.split('').map((char) => MORSE[char] ?? '').filter(Boolean).join(' '))
    .join(' / ');
}

function morseToText(morse: string): string {
  return morse
    .trim()
    .split(/\s*\/\s*/)
    .map((word) => word.split(/\s+/).filter(Boolean).map((code) => REVERSE[code] ?? '').join(''))
    .join(' ');
}

const initial = 'SOS';

const MorseTool = memo(function MorseTool() {
  const { t } = useTranslation();
  const [text, setText] = useState(initial);
  const [morse, setMorse] = useState(() => textToMorse(initial));

  const changeText = (value: string) => {
    setText(value);
    setMorse(textToMorse(value));
  };

  const changeMorse = (value: string) => {
    setMorse(value);
    setText(morseToText(value));
  };

  return (
    <ToolLayout id="morse" color="#22d3ee">
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.morse.text')}</h2>
            <CopyButton value={text} />
          </div>
          <GlassInput multiline aria-label={t('tools.morse.text')} rows={10} value={text} onChange={(event) => changeText(event.target.value)} placeholder={t('tools.morse.textPlaceholder')} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.morse.morse')}</h2>
            <CopyButton value={morse} />
          </div>
          <GlassInput multiline aria-label={t('tools.morse.morse')} rows={10} className="font-mono" value={morse} onChange={(event) => changeMorse(event.target.value)} placeholder="... --- ..." />
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.morse.hint')}</p>
    </ToolLayout>
  );
});

export default MorseTool;
