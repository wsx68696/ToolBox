import { Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GlassButton from './GlassButton';
import { useCopy } from '../hooks/useCopy';

interface CopyButtonProps {
  value: string;
  className?: string;
}

export default function CopyButton({ value, className = '' }: CopyButtonProps) {
  const { copied, copy } = useCopy();
  const { t } = useTranslation();
  return (
    <GlassButton aria-label={t('common.copy')} className={className} onClick={() => void copy(value)} disabled={!value}>
      {copied ? <Check size={16} /> : <Copy size={16} />}
      {copied ? t('common.copied') : t('common.copy')}
    </GlassButton>
  );
}
