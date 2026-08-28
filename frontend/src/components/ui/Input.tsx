import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="eyebrow">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-11 rounded-lg border border-ink/15 bg-paper px-3.5 text-sm text-ink placeholder:text-ink-muted/60 transition-colors focus:border-gold focus:outline-none',
            error && 'border-ember',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-ember">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
