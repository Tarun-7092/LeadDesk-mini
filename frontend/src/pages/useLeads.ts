import { useCallback, useEffect, useState } from "react";
import { api, ApiRequestError } from "../api/client";
import type { Lead, LeadListResponse, LeadStatus } from "../types";

export function useLeads(search: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = useCallback(async (q: string) => {
    setStatus("loading");
    setError(null);
    try {
      const query = q.trim() ? `?search=${encodeURIComponent(q.trim())}` : "";
      const res = await api.get<LeadListResponse>(`/leads${query}`);
      setLeads(res.items);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not load leads.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchLeads(search), 300); // debounce search
    return () => clearTimeout(timeout);
  }, [search, fetchLeads]);

  const updateStatus = useCallback(async (id: string, next: LeadStatus) => {
    const previous = leads;
    setLeads((cur) => cur.map((l) => (l._id === id ? { ...l, status: next } : l)));
    try {
      await api.patch<Lead>(`/leads/${id}/status`, { status: next });
    } catch (err) {
      setLeads(previous); // revert on failure
      throw err;
    }
  }, [leads]);

  return { leads, status, error, refetch: () => fetchLeads(search), updateStatus };
}
