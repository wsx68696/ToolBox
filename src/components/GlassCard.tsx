import { memo, type CSSProperties, type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  themeColor?: string;
  interactive?: boolean;
}

const GlassCard = memo(function GlassCard({ children, className = '', themeColor = '#22d3ee', interactive = false }: GlassCardProps) {
  const style = { '--theme-color': themeColor } as CSSProperties;
  return (
    <div
      className={`glass-card relative overflow-hidden ${interactive ? 'glass-hover' : ''} ${className}`}
      style={style}
    >
      {interactive && (
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 hover:opacity-100" style={{ background: `linear-gradient(135deg, ${themeColor}16, transparent 46%)` }} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
});

export default GlassCard;
