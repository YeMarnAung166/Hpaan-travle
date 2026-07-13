export default function Card({ children, className = '', noPadding = false, ...props }) {
  return (
    <div
      className={`rounded-xl overflow-hidden bg-white dark:bg-neutral-dark border border-border dark:border-border-light shadow-soft ${className}`}
      {...props}
    >
      {noPadding ? children : <div className="p-5">{children}</div>}
    </div>
  );
}
