import { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const [ripples, setRipples] = useState([]);

  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg relative overflow-hidden';

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

  function handleClick(e) {
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
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={handleClick}
      {...props}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
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