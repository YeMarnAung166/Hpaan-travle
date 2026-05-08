export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-white shadow-md animate-pulse">
      <div className="h-56 bg-neutral-mid"></div>
      <div className="p-4">
        <div className="h-5 bg-neutral-mid rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-neutral-mid rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-neutral-mid rounded w-full mb-2"></div>
        <div className="h-4 bg-neutral-mid rounded w-2/3"></div>
        <div className="mt-4 flex justify-between">
          <div className="h-9 w-24 bg-neutral-mid rounded"></div>
          <div className="h-9 w-9 bg-neutral-mid rounded-full"></div>
        </div>
      </div>
    </div>
  );
}