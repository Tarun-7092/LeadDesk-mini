import type { LeadStatus } from "../types";

const STYLES: Record<LeadStatus, string> = {
  NEW: "text-[var(--color-status-new)] bg-[var(--color-status-new-bg)]",
  CONTACTED: "text-[var(--color-status-contacted)] bg-[var(--color-status-contacted-bg)]",
  CLOSED: "text-[var(--color-status-closed)] bg-[var(--color-status-closed-bg)]",
};

const LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs font-medium tracking-wide ${STYLES[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}
