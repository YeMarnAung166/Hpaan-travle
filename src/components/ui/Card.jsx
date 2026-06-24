import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true, noPadding = false, glass = false, ...props }) {
  const base = glass
    ? 'glass-card'
    : 'bg-white dark:bg-neutral-dark border border-border dark:border-border-light shadow-soft';

  return (
    <motion.div
      className={`rounded-xl overflow-hidden ${base} ${hover ? 'hover:shadow-elevated hover:border-gold/30 dark:hover:border-primary/30 hover:-translate-y-1' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      {...props}
    >
      {noPadding ? children : <div className="p-5">{children}</div>}
    </motion.div>
  );
}
