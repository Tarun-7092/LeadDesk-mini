import { z } from "zod";
import { BUDGET_RANGES, LEAD_STATUSES } from "../models/Lead";

export const createLeadSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").max(254),
  budgetRange: z.enum(BUDGET_RANGES, {
    errorMap: () => ({ message: "Select a valid budget range" }),
  }),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
});

export const updateStatusSchema = z.object({
  status: z.enum(LEAD_STATUSES, {
    errorMap: () => ({ message: "Status must be NEW, CONTACTED, or CLOSED" }),
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().min(1).email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const listLeadsQuerySchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
