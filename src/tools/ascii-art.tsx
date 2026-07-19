import figlet from 'figlet';
import standard from 'figlet/importable-fonts/Standard.js';
import big from 'figlet/importable-fonts/Big.js';
import slant from 'figlet/importable-fonts/Slant.js';
import small from 'figlet/importable-fonts/Small.js';
import banner from 'figlet/importable-fonts/Banner.js';
import { memo, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const FONTS = ['Standard', 'Big', 'Slant', 'Small', 'Banner'] as const;
type FontName = (typeof FONTS)[number];

let registered = false;
function registerFonts() {
  if (registered) return;
  figlet.parseFont('Standard', standard);
  figlet.parseFont('Big', big);
  figlet.parseFont('Slant', slant);
  figlet.parseFont('Small', small);
  figlet.parseFont('Banner', banner);
  registered = true;
}

const AsciiArtTool = memo(function AsciiArtTool() {
  const { t } = useTranslation();
  const [text, setText] = useState('Toolbox');
  const [font, setFont] = useState<FontName>('Standard');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    registerFonts();
    setReady(true);
  }, []);

  const output = useMemo(() => {
    if (!ready) return '';
    try {
      return figlet.textSync(text || ' ', { font });
    } catch {
      return '';
    }
  }, [text, font, ready]);

  return (
    <ToolLayout id="ascii-art" color="#22d3ee">
      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="mb-2 block font-semibold" htmlFor="ascii-text">{t('tools.ascii-art.inputLabel')}</label>
          <GlassInput
            id="ascii-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t('tools.ascii-art.placeholder')}
          />
        </div>
        <div>
          <label className="mb-2 block font-semibold" htmlFor="ascii-font">{t('tools.ascii-art.font')}</label>
          <select
            id="ascii-font"
            className="glass-select"
            value={font}
            onChange={(event) => setFont(event.target.value as FontName)}
          >
            {FONTS.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">{t('tools.ascii-art.output')}</h2>
        <CopyButton value={output} />
      </div>
      <pre className="mono-panel overflow-x-auto px-4 py-3 font-mono text-xs leading-tight whitespace-pre">{output}</pre>
    </ToolLayout>
  );
});

export default AsciiArtTool;
