import { cn } from "../lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-foreground-tertiary">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-foreground-secondary mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <div className="mb-4 text-red-400">
        <svg
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-foreground-secondary mb-4 max-w-sm">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}

export { EmptyState, ErrorState, type EmptyStateProps, type ErrorStateProps };
