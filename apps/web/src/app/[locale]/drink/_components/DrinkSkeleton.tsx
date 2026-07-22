"use client";

export function DrinkSkeleton() {
  return (
    <div className="space-y-12">
      {[1, 2].map((sectionIndex) => (
        <div key={sectionIndex} className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-7 bg-background-tertiary rounded w-36 animate-pulse" />
            <div className="h-5 bg-background-tertiary rounded w-10 animate-pulse" />
            <div className="flex-1 h-px bg-border/50" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-background-secondary border border-border rounded-lg overflow-hidden"
              >
                <div className="h-48 bg-background-tertiary animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-background-tertiary rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-background-tertiary rounded animate-pulse w-full" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-4 bg-background-tertiary rounded animate-pulse w-1/4" />
                    <div className="h-3 bg-background-tertiary rounded animate-pulse w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
