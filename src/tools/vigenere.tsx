import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function encrypt(plain: string, key: string): string {
  if (!key) return plain;
  let ctext = '';
  let kpos = 0;
  for (let i = 0; i < plain.length; i += 1) {
    const kcode = key.charCodeAt(kpos % key.length);
    const pcode = plain.charCodeAt(i);
    let ccode = pcode;
    if (pcode >= 65 && pcode <= 90) {
      if (kcode >= 65 && kcode <= 90) ccode = ((kcode - 65) + (pcode - 65)) % 26 + 65;
      if (kcode >= 97 && kcode <= 122) ccode = ((kcode - 97) + (pcode - 65)) % 26 + 65;
      kpos += 1;
    } else if (pcode >= 97 && pcode <= 122) {
      if (kcode >= 65 && kcode <= 90) ccode = ((kcode - 65) + (pcode - 97)) % 26 + 97;
      if (kcode >= 97 && kcode <= 122) ccode = ((kcode - 97) + (pcode - 97)) % 26 + 97;
      kpos += 1;
    }
    ctext += String.fromCharCode(ccode);
  }
  return ctext;
}

function decrypt(ctext: string, key: string): string {
  if (!key) return ctext;
  let plain = '';
  let kpos = 0;
  for (let i = 0; i < ctext.length; i += 1) {
    const kcode = key.charCodeAt(kpos % key.length);
    const ccode = ctext.charCodeAt(i);
    let pcode = ccode;
    if (ccode >= 65 && ccode <= 90) {
      if (kcode >= 65 && kcode <= 90) pcode = ((ccode - 65) - (kcode - 65) + 26) % 26 + 65;
      if (kcode >= 97 && kcode <= 122) pcode = ((ccode - 65) - (kcode - 97) + 26) % 26 + 65;
      kpos += 1;
    } else if (ccode >= 97 && ccode <= 122) {
      if (kcode >= 65 && kcode <= 90) pcode = ((ccode - 97) - (kcode - 65) + 26) % 26 + 97;
      if (kcode >= 97 && kcode <= 122) pcode = ((ccode - 97) - (kcode - 97) + 26) % 26 + 97;
      kpos += 1;
    }
    plain += String.fromCharCode(pcode);
  }
  return plain;
}

const VigenereTool = memo(function VigenereTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('ATTACKATDAWN');
  const [key, setKey] = useState('LEMON');
  const [output, setOutput] = useState(() => encrypt('ATTACKATDAWN', 'LEMON'));

  return (
    <ToolLayout id="vigenere" color="#f472b6">
      <div className="flex flex-col gap-4">
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.vigenere.key')}
          <GlassInput className="mt-1 font-mono" value={key} onChange={(e) => setKey(e.target.value)} />
        </label>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 font-semibold">{t('tools.vigenere.input')}</h2>
            <GlassInput multiline rows={8} className="font-mono" value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.vigenere.output')}</h2>
              <CopyButton value={output} />
            </div>
            <GlassInput multiline readOnly rows={8} className="font-mono" value={output} onChange={() => {}} />
          </div>
        </div>
        <div className="flex gap-2">
          <GlassButton onClick={() => setOutput(encrypt(input, key))}>{t('tools.vigenere.encrypt')}</GlassButton>
          <GlassButton onClick={() => setOutput(decrypt(input, key))}>{t('tools.vigenere.decrypt')}</GlassButton>
        </div>
      </div>
    </ToolLayout>
  );
});

export default VigenereTool;
