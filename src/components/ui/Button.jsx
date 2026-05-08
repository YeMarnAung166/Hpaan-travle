import { forwardRef } from 'react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';
  
  const variants = {
    primary: 'bg-primary text-white shadow-sm hover:bg-primary-light focus:ring-primary/50',
    secondary: 'bg-secondary text-white hover:bg-secondary-light focus:ring-secondary/50',
    outline: 'border border-primary text-primary hover:bg-primary/5 focus:ring-primary/50',
    ghost: 'text-primary hover:bg-primary/5 focus:ring-primary/50',
    danger: 'bg-error text-white hover:bg-red-800 focus:ring-error/50',
    success: 'bg-success text-white hover:bg-green-700 focus:ring-success/50',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;