import { forwardRef, useState } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value && props.value.toString().length > 0;

  return (
    <div className="mb-4 relative">
      {label && (
        <label
          className={`absolute left-3 transition-all duration-200 pointer-events-none ${
            focused || hasValue
              ? '-top-2 text-xs bg-white dark:bg-neutral-dark px-1 text-gold dark:text-primary'
              : 'top-2.5 text-sm text-text-soft'
          }`}
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full px-3 py-2.5 bg-transparent border rounded-xl transition focus:outline-none ${
          error
            ? 'border-error focus:ring-2 focus:ring-error/30'
            : focused
              ? 'border-gold dark:border-primary ring-2 ring-gold/10 dark:ring-primary/10'
              : 'border-border dark:border-border hover:border-gold/50 dark:hover:border-primary/50'
        } ${label ? 'pt-3' : ''} ${className}`}
        placeholder={focused || !label ? props.placeholder || '' : ''}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-error flex items-center gap-1 ml-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
