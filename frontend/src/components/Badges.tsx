import { Badge } from "@/components/ui/badge";
import type { Priority, Status } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    High: "bg-destructive/10 text-destructive border-destructive/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
    Medium:
      "bg-amber-50/85 text-amber-700 border-amber-200/85 dark:bg-amber-200/12 dark:text-amber-100 dark:border-amber-200/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)]",
    Low: "bg-success/12 text-success border-success/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
  };
  return (
    <Badge variant="outline" className={cn("font-semibold tracking-wide", map[priority])}>
      {priority}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    New: "bg-primary/10 text-primary border-primary/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
    "In Progress":
      "bg-amber-50/85 text-amber-700 border-amber-200/85 dark:bg-amber-200/12 dark:text-amber-100 dark:border-amber-200/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)]",
    Resolved:
      "bg-success/12 text-success border-success/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
  };
  return (
    <Badge variant="outline" className={cn("font-semibold tracking-wide", map[status])}>
      {status}
    </Badge>
  );
}
