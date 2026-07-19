import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { multiline?: false };
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };
type GlassInputProps = InputProps | TextareaProps;

const GlassInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, GlassInputProps>(function GlassInput(props, ref) {
  const className = `glass-input ${props.className ?? ''}`.trim();
  if (props.multiline) {
    const { multiline: _multiline, className: _className, ...rest } = props;
    void _multiline;
    void _className;
    return <textarea ref={ref as React.Ref<HTMLTextAreaElement>} className={className} {...rest} />;
  }
  const { multiline: _multiline, className: _className, ...rest } = props;
  void _multiline;
  void _className;
  return <input ref={ref as React.Ref<HTMLInputElement>} className={className} {...rest} />;
});

export default GlassInput;
