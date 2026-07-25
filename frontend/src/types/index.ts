export const LEAD_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const BUDGET_RANGES = [
  { value: "UNDER_1K", label: "Under $1,000" },
  { value: "1K_5K", label: "$1,000 – $5,000" },
  { value: "5K_15K", label: "$5,000 – $15,000" },
  { value: "15K_PLUS", label: "$15,000+" },
  { value: "NOT_SURE", label: "Not sure yet" },
] as const;
export type BudgetRange = (typeof BUDGET_RANGES)[number]["value"];

export interface Lead {
  _id: string;
  name: string;
  email: string;
  budgetRange: BudgetRange;
  message: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LeadListResponse {
  items: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface ApiError {
  error: string;
}
