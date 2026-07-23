import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { parse } from 'marked';
import TurndownService from 'turndown';
import CopyButton from '../components/CopyButton';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const initialMd = `# Hello Toolbox

Write **bold**, *italic* and \`inline code\`.

## List
- One
- Two

> A quote with a [link](https://example.com).
`;

const MdHtmlTool = memo(function MdHtmlTool() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'md2html' | 'html2md'>('md2html');
  const [md, setMd] = useState(initialMd);
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');

  const turndown = useMemo(
    () => new TurndownService({ headingStyle: 'atx', hr: '---', codeBlockStyle: 'fenced' }),
    [],
  );

  const convert = () => {
    setError('');
    try {
      if (mode === 'md2html') {
        const raw = parse(md, {
          async: false,
          gfm: true,
          breaks: false,
        });
        setHtml(DOMPurify.sanitize(String(raw)));
      } else {
        setMd(turndown.turndown(html));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tools.md-html.error'));
    }
  };

  const download = () => {
    const content = mode === 'md2html' ? html : md;
    const type = mode === 'md2html' ? 'text/html' : 'text/markdown';
    const name = mode === 'md2html' ? 'converted.html' : 'converted.md';
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout id="md-html" color="#818cf8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <select className="glass-select" value={mode} onChange={(e) => setMode(e.target.value as 'md2html' | 'html2md')}>
            <option value="md2html">{t('tools.md-html.md2html')}</option>
            <option value="html2md">{t('tools.md-html.html2md')}</option>
          </select>
          <GlassButton onClick={convert}>{t('tools.md-html.convert')}</GlassButton>
          <GlassButton onClick={download}>{t('tools.md-html.download')}</GlassButton>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">Markdown</h2>
              <CopyButton value={md} />
            </div>
            <GlassInput multiline rows={16} className="font-mono text-sm" value={md} onChange={(e) => setMd(e.target.value)} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">HTML</h2>
              <CopyButton value={html} />
            </div>
            <GlassInput multiline rows={16} className="font-mono text-sm" value={html} onChange={(e) => setHtml(e.target.value)} />
          </div>
        </div>
        {html && mode === 'md2html' && (
          <div>
            <h2 className="mb-2 font-semibold">{t('tools.md-html.preview')}</h2>
            <div className="glass-input markdown-body min-h-40 overflow-auto p-5" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
        )}
        {error && <p className="text-sm text-red-500 dark:text-red-300">{error}</p>}
        <p className="text-xs text-[var(--color-text-muted)]">{t('tools.md-html.hint')}</p>
      </div>
    </ToolLayout>
  );
});

export default MdHtmlTool;
