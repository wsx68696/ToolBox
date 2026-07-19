import DOMPurify from 'dompurify';
import { Bold, Code, Heading, Italic, Link as LinkIcon, List, ListOrdered, Quote, Strikethrough, Underline } from 'lucide-react';
import { memo, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import ToolLayout from '../components/ToolLayout';

const initialHtml = '<h2>Toolbox editor</h2><p>Write <b>rich text</b> and get clean <i>HTML</i>. Select text and use the toolbar.</p><ul><li>Client-side only</li><li>Sanitized output</li></ul>';

interface ToolButton {
  icon: typeof Bold;
  command: string;
  value?: string;
  labelKey: 'bold' | 'italic' | 'underline' | 'strike' | 'heading' | 'quote' | 'bulletList' | 'numberList' | 'code';
}

const buttons: ToolButton[] = [
  { icon: Bold, command: 'bold', labelKey: 'bold' },
  { icon: Italic, command: 'italic', labelKey: 'italic' },
  { icon: Underline, command: 'underline', labelKey: 'underline' },
  { icon: Strikethrough, command: 'strikeThrough', labelKey: 'strike' },
  { icon: Heading, command: 'formatBlock', value: 'h2', labelKey: 'heading' },
  { icon: Quote, command: 'formatBlock', value: 'blockquote', labelKey: 'quote' },
  { icon: List, command: 'insertUnorderedList', labelKey: 'bulletList' },
  { icon: ListOrdered, command: 'insertOrderedList', labelKey: 'numberList' },
  { icon: Code, command: 'formatBlock', value: 'pre', labelKey: 'code' },
];

const HtmlWysiwygTool = memo(function HtmlWysiwygTool() {
  const { t } = useTranslation();
  const editorRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState(initialHtml);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
    // Only sync from state on mount / external source edits
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sync = () => {
    if (editorRef.current) setHtml(DOMPurify.sanitize(editorRef.current.innerHTML));
  };

  const exec = (button: ToolButton) => {
    editorRef.current?.focus();
    document.execCommand(button.command, false, button.value);
    sync();
  };

  const createLink = () => {
    const url = window.prompt(t('tools.html-wysiwyg.linkPrompt'));
    if (url) {
      editorRef.current?.focus();
      document.execCommand('createLink', false, url);
      sync();
    }
  };

  const applySource = (value: string) => {
    setHtml(value);
    if (editorRef.current) editorRef.current.innerHTML = DOMPurify.sanitize(value);
  };

  return (
    <ToolLayout id="html-wysiwyg" color="#818cf8">
      <div className="mb-2 flex flex-wrap gap-1">
        {buttons.map((button) => (
          <button key={button.labelKey} type="button" aria-label={t(`tools.html-wysiwyg.${button.labelKey}`)} title={t(`tools.html-wysiwyg.${button.labelKey}`)} className="glass-button px-2.5 py-1.5" onMouseDown={(event) => { event.preventDefault(); exec(button); }}>
            <button.icon size={16} />
          </button>
        ))}
        <button type="button" aria-label={t('tools.html-wysiwyg.link')} title={t('tools.html-wysiwyg.link')} className="glass-button px-2.5 py-1.5" onMouseDown={(event) => { event.preventDefault(); createLink(); }}>
          <LinkIcon size={16} />
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-2 font-semibold">{t('tools.html-wysiwyg.editor')}</h2>
          <div
            ref={editorRef}
            className="glass-input markdown-body min-h-80 overflow-auto p-4"
            contentEditable
            suppressContentEditableWarning
            onInput={sync}
            role="textbox"
            aria-multiline="true"
            aria-label={t('tools.html-wysiwyg.editor')}
          />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold">{t('tools.html-wysiwyg.source')}</h2>
            <CopyButton value={html} />
          </div>
          <textarea
            className="glass-input min-h-80 w-full resize-y p-4 font-mono text-sm"
            aria-label={t('tools.html-wysiwyg.source')}
            value={html}
            onChange={(event) => applySource(event.target.value)}
          />
        </div>
      </div>
      <p className="mt-4 text-xs text-[var(--color-text-muted)]">{t('tools.html-wysiwyg.hint')}</p>
    </ToolLayout>
  );
});

export default HtmlWysiwygTool;
