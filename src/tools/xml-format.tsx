import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function escapeXmlText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(value: string): string {
  return escapeXmlText(value).replace(/"/g, '&quot;');
}

function serializeNode(node: Node, depth: number, minify: boolean): string {
  const pad = minify ? '' : '  '.repeat(depth);
  const nl = minify ? '' : '\n';

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? '').trim();
    return text ? `${pad}${escapeXmlText(text)}${nl}` : '';
  }
  if (node.nodeType === Node.COMMENT_NODE) {
    return `${pad}<!--${node.textContent ?? ''}-->${nl}`;
  }
  if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `${pad}<![CDATA[${node.textContent ?? ''}]]>${nl}`;
  }
  if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    const pi = node as ProcessingInstruction;
    return `${pad}<?${pi.target} ${pi.data}?>${nl}`;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const element = node as Element;
  const attrs = Array.from(element.attributes).map((attr) => ` ${attr.name}="${escapeAttr(attr.value)}"`).join('');
  const children = Array.from(element.childNodes).filter((child) => {
    if (child.nodeType === Node.TEXT_NODE) return (child.textContent ?? '').trim() !== '';
    return true;
  });

  if (children.length === 0) return `${pad}<${element.tagName}${attrs} />${nl}`;

  const onlyText = children.length === 1 && children[0].nodeType === Node.TEXT_NODE;
  if (onlyText) {
    return `${pad}<${element.tagName}${attrs}>${escapeXmlText((children[0].textContent ?? '').trim())}</${element.tagName}>${nl}`;
  }

  const inner = children.map((child) => serializeNode(child, depth + 1, minify)).join('');
  return `${pad}<${element.tagName}${attrs}>${nl}${inner}${pad}</${element.tagName}>${nl}`;
}

function processXml(input: string, minify: boolean): { output: string; error: string } {
  if (!input.trim()) return { output: '', error: '' };
  const doc = new DOMParser().parseFromString(input, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) return { output: '', error: parseError.textContent ?? 'Parse error' };
  const declMatch = input.match(/^\s*<\?xml[^?]*\?>/);
  const decl = declMatch ? `${declMatch[0].trim()}${minify ? '' : '\n'}` : '';
  const body = Array.from(doc.childNodes).map((node) => serializeNode(node, 0, minify)).join('');
  return { output: (decl + body).trim(), error: '' };
}

const XmlFormatTool = memo(function XmlFormatTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState('<project lang="ts"><name>Toolbox</name><tags><tag>react</tag><tag>vite</tag></tags></project>');
  const [minify, setMinify] = useState(false);

  const { output, error } = useMemo(() => processXml(input, minify), [input, minify]);

  return (
    <ToolLayout id="xml-format" color="#4ade80">
      <div className="mb-4 flex flex-wrap gap-2">
        <GlassButton aria-label={t('tools.xml-format.format')} onClick={() => setMinify(false)} className={!minify ? 'border-green-300/40 bg-green-300/10' : ''}>{t('tools.xml-format.format')}</GlassButton>
        <GlassButton aria-label={t('tools.xml-format.minify')} onClick={() => setMinify(true)} className={minify ? 'border-green-300/40 bg-green-300/10' : ''}>{t('tools.xml-format.minify')}</GlassButton>
        <CopyButton value={output} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <GlassInput multiline aria-label={t('tools.xml-format.inputPlaceholder')} rows={16} value={input} onChange={(event) => setInput(event.target.value)} placeholder={t('tools.xml-format.inputPlaceholder')} />
        <div className="glass-input mono-panel min-h-96 overflow-auto p-4 text-sm">
          {error ? <span className="text-red-500 dark:text-red-300">{error}</span> : output}
        </div>
      </div>
    </ToolLayout>
  );
});

export default XmlFormatTool;
