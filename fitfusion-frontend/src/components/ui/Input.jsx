import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm",
      "placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "transition-colors duration-200",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
