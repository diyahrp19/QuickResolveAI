import { Badge } from "@/components/ui/badge";
import type { Priority, Status } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    High: "bg-destructive/8 text-destructive border-destructive/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]",
    Medium:
      "bg-warning/14 text-warning-foreground border-warning/28 shadow-[inset_0_1px_0_rgba(255,255,255,0.26)]",
    Low: "bg-success/10 text-success border-success/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]",
  };
  return (
    <Badge variant="outline" className={cn("font-semibold tracking-wide", map[priority])}>
      {priority}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    New: "bg-primary/9 text-primary border-primary/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]",
    "In Progress":
      "bg-warning/14 text-warning-foreground border-warning/28 shadow-[inset_0_1px_0_rgba(255,255,255,0.26)]",
    Resolved:
      "bg-success/10 text-success border-success/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]",
  };
  return (
    <Badge variant="outline" className={cn("font-semibold tracking-wide", map[status])}>
      {status}
    </Badge>
  );
}
