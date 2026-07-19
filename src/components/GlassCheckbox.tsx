import { forwardRef, type InputHTMLAttributes } from 'react';

type GlassCheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

const GlassCheckbox = forwardRef<HTMLInputElement, GlassCheckboxProps>(function GlassCheckbox({ className = '', ...props }, ref) {
  return <input ref={ref} type="checkbox" className={`glass-checkbox ${className}`.trim()} {...props} />;
});

export default GlassCheckbox;
