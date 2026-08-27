import { cn } from "@/lib/utils";

export function Spinner({ className, size = "default" }) {
  const sizes = { sm: "h-4 w-4 border-2", default: "h-6 w-6 border-2", lg: "h-10 w-10 border-[3px]" };
  return (
    <div className={cn("animate-spin rounded-full border-primary border-t-transparent", sizes[size], className)} />
  );
}

export function PageSpinner({ message = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
