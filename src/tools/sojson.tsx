import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

/**
 * Lightweight sojson / jsjiami-style unpacker:
 * 1) beautify whitespace a bit
 * 2) evaluate hex / unicode escapes
 * 3) replace bracket notation with dots
 * This is intentionally best-effort for CTF obfuscation, not a full deobfuscator.
 */
function unpackSojson(jsBody: string): string {
  let js = jsBody;
  // \xNN and \uNNNN
  js = js.replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  js = js.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  // obj["key"] -> obj.key when safe
  js = js.replace(/([a-zA-Z0-9_$)\]]+)\s*\[\s*['"]([a-zA-Z_][\w]*)['"]\s*\]/g, '$1.$2');
  // split long lines roughly
  js = js.replace(/;/g, ';\n').replace(/\{/g, '{\n').replace(/\}/g, '\n}\n');
  return js;
}

const SojsonTool = memo(function SojsonTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState("var _0x1=['log'];(function(_0x2,_0x3){var _0x4=function(_0x5){while(--_0x5){_0x2['push'](_0x2['shift']());}};_0x4(++_0x3);}(_0x1,0x1));var _0x6=function(_0x7,_0x8){_0x7=_0x7-0x0;var _0x9=_0x1[_0x7];return _0x9;};console[_0x6('0x0')]('hi');");
  const [output, setOutput] = useState('');

  return (
    <ToolLayout id="sojson" color="#fbbf24">
      <div className="flex flex-col gap-4">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <h2 className="mb-2 font-semibold">{t('tools.sojson.input')}</h2>
            <GlassInput multiline rows={14} className="font-mono text-xs" value={input} onChange={(e) => setInput(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t('tools.sojson.output')}</h2>
              <CopyButton value={output} />
            </div>
            <GlassInput multiline readOnly rows={14} className="font-mono text-xs" value={output} onChange={() => {}} />
          </div>
        </div>
        <GlassButton onClick={() => setOutput(unpackSojson(input))}>{t('tools.sojson.decode')}</GlassButton>
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.sojson.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default SojsonTool;
