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
      { name: "description", content: "Overview of complaint volume, priority and resolution status." },
    ],
  }),
  component: Dashboard,
});

const COLORS = ["hsl(255 80% 60%)", "hsl(200 80% 55%)", "hsl(170 70% 45%)", "hsl(35 90% 60%)", "hsl(0 75% 60%)"];

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
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            QuickResolveAI – AI Powered Complaint Classification &amp; Resolution System
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Complaints" value={total} delta="All time" icon={Inbox} tone="primary" />
          <StatCard label="High Priority" value={high} delta="Needs attention" icon={AlertTriangle} tone="destructive" />
          <StatCard label="Resolved" value={resolved} delta={`${Math.round((resolved / total) * 100)}% resolution rate`} icon={CheckCircle2} tone="success" />
          <StatCard label="Pending" value={pending} delta="In queue" icon={Clock} tone="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Complaint Categories" subtitle="Distribution by type">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Priority Distribution" subtitle="Urgency breakdown">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byPriority}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
                <XAxis dataKey="name" stroke="hsl(0 0% 50%)" fontSize={12} />
                <YAxis stroke="hsl(0 0% 50%)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {byPriority.map((d, i) => (
                    <Cell key={i} fill={d.name === "High" ? "hsl(0 75% 60%)" : d.name === "Medium" ? "hsl(35 90% 60%)" : "hsl(150 60% 50%)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Complaint Status" subtitle="Workflow stages">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {byStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display text-lg font-semibold mb-4">Recent Complaints</h3>
          <div className="space-y-3">
            {complaints.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/60 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-gradient-primary/10 text-primary flex items-center justify-center text-xs font-mono font-semibold">
                  {c.id.slice(-3)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.text}</p>
                  <p className="text-xs text-muted-foreground">{c.customer} · {c.category}</p>
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

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-4">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
