export type Priority = "High" | "Medium" | "Low";
export type Status = "New" | "In Progress" | "Resolved";
export type Category = "Product Issue" | "Packaging Issue" | "Trade Inquiry";
export type Source = "Email" | "Call" | "Manual";

export interface Complaint {
  id: string;
  text: string;
  category: Category;
  priority: Priority;
  recommendation: string;
  status: Status;
  source: Source;
  customer: string;
  createdAt: string;
  timeline: { ts: string; label: string }[];
}
