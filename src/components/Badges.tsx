import { Badge } from "@/components/ui/badge";
import type { Priority, Status } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority }: { priority: Priority }) {
  const map: Record<Priority, string> = {
    High: "bg-destructive/10 text-destructive border-destructive/20",
    Medium: "bg-warning/15 text-warning-foreground border-warning/30",
    Low: "bg-success/10 text-success border-success/20",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", map[priority])}>
      {priority}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    New: "bg-primary/10 text-primary border-primary/20",
    "In Progress": "bg-warning/15 text-warning-foreground border-warning/30",
    Resolved: "bg-success/10 text-success border-success/20",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", map[status])}>
      {status}
    </Badge>
  );
}
