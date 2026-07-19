import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const TextStatsTool = memo(function TextStatsTool() {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const stats = useMemo(() => {
    const chars = [...text].length;
    const charsNoSpaces = [...text.replace(/\s/g, '')].length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    const sentences = (text.match(/[.!?。！？]+/g) ?? []).length;
    const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).filter(Boolean).length : 0;
    const bytes = new TextEncoder().encode(text).length;
    return { chars, charsNoSpaces, words, lines, sentences, paragraphs, bytes };
  }, [text]);

  const items: { key: keyof typeof stats; label: string }[] = [
    { key: 'chars', label: t('tools.text-stats.chars') },
    { key: 'charsNoSpaces', label: t('tools.text-stats.charsNoSpaces') },
    { key: 'words', label: t('tools.text-stats.words') },
    { key: 'lines', label: t('tools.text-stats.lines') },
    { key: 'sentences', label: t('tools.text-stats.sentences') },
    { key: 'paragraphs', label: t('tools.text-stats.paragraphs') },
    { key: 'bytes', label: t('tools.text-stats.bytes') },
  ];

  return (
    <ToolLayout id="text-stats" color="#4ade80">
      <GlassInput multiline aria-label={t('tools.text-stats.inputPlaceholder')} rows={10} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.text-stats.inputPlaceholder')} />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.key} className="glass-input flex items-center justify-between p-4">
            <span className="text-sm text-[var(--color-text-muted)]">{item.label}</span>
            <span className="font-mono text-lg font-semibold">{stats[item.key].toLocaleString()}</span>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
});

export default TextStatsTool;
