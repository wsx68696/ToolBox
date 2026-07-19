import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(function GlassButton({ children, className = '', type = 'button', ...props }, ref) {
  return (
    <button ref={ref} type={type} className={`glass-button disabled:cursor-not-allowed disabled:opacity-45 ${className}`} {...props}>
      {children}
    </button>
  );
});

export default GlassButton;
