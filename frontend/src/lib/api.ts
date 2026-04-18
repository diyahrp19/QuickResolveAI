import type { Category, Priority, Source, Status } from "./mock-data";
import {
  AUTH_TOKEN_KEY,
  type AuthResponse,
  type AuthUser,
  type LoginPayload,
  type SignupPayload,
} from "./auth";

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

export interface ComplaintAnalysisPayload {
  complaint: string;
}

export interface ComplaintAnalysisResponse {
  category: Category;
  priority: Priority;
  recommendation: string;
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

function getStoredToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body?.detail ?? message;
    } catch {}
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  auth: {
    signup: (payload: SignupPayload) =>
      request<AuthUser>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    login: (payload: LoginPayload) =>
      request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    me: () => request<AuthUser>("/auth/me"),
  },
  complaints: {
    analyze: (payload: ComplaintAnalysisPayload) =>
      request<ComplaintAnalysisResponse>("/api/analyze-complaint", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
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
    remove: (id: string) =>
      request<ComplaintApiResponse>(`/complaint/${id}`, {
        method: "DELETE",
      }),
  },
  dashboard: {
    stats: () => request<DashboardStats>("/dashboard"),
  },
};
