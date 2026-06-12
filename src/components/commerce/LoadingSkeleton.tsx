type LoadingSkeletonProps = {
  title?: string;
  rows?: number;
};

export default function LoadingSkeleton({ title = "Loading", rows = 3 }: LoadingSkeletonProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <p className="section-eyebrow">{title}</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="skeleton h-28 w-full rounded-[24px]" />
          ))}
        </div>
        <div className="skeleton h-80 w-full rounded-[28px]" />
      </div>
    </div>
  );
}
