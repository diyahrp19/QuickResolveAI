import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  FilePlus2,
  ListChecks,
  FileText,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/submit", label: "Submit Complaint", icon: FilePlus2 },
  { to: "/complaints", label: "Complaint Management", icon: ListChecks },
  { to: "/reports", label: "Reports", icon: FileText },
] as const;

export function Sidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("quickresolve-sidebar-collapsed") === "true";
  });

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    window.localStorage.setItem("quickresolve-sidebar-collapsed", String(next));
  };

  return (
    <aside
      className={cn(
        "relative z-30 m-3 hidden md:flex h-[calc(100vh-1.5rem)] shrink-0 flex-col rounded-3xl border border-sidebar-border/80 bg-sidebar/92 shadow-glass backdrop-blur-xl transition-all duration-300",
        collapsed ? "w-20" : "w-72",
      )}
    >
      <div
        className={cn(
          "h-18 border-b border-sidebar-border/80 flex items-center",
          collapsed ? "justify-center px-2" : "justify-between px-5",
        )}
      >
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display font-bold text-foreground tracking-tight">
                QuickResolveAI
              </div>
              <div className="text-[10px] text-muted-foreground tracking-wide uppercase">
                AI Complaint System
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Collapse sidebar"
            className="h-9 w-9 rounded-xl border border-sidebar-border/80 bg-card/60 text-sidebar-foreground flex items-center justify-center hover:bg-sidebar-accent/65"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={toggle}
            aria-label="Expand sidebar"
            className="absolute left-1/2 top-[5.3rem] -translate-x-1/2 h-9 w-9 rounded-xl border border-sidebar-border/80 bg-card/70 text-sidebar-foreground flex items-center justify-center hover:bg-sidebar-accent/65"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}
      </div>
      <nav className={cn("flex-1 p-3 space-y-1.5", collapsed && "pt-16")}>
        {items.map((it) => {
          const active = pathname === it.to;
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              title={collapsed ? it.label : undefined}
              className={cn(
                "group relative flex items-center rounded-xl text-sm font-medium transition-all",
                collapsed ? "h-11 w-full justify-center" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60",
              )}
            >
              {active && (
                <span className="absolute left-1 h-6 w-1 rounded-full bg-gradient-primary" />
              )}
              <Icon className={cn("h-4 w-4", active && "scale-105")} />
              {!collapsed && it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
