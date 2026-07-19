import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

const mimeMap: [string, string][] = [
  ['.aac', 'audio/aac'], ['.avi', 'video/x-msvideo'], ['.bin', 'application/octet-stream'],
  ['.bmp', 'image/bmp'], ['.bz2', 'application/x-bzip2'], ['.css', 'text/css'],
  ['.csv', 'text/csv'], ['.doc', 'application/msword'], ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['.eot', 'application/vnd.ms-fontobject'], ['.epub', 'application/epub+zip'], ['.gif', 'image/gif'],
  ['.gz', 'application/gzip'], ['.htm', 'text/html'], ['.html', 'text/html'],
  ['.ico', 'image/vnd.microsoft.icon'], ['.ics', 'text/calendar'], ['.jar', 'application/java-archive'],
  ['.jpeg', 'image/jpeg'], ['.jpg', 'image/jpeg'], ['.js', 'text/javascript'],
  ['.json', 'application/json'], ['.jsonld', 'application/ld+json'], ['.md', 'text/markdown'],
  ['.mjs', 'text/javascript'], ['.mp3', 'audio/mpeg'], ['.mp4', 'video/mp4'],
  ['.mpeg', 'video/mpeg'], ['.odp', 'application/vnd.oasis.opendocument.presentation'], ['.ods', 'application/vnd.oasis.opendocument.spreadsheet'],
  ['.odt', 'application/vnd.oasis.opendocument.text'], ['.oga', 'audio/ogg'], ['.ogv', 'video/ogg'],
  ['.otf', 'font/otf'], ['.pdf', 'application/pdf'], ['.png', 'image/png'],
  ['.ppt', 'application/vnd.ms-powerpoint'], ['.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'], ['.rar', 'application/vnd.rar'],
  ['.rtf', 'application/rtf'], ['.sh', 'application/x-sh'], ['.svg', 'image/svg+xml'],
  ['.tar', 'application/x-tar'], ['.tif', 'image/tiff'], ['.ts', 'video/mp2t'],
  ['.ttf', 'font/ttf'], ['.txt', 'text/plain'], ['.wasm', 'application/wasm'],
  ['.wav', 'audio/wav'], ['.weba', 'audio/webm'], ['.webm', 'video/webm'],
  ['.webp', 'image/webp'], ['.woff', 'font/woff'], ['.woff2', 'font/woff2'],
  ['.xhtml', 'application/xhtml+xml'], ['.xls', 'application/vnd.ms-excel'], ['.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  ['.xml', 'application/xml'], ['.zip', 'application/zip'], ['.7z', 'application/x-7z-compressed'],
];

const MimeTypesTool = memo(function MimeTypesTool() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return mimeMap;
    return mimeMap.filter(([ext, mime]) => ext.includes(term) || mime.toLowerCase().includes(term));
  }, [query]);

  return (
    <ToolLayout id="mime-types" color="#818cf8">
      <GlassInput aria-label={t('tools.mime-types.searchPlaceholder')} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('tools.mime-types.searchPlaceholder')} />
      <div className="mt-5 overflow-hidden rounded-2xl border border-[var(--color-border)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)] text-[var(--color-text-muted)]">
            <tr>
              <th className="p-3">{t('tools.mime-types.extension')}</th>
              <th className="p-3">{t('tools.mime-types.mime')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? filtered.map(([ext, mime]) => (
              <tr key={ext} className="border-t border-[var(--color-border)]">
                <td className="p-3 font-mono">{ext}</td>
                <td className="p-3 font-mono">{mime}</td>
              </tr>
            )) : (
              <tr><td className="p-3 text-[var(--color-text-muted)]" colSpan={2}>{t('tools.mime-types.noResults')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </ToolLayout>
  );
});

export default MimeTypesTool;
