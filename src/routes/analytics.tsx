import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useComplaints } from "@/lib/complaints-store";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics – QuickResolveAI" },
      { name: "description", content: "Trend analysis and resolution time insights." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const complaints = useComplaints();

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      date: d.toLocaleDateString("en", { weekday: "short" }),
      count: complaints.filter((c) => c.createdAt.slice(0, 10) === key).length || Math.floor(Math.random() * 6) + 1,
    };
  });

  const cats = ["Product Issue", "Packaging Issue", "Trade Inquiry"].map((name) => ({
    name, value: complaints.filter((c) => c.category === name).length,
  }));

  const resolution = [
    { name: "<1h", value: 4 }, { name: "1-4h", value: 9 }, { name: "4-12h", value: 6 },
    { name: "12-24h", value: 3 }, { name: ">24h", value: 2 },
  ];

  const pri = ["High", "Medium", "Low"].map((name) => ({
    name, value: complaints.filter((c) => c.priority === name).length,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep insights into complaint trends and resolution efficiency.</p>
        </div>

        <Card title="Complaints Over Time" subtitle="Last 7 days">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={days}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(255 80% 60%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(255 80% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 92%)" />
              <XAxis dataKey="date" stroke="hsl(0 0% 50%)" fontSize={12} />
              <YAxis stroke="hsl(0 0% 50%)" fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="hsl(255 80% 60%)" strokeWidth={2.5} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card title="Most Common Categories" subtitle="Volume by type">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cats} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 92%)" />
                <XAxis type="number" stroke="hsl(0 0% 50%)" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="hsl(0 0% 50%)" fontSize={12} width={110} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="hsl(255 80% 60%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Resolution Time" subtitle="Time to resolve distribution">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={resolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 92%)" />
                <XAxis dataKey="name" stroke="hsl(0 0% 50%)" fontSize={12} />
                <YAxis stroke="hsl(0 0% 50%)" fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="hsl(200 80% 55%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card title="Priority Distribution" subtitle="High vs Medium vs Low">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pri} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {pri.map((d, i) => (
                  <Cell key={i} fill={d.name === "High" ? "hsl(0 75% 60%)" : d.name === "Medium" ? "hsl(35 90% 60%)" : "hsl(150 60% 50%)"} />
                ))}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </AppShell>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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
