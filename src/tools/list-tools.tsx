import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CopyButton from '../components/CopyButton';
import GlassCheckbox from '../components/GlassCheckbox';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';

type SortMode = 'none' | 'asc' | 'desc';

const ListTools = memo(function ListTools() {
  const { t } = useTranslation();
  const [text, setText] = useState('banana\napple\ncherry\napple\n\nbanana');
  const [trim, setTrim] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [dedupe, setDedupe] = useState(true);
  const [reverse, setReverse] = useState(false);
  const [sort, setSort] = useState<SortMode>('none');

  const output = useMemo(() => {
    let lines = text.split(/\r\n|\r|\n/);
    if (trim) lines = lines.map((line) => line.trim());
    if (removeEmpty) lines = lines.filter((line) => line !== '');
    if (dedupe) lines = Array.from(new Set(lines));
    if (sort === 'asc') lines = [...lines].sort((a, b) => a.localeCompare(b));
    if (sort === 'desc') lines = [...lines].sort((a, b) => b.localeCompare(a));
    if (reverse) lines = [...lines].reverse();
    return lines;
  }, [text, trim, removeEmpty, dedupe, sort, reverse]);

  const checkboxes = [
    { label: t('tools.list-tools.trim'), checked: trim, set: setTrim },
    { label: t('tools.list-tools.removeEmpty'), checked: removeEmpty, set: setRemoveEmpty },
    { label: t('tools.list-tools.dedupe'), checked: dedupe, set: setDedupe },
    { label: t('tools.list-tools.reverse'), checked: reverse, set: setReverse },
  ];

  const sortModes: { key: SortMode; label: string }[] = [
    { key: 'none', label: t('tools.list-tools.sortNone') },
    { key: 'asc', label: t('tools.list-tools.sortAsc') },
    { key: 'desc', label: t('tools.list-tools.sortDesc') },
  ];

  return (
    <ToolLayout id="list-tools" color="#f87171">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        {checkboxes.map((box) => (
          <label key={box.label} className="flex items-center gap-2 text-sm">
            <GlassCheckbox checked={box.checked} onChange={(event) => box.set(event.target.checked)} />
            {box.label}
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm">
          {t('tools.list-tools.sortLabel')}
          <select
            className="glass-select"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortMode)}
            aria-label={t('tools.list-tools.sortLabel')}
          >
            {sortModes.map((mode) => <option key={mode.key} value={mode.key}>{mode.label}</option>)}
          </select>
        </label>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <GlassInput multiline aria-label={t('tools.list-tools.inputPlaceholder')} rows={14} value={text} onChange={(event) => setText(event.target.value)} placeholder={t('tools.list-tools.inputPlaceholder')} />
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">{t('tools.list-tools.items', { count: output.length })}</span>
            <CopyButton value={output.join('\n')} />
          </div>
          <div className="glass-input mono-panel min-h-80 p-4">{output.join('\n')}</div>
        </div>
      </div>
    </ToolLayout>
  );
});

export default ListTools;
