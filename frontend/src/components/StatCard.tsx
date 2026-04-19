import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  tone?: "primary" | "destructive" | "success" | "warning";
}

const tones = {
  primary: "from-primary/18 to-primary/6 text-primary",
  destructive: "from-destructive/18 to-destructive/6 text-destructive",
  success: "from-success/18 to-success/6 text-success",
  warning: "from-warning/25 to-warning/6 text-warning-foreground",
};

export function StatCard({ label, value, delta, icon: Icon, tone = "primary" }: StatCardProps) {
  const numericValue = useMemo(() => {
    if (typeof value === "number") return value;
    const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }, [value]);

  const animated = useAnimatedNumber(numericValue, 900);

  return (
    <div className="group relative overflow-hidden rounded-3xl surface-card p-6 hover-lift">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,color-mix(in_oklch,var(--color-primary)_18%,transparent),transparent_46%)] opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/35 to-transparent" />
      <div className="flex items-start justify-between">
        <div className="relative z-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            {numericValue !== null ? animated.toLocaleString() : value}
          </p>
          {delta && <p className="mt-1 text-xs text-muted-foreground/95">{delta}</p>}
        </div>
        <div
          className={cn(
            "relative z-10 h-11 w-11 rounded-2xl bg-linear-to-br flex items-center justify-center shadow-soft",
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function useAnimatedNumber(target: number | null, durationMs: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === null) return;

    let raf = 0;
    const start = performance.now();
    const from = value;
    const delta = target - from;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - (1 - progress) * (1 - progress) * (1 - progress);
      setValue(Math.round(from + delta * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}
