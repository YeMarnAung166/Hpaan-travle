import { forwardRef } from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  pill = false,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white shadow-soft hover:bg-primary-light focus:ring-gold/50',
    outline: 'border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary focus:ring-gold/50',
    ghost: 'text-text-soft hover:text-text hover:bg-primary/8 focus:ring-gold/50',
    danger: 'bg-error text-white hover:bg-red-700 focus:ring-error/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[36px]',
    md: 'px-5 py-2.5 text-base gap-2 min-h-[44px]',
    lg: 'px-7 py-3 text-lg gap-2.5 min-h-[52px]',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${pill ? 'rounded-full' : 'rounded-lg'} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" />
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
