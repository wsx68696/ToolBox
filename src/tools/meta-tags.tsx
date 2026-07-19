import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const MetaTagsTool = memo(function MetaTagsTool() {
  const { t } = useTranslation();
  const [title, setTitle] = useState('My Awesome Page');
  const [description, setDescription] = useState('A short description of the page for search engines.');
  const [url, setUrl] = useState('https://example.com');
  const [image, setImage] = useState('https://example.com/og-image.png');
  const [type, setType] = useState('website');
  const [twitterCard, setTwitterCard] = useState('summary_large_image');

  const output = useMemo(() => {
    const lines: string[] = [];
    if (title) {
      lines.push(`<title>${escapeAttr(title)}</title>`);
      lines.push(`<meta name="title" content="${escapeAttr(title)}" />`);
    }
    if (description) lines.push(`<meta name="description" content="${escapeAttr(description)}" />`);
    lines.push('');
    lines.push('<!-- Open Graph -->');
    if (type) lines.push(`<meta property="og:type" content="${escapeAttr(type)}" />`);
    if (url) lines.push(`<meta property="og:url" content="${escapeAttr(url)}" />`);
    if (title) lines.push(`<meta property="og:title" content="${escapeAttr(title)}" />`);
    if (description) lines.push(`<meta property="og:description" content="${escapeAttr(description)}" />`);
    if (image) lines.push(`<meta property="og:image" content="${escapeAttr(image)}" />`);
    lines.push('');
    lines.push('<!-- Twitter -->');
    if (twitterCard) lines.push(`<meta name="twitter:card" content="${escapeAttr(twitterCard)}" />`);
    if (url) lines.push(`<meta name="twitter:url" content="${escapeAttr(url)}" />`);
    if (title) lines.push(`<meta name="twitter:title" content="${escapeAttr(title)}" />`);
    if (description) lines.push(`<meta name="twitter:description" content="${escapeAttr(description)}" />`);
    if (image) lines.push(`<meta name="twitter:image" content="${escapeAttr(image)}" />`);
    return lines.join('\n');
  }, [title, description, url, image, type, twitterCard]);

  return (
    <ToolLayout id="meta-tags" color="#4ade80">
      <div className="grid gap-4">
        <Field label={t('tools.meta-tags.title')} value={title} onChange={setTitle} />
        <label className="text-sm text-[var(--color-text-muted)]">
          {t('tools.meta-tags.description')}
          <GlassInput multiline aria-label={t('tools.meta-tags.description')} className="mt-2" rows={2} value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('tools.meta-tags.url')} value={url} onChange={setUrl} />
          <Field label={t('tools.meta-tags.image')} value={image} onChange={setImage} />
          <Field label={t('tools.meta-tags.type')} value={type} onChange={setType} />
          <Field label={t('tools.meta-tags.twitterCard')} value={twitterCard} onChange={setTwitterCard} />
        </div>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">{t('tools.meta-tags.output')}</h2>
          <CopyButton value={output} />
        </div>
        <div className="glass-input mono-panel max-h-96 overflow-auto p-4 text-sm">{output}</div>
      </div>
    </ToolLayout>
  );
});

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm text-[var(--color-text-muted)]">
      {label}
      <GlassInput aria-label={label} className="mt-2" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

export default MetaTagsTool;
