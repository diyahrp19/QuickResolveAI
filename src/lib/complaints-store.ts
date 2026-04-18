import { useSyncExternalStore } from "react";
import { mockComplaints, type Complaint, type Status } from "./mock-data";

let complaints: Complaint[] = [...mockComplaints];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const complaintsStore = {
  getAll: () => complaints,
  getById: (id: string) => complaints.find((c) => c.id === id),
  add: (c: Complaint) => {
    complaints = [c, ...complaints];
    emit();
  },
  updateStatus: (id: string, status: Status) => {
    complaints = complaints.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            timeline: [...c.timeline, { ts: new Date().toISOString(), label: `Status changed to ${status}` }],
          }
        : c,
    );
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useComplaints() {
  return useSyncExternalStore(complaintsStore.subscribe, complaintsStore.getAll, complaintsStore.getAll);
}
