import { useState, type FormEvent } from "react";
import { BUDGET_RANGES } from "../types";
import { validateLead, type LeadFormValues, type LeadFormErrors } from "../utils/validateLead";
import { api, ApiRequestError } from "../api/client";

const EMPTY: LeadFormValues = { name: "", email: "", budgetRange: "", message: "" };

export function LeadForm() {
  const [values, setValues] = useState<LeadFormValues>(EMPTY);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof LeadFormValues>(key: K, value: LeadFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (state === "submitting") return; // prevent duplicate submissions

    const validation = validateLead(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setState("submitting");
    setServerError(null);

    try {
      const res = await api.post<{ id: string; createdAt: string }>("/leads", values);
      setTicketId(res.id);
      setState("success");
      setValues(EMPTY);
    } catch (err) {
      const message = err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.";
      setServerError(message);
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="relative overflow-hidden rounded-lg border border-[var(--color-paper-line)] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex w-fit -rotate-3 items-center gap-2 rounded border-2 border-[var(--color-status-closed)] px-4 py-1.5 font-mono text-sm font-semibold uppercase tracking-widest text-[var(--color-status-closed)]">
          Received
        </div>
        <p className="mt-5 font-mono text-xs uppercase tracking-widest text-[var(--color-ink-soft)]">
          Ticket #{ticketId?.slice(-6).toUpperCase()}
        </p>
        <h3 className="mt-2 font-[var(--font-display)] text-xl font-semibold">We've logged your request.</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--color-ink-soft)]">
          A team member reviews new tickets within one business day and will reply at the email you gave us.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 font-mono text-sm font-medium text-[var(--color-blueprint)] underline underline-offset-4 hover:text-[var(--color-ink)]"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-lg border border-[var(--color-paper-line)] bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 flex items-center justify-between border-b border-dashed border-[var(--color-paper-line)] pb-4">
        <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-soft)]">
          New work order
        </span>
        <span className="font-mono text-xs text-[var(--color-ink-soft)]">Form 04-A</span>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-5 rounded-md border border-[var(--color-signal)]/30 bg-[var(--color-signal)]/10 px-4 py-3 text-sm text-[var(--color-signal)]"
        >
          {serverError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" error={errors.name}>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass(!!errors.name)}
            placeholder="Jordan Reyes"
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass(!!errors.email)}
            placeholder="jordan@company.com"
          />
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Budget range" htmlFor="budgetRange" error={errors.budgetRange}>
          <select
            id="budgetRange"
            value={values.budgetRange}
            onChange={(e) => update("budgetRange", e.target.value)}
            className={inputClass(!!errors.budgetRange)}
          >
            <option value="">Select a range</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5">
        <Field label="Project details" htmlFor="message" error={errors.message}>
          <textarea
            id="message"
            rows={4}
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
            className={inputClass(!!errors.message)}
            placeholder="What are you trying to build, and by when?"
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="mt-6 w-full rounded-md bg-[var(--color-ink)] px-5 py-3 font-mono text-sm font-medium tracking-wide text-white transition hover:bg-[var(--color-blueprint)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "submitting" ? "Logging your request…" : "Submit inquiry"}
      </button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-[var(--color-ink)]">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-[var(--color-signal)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-md border bg-[var(--color-paper)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-soft)]/50 focus:border-[var(--color-blueprint)] focus:ring-2 focus:ring-[var(--color-blueprint-soft)] ${
    hasError ? "border-[var(--color-signal)]" : "border-[var(--color-paper-line)]"
  }`;
}
