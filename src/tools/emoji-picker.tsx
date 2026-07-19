import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import GlassInput from '../components/GlassInput';
import ToolLayout from '../components/ToolLayout';
import { emojiData, type EmojiEntry, type EmojiGroupKey } from '../data/emoji';
import { useCopy } from '../hooks/useCopy';

const groupOrder: EmojiGroupKey[] = [
  'smileys', 'gestures', 'symbols', 'objects', 'nature', 'food', 'travel', 'activities',
];

const groupLabelKeys: Record<EmojiGroupKey, `tools.emoji-picker.${EmojiGroupKey}`> = {
  smileys: 'tools.emoji-picker.smileys',
  gestures: 'tools.emoji-picker.gestures',
  symbols: 'tools.emoji-picker.symbols',
  objects: 'tools.emoji-picker.objects',
  nature: 'tools.emoji-picker.nature',
  food: 'tools.emoji-picker.food',
  travel: 'tools.emoji-picker.travel',
  activities: 'tools.emoji-picker.activities',
};

const groupedEmoji = groupOrder.map((key) => ({
  key,
  items: emojiData.filter((emoji) => emoji.group === key),
}));

const EmojiPickerTool = memo(function EmojiPickerTool() {
  const { t, i18n } = useTranslation();
  const { copied, copy } = useCopy();
  const [query, setQuery] = useState('');
  const [lastCopied, setLastCopied] = useState('');
  const chinese = (i18n.resolvedLanguage ?? i18n.language).toLowerCase().startsWith('zh');

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return groupedEmoji;
    const normalizedEmoji = term.replaceAll('\ufe0f', '');
    return groupedEmoji
      .map((group) => ({
        ...group,
        items: group.items.filter((emoji) => (
          emoji.char.replaceAll('\ufe0f', '') === normalizedEmoji
          || emoji.searchEn.includes(term)
          || emoji.searchZh.toLocaleLowerCase().includes(term)
        )),
      }))
      .filter((group) => group.items.length > 0);
  }, [query]);

  const pick = (emoji: EmojiEntry) => {
    setLastCopied(emoji.char);
    void copy(emoji.char);
  };

  return (
    <ToolLayout id="emoji-picker" color="#fbbf24">
      <div className="flex items-center gap-3">
        <GlassInput
          aria-label={t('tools.emoji-picker.searchPlaceholder')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('tools.emoji-picker.searchPlaceholder')}
        />
        {copied && lastCopied && (
          <span className="shrink-0 text-sm text-[var(--color-text-muted)]">
            {lastCopied} {t('tools.emoji-picker.copied')}
          </span>
        )}
      </div>
      {filtered.length === 0 && (
        <p className="mt-5 text-sm text-[var(--color-text-muted)]">{t('tools.emoji-picker.noResults')}</p>
      )}
      <div className="mt-5 space-y-6">
        {filtered.map((group) => (
          <section key={group.key}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {t(groupLabelKeys[group.key])}
              <span className="ml-2 font-normal tracking-normal">{group.items.length}</span>
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((emoji) => {
                const name = chinese ? emoji.nameZh : emoji.nameEn;
                return (
                  <button
                    key={emoji.char}
                    type="button"
                    title={`${name} · ${chinese ? emoji.nameEn : emoji.nameZh}`}
                    aria-label={name}
                    onClick={() => pick(emoji)}
                    className="grid h-11 w-11 place-items-center rounded-xl border border-transparent text-2xl transition hover:border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] active:scale-90"
                  >
                    {emoji.char}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-6 text-xs text-[var(--color-text-muted)]">{t('tools.emoji-picker.hint')}</p>
    </ToolLayout>
  );
});

export default EmojiPickerTool;
