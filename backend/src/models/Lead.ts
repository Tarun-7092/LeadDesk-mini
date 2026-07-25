import { Schema, model, Document } from "mongoose";

export const LEAD_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const BUDGET_RANGES = [
  "UNDER_1K",
  "1K_5K",
  "5K_15K",
  "15K_PLUS",
  "NOT_SURE",
] as const;
export type BudgetRange = (typeof BUDGET_RANGES)[number];

export interface ILead extends Document {
  name: string;
  email: string;
  budgetRange: BudgetRange;
  message: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

const leadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    budgetRange: { type: String, required: true, enum: BUDGET_RANGES },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    status: { type: String, required: true, enum: LEAD_STATUSES, default: "NEW" },
  },
  { timestamps: true }
);

leadSchema.index({ name: "text", email: "text", message: "text" });
leadSchema.index({ status: 1, createdAt: -1 });

export const Lead = model<ILead>("Lead", leadSchema);
