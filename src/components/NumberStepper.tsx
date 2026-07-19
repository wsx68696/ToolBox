import { Minus, Plus } from 'lucide-react';
import { memo } from 'react';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  'aria-label'?: string;
  className?: string;
}

const NumberStepper = memo(function NumberStepper({ value, onChange, min, max, step = 1, className = '', ...rest }: NumberStepperProps) {
  const clamp = (n: number) => {
    let result = n;
    if (min !== undefined) result = Math.max(result, min);
    if (max !== undefined) result = Math.min(result, max);
    return result;
  };
  const set = (n: number) => { if (Number.isFinite(n)) onChange(clamp(n)); };

  return (
    <div className={`number-stepper ${className}`.trim()}>
      <button
        type="button"
        className="number-stepper-btn"
        onClick={() => set(value - step)}
        disabled={min !== undefined && value <= min}
        aria-hidden="true"
        tabIndex={-1}
      >
        <Minus size={15} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        className="number-stepper-input"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => set(Number(event.target.value))}
        {...rest}
      />
      <button
        type="button"
        className="number-stepper-btn"
        onClick={() => set(value + step)}
        disabled={max !== undefined && value >= max}
        aria-hidden="true"
        tabIndex={-1}
      >
        <Plus size={15} />
      </button>
    </div>
  );
});

export default NumberStepper;
