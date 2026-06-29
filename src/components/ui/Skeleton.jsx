export function SkeletonCard({ count = 1 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className="rounded-xl overflow-hidden bg-white dark:bg-neutral-dark animate-pulse shadow-md">
      <div className="h-56 bg-neutral-mid dark:bg-neutral-dark/50" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-3/4" />
        <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-1/2" />
        <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-full" />
        <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-2/3" />
        <div className="mt-4 flex justify-between">
          <div className="h-9 w-24 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
          <div className="h-9 w-9 bg-neutral-mid dark:bg-neutral-dark/50 rounded-full" />
        </div>
      </div>
    </div>
  ));
}

export function SkeletonDetail() {
  return (
    <div className="animate-pulse">
      <div className="h-[40vh] bg-neutral-mid dark:bg-neutral-dark/50 rounded-b-2xl" />
      <div className="container-custom mt-6">
        <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-48 mb-6" />
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-3/4" />
            <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-full" />
            <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-full" />
            <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-5/6" />
            <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-full" />
            <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-2/3" />
            <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-full" />
          </div>
          <div className="w-full lg:w-80 space-y-4">
            <div className="h-48 bg-neutral-mid dark:bg-neutral-dark/50 rounded-xl" />
            <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-3/4" />
            <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-10 bg-neutral-mid dark:bg-neutral-dark/50 rounded flex-1" />
        <div className="h-10 w-32 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
      </div>
      <div className="hidden md:block space-y-2">
        <div className="flex gap-4 p-3">
          {Array.from({ length: cols }, (_, i) => (
            <div key={i} className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex gap-4 p-3 bg-white dark:bg-neutral-dark rounded-lg">
            {Array.from({ length: cols }, (_, j) => (
              <div key={j} className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="bg-white dark:bg-neutral-dark rounded-lg p-4 space-y-2">
            {Array.from({ length: cols }, (_, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="h-3 w-16 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
                <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded flex-1" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 pt-4">
        <div className="h-8 w-8 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
        <div className="h-8 w-8 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
        <div className="h-8 w-8 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
      </div>
    </div>
  );
}

export function SkeletonListItem({ count = 5 }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex items-center gap-4 bg-white dark:bg-neutral-dark rounded-lg p-4">
          <div className="w-10 h-10 rounded-full bg-neutral-mid dark:bg-neutral-dark/50 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-1/3" />
            <div className="h-3 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-2/3" />
            <div className="h-3 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-1/2" />
          </div>
          <div className="h-8 w-20 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonImageGrid({ count = 8 }) {
  return (
    <div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="aspect-square bg-neutral-mid dark:bg-neutral-dark/50 rounded-xl" />
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="animate-pulse space-y-6 max-w-2xl mx-auto">
      <div className="flex justify-center">
        <div className="w-24 h-24 rounded-full bg-neutral-mid dark:bg-neutral-dark/50" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
        <div className="h-10 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
        <div className="h-10 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-16 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
        <div className="h-10 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-28 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
        <div className="h-24 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
      </div>
      <div className="flex gap-4">
        <div className="h-10 w-32 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
        <div className="h-10 w-24 bg-neutral-mid dark:bg-neutral-dark/50 rounded" />
      </div>
    </div>
  );
}

export function SkeletonStatCard({ count = 5 }) {
  return (
    <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white dark:bg-neutral-dark rounded-xl p-6 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-mid dark:bg-neutral-dark/50" />
          <div className="h-8 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-1/2" />
          <div className="h-4 bg-neutral-mid dark:bg-neutral-dark/50 rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}
