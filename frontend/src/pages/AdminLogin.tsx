import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth, ApiRequestError } from "../context/AuthContext";

export function AdminLogin() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === "authed") {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-grid px-6">
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-paper-line)] bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-ink)] font-mono text-sm font-bold text-white">
            L
          </span>
          <span className="font-[var(--font-display)] text-lg font-semibold">LeadDesk</span>
        </div>
        <h1 className="mt-6 font-[var(--font-display)] text-xl font-semibold">Team sign in</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Access the lead queue.</p>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-md border border-[var(--color-signal)]/30 bg-[var(--color-signal)]/10 px-4 py-3 text-sm text-[var(--color-signal)]"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-[var(--color-paper-line)] bg-[var(--color-paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-blueprint)] focus:ring-2 focus:ring-[var(--color-blueprint-soft)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-[var(--color-paper-line)] bg-[var(--color-paper)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-blueprint)] focus:ring-2 focus:ring-[var(--color-blueprint-soft)]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-[var(--color-ink)] px-5 py-3 font-mono text-sm font-medium text-white transition hover:bg-[var(--color-blueprint)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
