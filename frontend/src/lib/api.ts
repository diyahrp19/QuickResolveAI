import type { Category, Priority, Source, Status } from "./mock-data";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface ComplaintApiResponse {
  id: string;
  complaint_text: string;
  category: Category;
  priority: Priority;
  recommendation: string;
  status: Status;
  source: Source;
  customer_name: string;
  created_at: string;
}

export interface ComplaintSubmitPayload {
  complaint_text: string;
  source: Source;
  customer_name: string;
}

export interface ComplaintUpdatePayload {
  status: Status;
}

export interface DashboardStats {
  total_complaints: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
  resolved: number;
  pending: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body?.detail ?? message;
    } catch {
      // ignore non-JSON errors
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  complaints: {
    list: () => request<ComplaintApiResponse[]>("/complaints"),
    create: (payload: ComplaintSubmitPayload) =>
      request<ComplaintApiResponse>("/complaint", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateStatus: (id: string, payload: ComplaintUpdatePayload) =>
      request<ComplaintApiResponse>(`/complaint/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },
  dashboard: {
    stats: () => request<DashboardStats>("/dashboard"),
  },
};
