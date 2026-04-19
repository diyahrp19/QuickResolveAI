import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PriorityBadge, StatusBadge } from "@/components/Badges";
import { complaintsStore, useComplaints } from "@/lib/complaints-store";
import type { Complaint, Status } from "@/lib/mock-data";
import { Search, Eye, Clock, Trash2 } from "lucide-react";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "Complaint Management – QuickResolveAI" },
      { name: "description", content: "Manage, filter and update the status of complaints." },
    ],
  }),
  component: ComplaintsPage,
});

function ComplaintsPage() {
  const all = useComplaints();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [pri, setPri] = useState("all");
  const [stat, setStat] = useState("all");
  const [active, setActive] = useState<Complaint | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Complaint | null>(null);

  const handleDelete = async (complaint: Complaint) => {
    await complaintsStore.remove(complaint.id);
    if (active?.id === complaint.id) setActive(null);
    if (deleteTarget?.id === complaint.id) setDeleteTarget(null);
  };

  const filtered = useMemo(() => {
    return all.filter((c) => {
      if (q && !`${c.id} ${c.text} ${c.customer}`.toLowerCase().includes(q.toLowerCase()))
        return false;
      if (cat !== "all" && c.category !== cat) return false;
      if (pri !== "all" && c.priority !== pri) return false;
      if (stat !== "all" && c.status !== stat) return false;
      return true;
    });
  }, [all, q, cat, pri, stat]);

  return (
    <AppShell>
      <div className="space-y-6 animate-enter">
        <div>
          <p className="title-kicker">Operations</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Complaint Management
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
            Search, filter and manage all incoming complaints.
          </p>
        </div>

        <div className="rounded-3xl section-panel p-3 md:p-4 shadow-soft surface-ring">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 md:gap-3">
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by ID, text or customer..."
                className="pl-9 rounded-2xl bg-card/55"
              />
            </div>
            <Filter
              value={cat}
              onChange={setCat}
              placeholder="Category"
              options={["Product Issue", "Packaging Issue", "Trade Inquiry", "Spam"]}
            />
            <Filter
              value={pri}
              onChange={setPri}
              placeholder="Priority"
              options={["High", "Medium", "Low"]}
            />
            <Filter
              value={stat}
              onChange={setStat}
              placeholder="Status"
              options={["New", "In Progress", "Resolved"]}
            />
          </div>
        </div>

        <div className="rounded-2xl md:rounded-3xl section-panel shadow-soft overflow-hidden surface-ring">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-secondary/78 text-xs uppercase tracking-[0.09em] text-muted-foreground backdrop-blur-lg">
                <tr>
                  <Th>S.No</Th>
                  <Th>Complaint</Th>
                  <Th>Category</Th>
                  <Th>Priority</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, index) => (
                  <tr
                    key={c.id}
                    className="border-t border-border/75 even:bg-secondary/20 hover:bg-secondary/48 transition-all"
                  >
                    <td className="px-3 py-2.5 md:px-4 md:py-3 font-mono text-xs font-semibold text-primary">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 max-w-xs truncate font-medium">
                      {c.text}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-muted-foreground">
                      {c.category}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3">
                      <Select
                        value={c.status}
                        onValueChange={(v) => complaintsStore.updateStatus(c.id, v as Status)}
                      >
                        <SelectTrigger className="h-8 w-32 md:h-9 md:w-36 rounded-xl bg-card/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-muted-foreground text-xs">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 md:px-4 md:py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setActive(c)}
                          className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-xl border border-border/80 bg-card/75 hover:bg-accent text-xs font-semibold transition-all hover:-translate-y-px button-glow"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          aria-label={`Delete complaint ${c.id}`}
                          title="Delete"
                          className="inline-flex items-center justify-center h-7 w-7 md:h-8 md:w-8 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all hover:-translate-y-px"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No complaints match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <DetailDialog complaint={active} onClose={() => setActive(null)} />
      <DeleteDialog
        complaint={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDelete={handleDelete}
      />
    </AppShell>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-3 py-2.5 md:px-4 md:py-3 text-left font-semibold ${className}`}>
      {children}
    </th>
  );
}

function Filter({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: string[];
}) {
  return (
    <div className="md:col-span-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="rounded-2xl bg-card/55">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {placeholder}</SelectItem>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function DetailDialog({
  complaint,
  onClose,
}: {
  complaint: Complaint | null;
  onClose: () => void;
}) {
  if (!complaint) return null;
  const c = complaint;
  return (
    <Dialog open={!!complaint} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <span className="font-mono text-sm text-primary">{c.id}</span>
            <span>·</span>
            <span>{c.customer}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="rounded-2xl bg-secondary/60 p-4 border border-border/75 surface-ring">
            <p className="text-xs uppercase text-muted-foreground mb-1">Complaint</p>
            <p className="text-sm">{c.text}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Mini label="Category" value={c.category} />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Priority</p>
              <PriorityBadge priority={c.priority} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <StatusBadge status={c.status} />
            </div>
          </div>

          <div className="rounded-2xl border border-primary/25 bg-primary/8 p-4 surface-ring">
            <p className="text-xs uppercase text-primary font-semibold mb-1">AI Recommendation</p>
            <p className="text-sm">{c.recommendation}</p>
          </div>

          <div>
            <p className="text-xs uppercase text-muted-foreground mb-3">Timeline</p>
            <ol className="space-y-3 border-l-2 border-border ml-2">
              {c.timeline.map((t, i) => (
                <li key={i} className="relative pl-5">
                  <span className="absolute -left-1.75 top-1.5 h-3 w-3 rounded-full bg-gradient-primary" />
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(t.ts).toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs uppercase text-muted-foreground mb-2">Update Status</p>
            <Select
              value={c.status}
              onValueChange={(v) => complaintsStore.updateStatus(c.id, v as Status)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  complaint,
  onClose,
  onDelete,
}: {
  complaint: Complaint | null;
  onClose: () => void;
  onDelete: (complaint: Complaint) => Promise<void>;
}) {
  if (!complaint) return null;

  const c = complaint;

  return (
    <Dialog open={!!complaint} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-sm gap-0 overflow-y-auto p-0 sm:rounded-2xl">
        <div className="border-b border-border/80 bg-destructive/10 px-4 py-3">
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-base font-semibold">Delete complaint?</DialogTitle>
            <DialogDescription className="text-xs leading-5 text-muted-foreground">
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-3 px-4 py-4">
          <div className="rounded-xl border border-border/80 bg-secondary/40 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Complaint</p>
            <p className="mt-1 text-sm font-medium wrap-break-word">{c.text}</p>
            <p className="mt-1 text-xs text-muted-foreground">Customer: {c.customer}</p>
          </div>
        </div>

        <DialogFooter className="border-t border-border bg-secondary/20 px-4 py-3 sm:justify-end">
          <div className="flex w-full gap-2 sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => void onDelete(c)}
              className="flex-1 sm:flex-none"
            >
              Delete
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
