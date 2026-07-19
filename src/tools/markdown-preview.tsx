import DOMPurify from 'dompurify';
import { parse } from 'marked';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const initial = `# Markdown Preview

Write **bold**, *italic* and \`inline code\`.

## List
- Item one
- Item two

## Code
\`\`\`ts
const greet = (name: string) => \`Hello, \${name}!\`;
\`\`\`

> Blockquote with a [link](https://example.com).

| Col A | Col B |
| ----- | ----- |
| 1     | 2     |
`;

const MarkdownPreviewTool = memo(function MarkdownPreviewTool() {
  const { t } = useTranslation();
  const [input, setInput] = useState(initial);

  const html = useMemo(() => {
    const raw = parse(input, { async: false, gfm: true, breaks: false });
    return DOMPurify.sanitize(raw);
  }, [input]);

  return (
    <ToolLayout id="markdown-preview" color="#818cf8">
      <div className="mb-3 flex justify-end">
        <CopyButton value={html} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <GlassInput multiline aria-label={t('tools.markdown-preview.inputPlaceholder')} rows={20} className="font-mono text-sm" value={input} onChange={(event) => setInput(event.target.value)} placeholder={t('tools.markdown-preview.inputPlaceholder')} />
        <div className="glass-input markdown-body min-h-96 overflow-auto p-5" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <p className="mt-3 text-xs text-[var(--color-text-muted)]">{t('tools.markdown-preview.hint')}</p>
    </ToolLayout>
  );
});

export default MarkdownPreviewTool;
