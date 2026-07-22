"use client";

export function BuffetListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-background-secondary border border-border rounded-lg p-6">
          <div className="h-40 bg-background-tertiary rounded animate-pulse mb-4" />
          <div className="h-5 bg-background-tertiary rounded animate-pulse mb-2" />
          <div className="h-3 bg-background-tertiary rounded animate-pulse w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function BuffetDetailSkeleton() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-pulse">
        <div className="h-96 bg-background-secondary rounded-lg mb-8" />
        <div className="h-8 bg-background-secondary rounded w-1/3 mb-4" />
        <div className="h-4 bg-background-secondary rounded w-2/3" />
      </div>
    </main>
  );
}
