export default function LoadingSpinner({ size = 'md', overlay = false }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div className={`relative ${overlay ? 'fixed inset-0 z-50 flex items-center justify-center bg-neutral-light/60 dark:bg-neutral-dark/60 backdrop-blur-sm' : 'flex justify-center items-center py-12'}`}>
      <div className={`${sizes[size]} rounded-full relative`}>
        <div className={`absolute inset-0 rounded-full border ${sizes[size].split(' ').slice(1).join(' ')} border-border dark:border-neutral-dark`} />
        <div className={`absolute inset-0 rounded-full border ${sizes[size].split(' ').slice(1).join(' ')} border-t-gold dark:border-t-primary animate-spin`} />
      </div>
    </div>
  );

  return spinner;
}
