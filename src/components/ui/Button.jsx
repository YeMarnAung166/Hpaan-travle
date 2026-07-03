import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
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
  const [ripples, setRipples] = useState([]);

  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

  const variants = {
    primary: 'bg-primary text-white shadow-soft hover:bg-primary-light hover:shadow-elevated focus:ring-gold/50',
    secondary: 'bg-secondary text-white shadow-soft hover:bg-secondary-light hover:shadow-elevated focus:ring-secondary/50',
    outline: 'border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary focus:ring-gold/50',
    ghost: 'text-text-soft hover:text-text hover:bg-primary/8 focus:ring-gold/50',
    danger: 'bg-error text-white hover:bg-red-700 focus:ring-error/50',
    success: 'bg-success text-white hover:bg-green-700 focus:ring-success/50',
    glass: 'glass-card text-text hover:bg-glass-border focus:ring-gold/50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[36px]',
    md: 'px-5 py-2.5 text-base gap-2 min-h-[44px]',
    lg: 'px-7 py-3 text-lg gap-2.5 min-h-[52px]',
  };

  function handleClick(e) {
    if (loading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
  }

  return (
    <motion.button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${pill ? 'rounded-full' : 'rounded-lg'} ${className}`}
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={handleClick}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" />
      )}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/25 pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animation: 'ripple 0.6s ease-out forwards',
          }}
        />
      ))}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
