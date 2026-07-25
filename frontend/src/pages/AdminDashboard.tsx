import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLeads } from "./useLeads";
import { StatusBadge } from "../components/StatusBadge";
import { formatRelativeTime } from "../utils/formatTime";
import { LEAD_STATUSES, type LeadStatus } from "../types";
import { ApiRequestError } from "../api/client";

const BUDGET_LABELS: Record<string, string> = {
  UNDER_1K: "Under $1k",
  "1K_5K": "$1k–5k",
  "5K_15K": "$5k–15k",
  "15K_PLUS": "$15k+",
  NOT_SURE: "Not sure",
};

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const { leads, status, error, refetch, updateStatus } = useLeads(search);

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  async function handleStatusChange(id: string, next: LeadStatus) {
    setUpdateError(null);
    try {
      await updateStatus(id, next);
    } catch (err) {
      setUpdateError(err instanceof ApiRequestError ? err.message : "Could not update this lead's status.");
    }
  }

  return (
    <div className="min-h-screen bg-grid">
      <header className="border-b border-[var(--color-paper-line)] bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-ink)] font-mono text-sm font-bold text-white">
              L
            </span>
            <span className="font-[var(--font-display)] text-lg font-semibold">Lead queue</span>
          </div>
          <div className="flex items-center gap-4">
            {user && <span className="hidden text-sm text-[var(--color-ink-soft)] sm:inline">{user.email}</span>}
            <button
              onClick={handleLogout}
              className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[var(--font-display)] text-xl font-semibold">Tickets</h1>
            <p className="text-sm text-[var(--color-ink-soft)]">
              {status === "ready" ? `${leads.length} shown` : "\u00A0"}
            </p>
          </div>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or message…"
            className="w-full rounded-md border border-[var(--color-paper-line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-blueprint)] focus:ring-2 focus:ring-[var(--color-blueprint-soft)] sm:w-80"
          />
        </div>

        {updateError && (
          <div
            role="alert"
            className="mb-4 rounded-md border border-[var(--color-signal)]/30 bg-[var(--color-signal)]/10 px-4 py-3 text-sm text-[var(--color-signal)]"
          >
            {updateError}
          </div>
        )}

        {status === "loading" && <LoadingState />}

        {status === "error" && <ErrorState message={error ?? "Could not load leads."} onRetry={refetch} />}

        {status === "ready" && leads.length === 0 && search.trim() === "" && <EmptyState />}
        {status === "ready" && leads.length === 0 && search.trim() !== "" && <NoResultsState query={search} />}

        {status === "ready" && leads.length > 0 && (
          <div className="overflow-hidden rounded-lg border border-[var(--color-paper-line)] bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-paper-line)] bg-[var(--color-paper)] font-mono text-xs uppercase tracking-widest text-[var(--color-ink-soft)]">
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">Message</th>
                  <th className="px-4 py-3 font-medium">Received</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="border-b border-[var(--color-paper-line)] last:border-0 hover:bg-[var(--color-paper)]/50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-xs text-[var(--color-ink-soft)]">{lead.email}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{BUDGET_LABELS[lead.budgetRange] ?? lead.budgetRange}</td>
                    <td className="hidden max-w-xs truncate px-4 py-3 text-[var(--color-ink-soft)] md:table-cell" title={lead.message}>
                      {lead.message}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--color-ink-soft)]">
                      {formatRelativeTime(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={lead.status} />
                        <select
                          aria-label={`Change status for ${lead.name}`}
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value as LeadStatus)}
                          className="rounded border border-[var(--color-paper-line)] bg-white px-2 py-1 font-mono text-xs outline-none focus:border-[var(--color-blueprint)]"
                        >
                          {LEAD_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg border border-[var(--color-paper-line)] bg-white/60" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-paper-line)] bg-white/60 px-6 py-14 text-center">
      <p className="font-[var(--font-display)] text-lg font-semibold">No tickets yet</p>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
        New inquiries submitted on the public site will show up here.
      </p>
    </div>
  );
}

function NoResultsState({ query }: { query: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-paper-line)] bg-white/60 px-6 py-14 text-center">
      <p className="font-[var(--font-display)] text-lg font-semibold">No matches for "{query}"</p>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Try a different name, email, or keyword.</p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-[var(--color-signal)]/30 bg-[var(--color-signal)]/5 px-6 py-14 text-center">
      <p className="font-[var(--font-display)] text-lg font-semibold text-[var(--color-signal)]">
        Could not load the queue
      </p>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{message}</p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-md bg-[var(--color-ink)] px-4 py-2 font-mono text-xs font-medium text-white hover:bg-[var(--color-blueprint)]"
      >
        Retry
      </button>
    </div>
  );
}
