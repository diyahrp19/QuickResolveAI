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

const recs: Record<Category, string> = {
  "Product Issue": "Initiate product replacement and notify QA team for batch inspection.",
  "Packaging Issue": "Forward to packaging vendor and offer customer a refund credit.",
  "Trade Inquiry": "Route to sales team and schedule a follow-up call within 24 hours.",
};

const sample: Omit<Complaint, "id" | "timeline">[] = [
  { text: "The product arrived broken and unusable. Very disappointed.", category: "Product Issue", priority: "High", recommendation: recs["Product Issue"], status: "New", source: "Email", customer: "Aarav Sharma", createdAt: "2025-04-14T09:12:00Z" },
  { text: "Packaging was torn and items were missing from the box.", category: "Packaging Issue", priority: "Medium", recommendation: recs["Packaging Issue"], status: "In Progress", source: "Call", customer: "Maya Patel", createdAt: "2025-04-13T14:02:00Z" },
  { text: "Interested in bulk order pricing for our retail chain.", category: "Trade Inquiry", priority: "Low", recommendation: recs["Trade Inquiry"], status: "Resolved", source: "Manual", customer: "Liam Chen", createdAt: "2025-04-12T11:45:00Z" },
  { text: "Device stopped working after 2 days of normal use.", category: "Product Issue", priority: "High", recommendation: recs["Product Issue"], status: "In Progress", source: "Email", customer: "Sofia Rossi", createdAt: "2025-04-11T08:30:00Z" },
  { text: "Box was wet on arrival, label unreadable.", category: "Packaging Issue", priority: "Low", recommendation: recs["Packaging Issue"], status: "Resolved", source: "Email", customer: "Noah Kim", createdAt: "2025-04-10T16:20:00Z" },
  { text: "Need quotation for distributor partnership in EU region.", category: "Trade Inquiry", priority: "Medium", recommendation: recs["Trade Inquiry"], status: "New", source: "Manual", customer: "Elena García", createdAt: "2025-04-09T10:00:00Z" },
  { text: "Product overheats during charging — safety concern.", category: "Product Issue", priority: "High", recommendation: recs["Product Issue"], status: "New", source: "Call", customer: "Yuki Tanaka", createdAt: "2025-04-08T13:15:00Z" },
  { text: "Outer carton crushed but contents fine.", category: "Packaging Issue", priority: "Low", recommendation: recs["Packaging Issue"], status: "Resolved", source: "Email", customer: "Omar Haddad", createdAt: "2025-04-07T07:50:00Z" },
];

export const mockComplaints: Complaint[] = sample.map((c, i) => ({
  ...c,
  id: `CMP-${String(1001 + i)}`,
  timeline: [
    { ts: c.createdAt, label: "Complaint received" },
    { ts: c.createdAt, label: "AI classification completed" },
    ...(c.status !== "New" ? [{ ts: c.createdAt, label: "Assigned to support agent" }] : []),
    ...(c.status === "Resolved" ? [{ ts: c.createdAt, label: "Marked as resolved" }] : []),
  ],
}));

export function classifyComplaint(text: string): { category: Category; priority: Priority; recommendation: string } {
  const t = text.toLowerCase();
  let category: Category = "Product Issue";
  if (/(pack|box|carton|wrap|seal)/.test(t)) category = "Packaging Issue";
  else if (/(bulk|distributor|quote|partnership|trade|pricing)/.test(t)) category = "Trade Inquiry";

  let priority: Priority = "Low";
  if (/(broken|unusable|safety|fire|overheat|danger|urgent|refund)/.test(t)) priority = "High";
  else if (/(missing|delay|wrong|damaged|torn)/.test(t)) priority = "Medium";

  return { category, priority, recommendation: recs[category] };
}
