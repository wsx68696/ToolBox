import { Monitor, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import GlassButton from './GlassButton';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const options = [
    { value: 'light' as const, icon: Sun, label: t('common.theme.light') },
    { value: 'dark' as const, icon: Moon, label: t('common.theme.dark') },
    { value: 'system' as const, icon: Monitor, label: t('common.theme.system') },
  ] as const;

  return (
    <div className="inline-flex items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
      {options.map(({ value, icon: Icon, label }) => (
        <GlassButton
          key={value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={`h-9 min-h-0 w-9 min-w-0 p-0 text-sm ${
            theme === value
              ? 'border-[var(--color-border-hover)] bg-[var(--color-surface-active)] text-[var(--color-text)]'
              : 'border-transparent bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          <Icon size={16} />
        </GlassButton>
      ))}
    </div>
  );
}
