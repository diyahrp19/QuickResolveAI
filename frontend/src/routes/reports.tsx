import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useComplaints } from "@/lib/complaints-store";
import { Download, FileText, FileSpreadsheet, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports – QuickResolveAI" },
      { name: "description", content: "Export complaint data and view summary reports." },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const complaints = useComplaints();
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === "Resolved").length;
  const high = complaints.filter((c) => c.priority === "High").length;

  const exportCSV = () => {
    const headers = [
      "ID",
      "Customer",
      "Category",
      "Priority",
      "Status",
      "Source",
      "Created",
      "Text",
    ];
    const rows = complaints.map((c) =>
      [
        c.id,
        c.customer,
        c.category,
        c.priority,
        c.status,
        c.source,
        c.createdAt,
        `"${c.text.replace(/"/g, '""')}"`,
      ].join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "complaints.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const exportPDF = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>QuickResolveAI Report</title>
      <style>body{font-family:sans-serif;padding:40px}h1{color:#5b3df5}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f4f4ff}</style>
      </head><body>
      <h1>QuickResolveAI – Complaint Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <p>Total: ${total} · Resolved: ${resolved} · High Priority: ${high}</p>
      <table><thead><tr><th>ID</th><th>Customer</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>
      ${complaints.map((c) => `<tr><td>${c.id}</td><td>${c.customer}</td><td>${c.category}</td><td>${c.priority}</td><td>${c.status}</td><td>${new Date(c.createdAt).toLocaleDateString()}</td></tr>`).join("")}
      </tbody></table></body></html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 300);
    toast.success("PDF print dialog opened");
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1.5 text-sm md:text-base">
            Export complaint data and review summary insights.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-8 text-primary-foreground shadow-glow">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.22),transparent_46%),radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.18),transparent_40%)]" />
          <div className="relative flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6" />
            <h2 className="font-display text-xl font-bold">Summary Report</h2>
          </div>
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
            <Stat label="Total Complaints" value={total} />
            <Stat label="Resolved" value={resolved} />
            <Stat label="High Priority" value={high} />
            <Stat
              label="Resolution Rate"
              value={`${total ? Math.round((resolved / total) * 100) : 0}%`}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ExportCard
            title="Export as CSV"
            desc="Download all complaints as a comma-separated spreadsheet."
            icon={FileSpreadsheet}
            onClick={exportCSV}
          />
          <ExportCard
            title="Export as PDF"
            desc="Generate a print-ready PDF report of all complaints."
            icon={FileText}
            onClick={exportPDF}
          />
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.11em] opacity-80">{label}</p>
      <p className="font-display text-3xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ExportCard({
  title,
  desc,
  icon: Icon,
  onClick,
}: {
  title: string;
  desc: string;
  icon: typeof FileText;
  onClick: () => void;
}) {
  return (
    <div className="rounded-3xl border border-border/80 glass-card p-6 shadow-soft hover-lift">
      <div className="h-12 w-12 rounded-2xl bg-linear-to-br from-primary/20 to-primary/8 text-primary flex items-center justify-center mb-4 shadow-soft">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-display font-semibold text-lg tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{desc}</p>
      <Button onClick={onClick} className="bg-gradient-primary hover:opacity-95">
        <Download className="h-4 w-4 mr-2" /> Download
      </Button>
    </div>
  );
}
