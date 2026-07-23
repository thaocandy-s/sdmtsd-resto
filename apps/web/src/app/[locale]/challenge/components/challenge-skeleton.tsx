"use client";

export function ChallengeSkeleton() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-pulse space-y-8">
        <div className="h-10 bg-background-secondary rounded w-1/3" />
        <div className="h-40 bg-background-secondary rounded-lg" />
        <div className="h-10 bg-background-secondary rounded w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-background-secondary rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
