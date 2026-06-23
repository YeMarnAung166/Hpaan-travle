export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white dark:bg-neutral-dark shadow-md relative">
      <div className="h-56 bg-neutral-mid dark:bg-neutral-dark/50 relative overflow-hidden">
        <div className="shimmer absolute inset-0" />
      </div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-3/4 relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-1/2 relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-full relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-2/3 relative overflow-hidden">
          <div className="shimmer absolute inset-0" />
        </div>
        <div className="mt-4 flex justify-between">
          <div className="h-9 w-24 bg-neutral-mid dark:bg-neutral-dark/50 rounded relative overflow-hidden">
            <div className="shimmer absolute inset-0" />
          </div>
          <div className="h-9 w-9 bg-neutral-mid dark:bg-neutral-dark/50 rounded-full relative overflow-hidden">
            <div className="shimmer absolute inset-0" />
          </div>
        </div>
      </div>
    </div>
  );
}