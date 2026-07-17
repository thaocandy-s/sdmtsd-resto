import { cn } from "../lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "warning" | "success";
}

function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-lg border p-4",
        variant === "default" &&
          "bg-background-secondary border-border text-foreground",
        variant === "destructive" &&
          "bg-red-900/20 border-red-800 text-red-400",
        variant === "warning" &&
          "bg-yellow-900/20 border-yellow-800 text-yellow-400",
        variant === "success" &&
          "bg-green-900/20 border-green-800 text-green-400",
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription };
