export default function LoadingSpinner({ size = 'md', overlay = false }) {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-10 h-10 border-[3px]',
  };

  return (
    <div className={`${overlay ? 'fixed inset-0 z-50 flex items-center justify-center bg-neutral-light/60 dark:bg-neutral-dark/60 backdrop-blur-sm' : 'flex justify-center items-center min-h-[calc(100vh-var(--header-h,96px))] w-full'}`}>
      <div
        className={`${sizes[size]} rounded-full border-border dark:border-neutral-dark border-t-gold dark:border-t-primary animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
