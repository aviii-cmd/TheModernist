export default function PublicLoading() {
  return (
    <div className="mx-auto max-w-grid animate-pulse px-5 py-8 md:px-8">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="h-3 w-16 rounded bg-surface" />
              <div className="h-10 w-full rounded bg-surface" />
              <div className="h-4 w-3/4 rounded bg-surface" />
            </div>
            <div className="aspect-[4/3] rounded bg-surface" />
          </div>
          <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/3] rounded bg-surface" />
                <div className="h-4 w-full rounded bg-surface" />
                <div className="h-3 w-2/3 rounded bg-surface" />
              </div>
            ))}
          </div>
        </div>
        <div className="h-80 rounded-md bg-surface" />
      </div>
    </div>
  );
}
