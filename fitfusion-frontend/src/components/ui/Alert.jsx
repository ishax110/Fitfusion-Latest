import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

const icons = { success: CheckCircle2, error: AlertCircle, info: Info };
const styles = {
  success: "border-green-500/30 bg-green-500/10 text-green-400",
  error:   "border-red-500/30 bg-red-500/10 text-red-400",
  info:    "border-primary/30 bg-primary/10 text-primary",
};

export function Alert({ type = "info", children, className }) {
  if (!children) return null;
  const Icon = icons[type];
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-4 text-sm", styles[type], className)}>
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
