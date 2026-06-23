import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = true, noPadding = false, ...props }) {
  return (
    <motion.div
      className={`bg-white dark:bg-neutral-dark rounded-xl shadow-md overflow-hidden ${hover ? 'hover:shadow-xl' : ''} ${className}`}
      whileHover={hover ? { y: -4, transition: { duration: 0.25 } } : undefined}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      {...props}
    >
      {noPadding ? children : <div className="p-4">{children}</div>}
    </motion.div>
  );
}