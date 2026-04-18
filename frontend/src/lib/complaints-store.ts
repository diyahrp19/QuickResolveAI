import { useSyncExternalStore } from "react";
import { api } from "./api";
import type { Complaint, Source, Status } from "./mock-data";

type ComplaintCreateInput = {
  text: string;
  customer: string;
  source: Source;
};

let complaints: Complaint[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function mapApiComplaint(c: {
  id: string;
  complaint_text: string;
  category: Complaint["category"];
  priority: Complaint["priority"];
  recommendation: string;
  status: Complaint["status"];
  source: Complaint["source"];
  customer_name: string;
  created_at: string;
}): Complaint {
  return {
    id: c.id,
    text: c.complaint_text,
    category: c.category,
    priority: c.priority,
    recommendation: c.recommendation,
    status: c.status,
    source: c.source,
    customer: c.customer_name,
    createdAt: c.created_at,
    timeline: [
      { ts: c.created_at, label: "Complaint received" },
      { ts: c.created_at, label: "AI classification completed" },
      ...(c.status !== "New" ? [{ ts: c.created_at, label: "Assigned to support agent" }] : []),
      ...(c.status === "Resolved" ? [{ ts: c.created_at, label: "Marked as resolved" }] : []),
    ],
  };
}

async function loadFromApi() {
  const items = await api.complaints.list();
  complaints = items.map(mapApiComplaint);
  loaded = true;
  emit();
}

function ensureLoaded() {
  if (loaded || loadPromise) return;
  loadPromise = loadFromApi()
    .catch(() => {
      loaded = true;
    })
    .finally(() => {
      loadPromise = null;
    });
}

export const complaintsStore = {
  getAll: () => complaints,
  getById: (id: string) => complaints.find((c) => c.id === id),
  add: async (c: ComplaintCreateInput) => {
    const created = await api.complaints.create({
      complaint_text: c.text,
      source: c.source,
      customer_name: c.customer,
    });
    const mapped = mapApiComplaint(created);
    complaints = [...complaints.filter((item) => item.id !== mapped.id), mapped];
    emit();
    return mapped;
  },
  updateStatus: async (id: string, status: Status) => {
    const updated = await api.complaints.updateStatus(id, { status });
    const mapped = mapApiComplaint(updated);
    complaints = complaints.map((c) =>
      c.id === id
        ? {
            ...mapped,
            timeline: [
              ...c.timeline,
              { ts: new Date().toISOString(), label: `Status changed to ${status}` },
            ],
          }
        : c,
    );
    emit();
    return mapped;
  },
  remove: async (id: string) => {
    const removed = await api.complaints.remove(id);
    complaints = complaints.filter((c) => c.id !== id);
    emit();
    return removed;
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    ensureLoaded();
    return () => listeners.delete(l);
  },
};

export function useComplaints() {
  return useSyncExternalStore(
    complaintsStore.subscribe,
    complaintsStore.getAll,
    complaintsStore.getAll,
  );
}
