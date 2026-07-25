import { Router } from "express";
import { Lead } from "../models/Lead";
import { requireAuth } from "../middleware/requireAuth";
import { createLeadSchema, listLeadsQuerySchema, updateStatusSchema } from "../utils/validation";

const router = Router();

// Public: create a lead
router.post("/", async (req, res) => {
  const parsed = createLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  try {
    const lead = await Lead.create(parsed.data);
    return res.status(201).json({ id: lead._id, createdAt: lead.createdAt });
  } catch {
    return res.status(500).json({ error: "Could not submit your request. Please try again." });
  }
});

// Protected: list + search leads
router.get("/", requireAuth, async (req, res) => {
  const parsed = listLeadsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid query" });
  }

  const { search, status, page, limit } = parsed.data;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [{ name: regex }, { email: regex }, { message: regex }];
  }

  try {
    const [items, total] = await Promise.all([
      Lead.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Lead.countDocuments(filter),
    ]);

    return res.status(200).json({
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch {
    return res.status(500).json({ error: "Could not load leads. Please try again." });
  }
});

// Protected: update lead status
router.patch("/:id/status", requireAuth, async (req, res) => {
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
  }

  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status: parsed.data.status },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    return res.status(200).json(lead);
  } catch {
    return res.status(400).json({ error: "Could not update this lead" });
  }
});

export default router;
