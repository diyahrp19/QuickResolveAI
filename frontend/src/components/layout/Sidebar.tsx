import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  BarChart3,
  FileText,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/submit", label: "Submit Complaint", icon: FilePlus2 },
  { to: "/complaints", label: "Complaint Management", icon: ListChecks },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
] as const;

export function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-sidebar-border">
        <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <div className="font-display font-bold text-foreground">QuickResolveAI</div>
          <div className="text-[10px] text-muted-foreground tracking-wide uppercase">
            AI Complaint System
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              <Icon className="h-4 w-4" />
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
