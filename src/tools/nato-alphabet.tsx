import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const nato: Record<string, string> = {
  a: 'Alfa', b: 'Bravo', c: 'Charlie', d: 'Delta', e: 'Echo', f: 'Foxtrot', g: 'Golf',
  h: 'Hotel', i: 'India', j: 'Juliett', k: 'Kilo', l: 'Lima', m: 'Mike', n: 'November',
  o: 'Oscar', p: 'Papa', q: 'Quebec', r: 'Romeo', s: 'Sierra', t: 'Tango', u: 'Uniform',
  v: 'Victor', w: 'Whiskey', x: 'X-ray', y: 'Yankee', z: 'Zulu',
  0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
};

const NatoAlphabetTool = memo(function NatoAlphabetTool() {
  const { t } = useTranslation();
  const [text, setText] = useState('Toolbox 2026');

  const output = useMemo(() => {
    return [...text.toLowerCase()].map((ch) => {
      if (nato[ch]) return nato[ch];
      if (ch === ' ') return '(space)';
      return ch;
    }).join(' ');
  }, [text]);

  return (
    <ToolLayout id="nato-alphabet" color="#22d3ee">
      <GlassInput aria-label={t('tools.nato-alphabet.inputPlaceholder')} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.nato-alphabet.inputPlaceholder')} />
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t('tools.nato-alphabet.result')}</h2>
          <CopyButton value={output} />
        </div>
        <div className="glass-input min-h-24 p-4 leading-8">{output}</div>
      </div>
    </ToolLayout>
  );
});

export default NatoAlphabetTool;
