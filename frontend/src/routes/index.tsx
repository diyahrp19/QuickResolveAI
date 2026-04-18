import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { StatCard } from "@/components/StatCard";
import { useComplaints } from "@/lib/complaints-store";
import { AlertTriangle, CheckCircle2, Clock, Inbox } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard – QuickResolveAI" },
      {
        name: "description",
        content: "Overview of complaint volume, priority and resolution status.",
      },
    ],
  }),
  component: Dashboard,
});

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function Dashboard() {
  const complaints = useComplaints();
  const total = complaints.length;
  const high = complaints.filter((c) => c.priority === "High").length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const pending = complaints.filter((c) => c.status !== "Resolved").length;

  const byCategory = ["Product Issue", "Packaging Issue", "Trade Inquiry"].map((name) => ({
    name,
    value: complaints.filter((c) => c.category === name).length,
  }));
  const byPriority = ["High", "Medium", "Low"].map((name) => ({
    name,
    value: complaints.filter((c) => c.priority === name).length,
  }));
  const byStatus = ["New", "In Progress", "Resolved"].map((name) => ({
    name,
    value: complaints.filter((c) => c.status === name).length,
  }));

  return (
    <AppShell>
      <div className="space-y-8 animate-enter">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
            QuickResolveAI – AI Powered Complaint Classification &amp; Resolution System
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
          <StatCard
            label="Total Complaints"
            value={total}
            delta="All time"
            icon={Inbox}
            tone="primary"
          />
          <StatCard
            label="High Priority"
            value={high}
            delta="Needs attention"
            icon={AlertTriangle}
            tone="destructive"
          />
          <StatCard
            label="Resolved"
            value={resolved}
            delta={`${total ? Math.round((resolved / total) * 100) : 0}% resolution rate`}
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard label="Pending" value={pending} delta="In queue" icon={Clock} tone="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Complaint Categories" subtitle="Distribution by type">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  animationDuration={850}
                  animationBegin={80}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "var(--color-secondary)", opacity: 0.25 }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Priority Distribution" subtitle="Urgency breakdown">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "var(--color-secondary)", opacity: 0.24 }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} animationDuration={900}>
                  {byPriority.map((d, i) => (
                    <Cell
                      key={i}
                      fill={
                        d.name === "High"
                          ? "var(--color-destructive)"
                          : d.name === "Medium"
                            ? "var(--color-warning)"
                            : "var(--color-success)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Complaint Status" subtitle="Workflow stages">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={byStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  animationDuration={820}
                  animationBegin={120}
                >
                  {byStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "var(--color-secondary)", opacity: 0.24 }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="rounded-3xl border border-border/80 glass-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-semibold mb-4 tracking-tight">
            Recent Complaints
          </h3>
          <div className="space-y-3">
            {complaints.slice(0, 5).map((c, index) => (
              <div
                key={c.id}
                className="flex items-center gap-4 rounded-2xl border border-transparent p-3 hover:bg-secondary/55 hover:border-border/70 transition-all hover-lift"
              >
                <div className="h-9 w-9 rounded-xl bg-linear-to-br from-primary/20 to-primary/8 text-primary flex items-center justify-center text-xs font-mono font-semibold surface-ring">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.text}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.customer} · {c.category}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid color-mix(in oklch, var(--color-border) 75%, transparent)",
  background: "color-mix(in oklch, var(--color-card) 78%, transparent)",
  backdropFilter: "blur(10px)",
  boxShadow: "var(--shadow-md)",
} as const;

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border/80 glass-card p-6 shadow-soft hover-lift">
      <div className="mb-4">
        <h3 className="font-display text-base font-semibold tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
