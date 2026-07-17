import { cn } from "../lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const getVisiblePages = () => {
    if (totalPages <= 7) return pages;
    if (currentPage <= 3) return [1, 2, 3, 4, 5, -1, totalPages];
    if (currentPage >= totalPages - 2)
      return [1, -1, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages];
  };

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 px-3 rounded-md text-sm text-foreground-secondary hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        Previous
      </button>

      {getVisiblePages().map((page, i) =>
        page === -1 ? (
          <span
            key={`ellipsis-${i}`}
            className="h-9 w-9 flex items-center justify-center text-foreground-tertiary"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "h-9 w-9 rounded-md text-sm font-medium transition-colors",
              page === currentPage
                ? "bg-gold-500 text-background"
                : "text-foreground-secondary hover:bg-background-tertiary"
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 px-3 rounded-md text-sm text-foreground-secondary hover:bg-background-tertiary disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        Next
      </button>
    </nav>
  );
}

export { Pagination, type PaginationProps };
