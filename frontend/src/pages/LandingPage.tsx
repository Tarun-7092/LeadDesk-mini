import { Link } from "react-router-dom";
import { LeadForm } from "../components/LeadForm";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-grid">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[var(--color-ink)] font-mono text-sm font-bold text-white">
            L
          </span>
          <span className="font-[var(--font-display)] text-lg font-semibold">LeadDesk</span>
        </div>
        <Link
          to="/admin/login"
          className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          Team login →
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-blueprint)]">
            Digital Heroes Agency — Web Development Intake
          </p>
          <h1 className="mt-4 font-[var(--font-display)] text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Tell us what you're building. We'll open a ticket the same day.
          </h1>
          <p className="mt-5 max-w-lg text-base text-[var(--color-ink-soft)]">
            We build fast, well-engineered websites and web apps for small and growing
            businesses. Every inquiry gets logged, reviewed, and answered by an actual person —
            no forms that vanish into a void.
          </p>
          <a
            href="#lead-form"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-[var(--color-ink)] px-6 py-3 font-mono text-sm font-medium text-white transition hover:bg-[var(--color-blueprint)]"
          >
            Start a work order ↓
          </a>
        </div>

        <div className="relative rotate-1 rounded-lg border border-[var(--color-paper-line)] bg-white p-6 font-mono text-xs shadow-md">
          <div className="flex items-center justify-between border-b border-dashed border-[var(--color-paper-line)] pb-3 text-[var(--color-ink-soft)]">
            <span>WORK ORDER</span>
            <span>#A-1042</span>
          </div>
          <dl className="mt-4 space-y-3 text-[var(--color-ink)]">
            <Row k="CLIENT" v="Marlowe & Co." />
            <Row k="SCOPE" v="Rebuild marketing site" />
            <Row k="BUDGET" v="$5,000 – $15,000" />
            <Row k="STATUS" v="CONTACTED" accent="var(--color-status-contacted)" />
          </dl>
          <div className="mt-5 -rotate-2 border-2 border-[var(--color-status-closed)] px-3 py-1 text-center font-semibold uppercase tracking-widest text-[var(--color-status-closed)]">
            Logged &amp; assigned
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="border-y border-[var(--color-paper-line)] bg-white/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-[var(--font-display)] text-2xl font-semibold">What we take on</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <ServiceCard
              title="Marketing sites"
              body="Landing pages and brochure sites that load fast and convert — built for launch, not just for looks."
            />
            <ServiceCard
              title="Web applications"
              body="Dashboards, internal tools, and customer-facing apps with real authentication and data behind them."
            />
            <ServiceCard
              title="Ongoing support"
              body="Bug fixes, feature additions, and small releases for sites we didn't necessarily build first."
            />
          </div>
        </div>
      </section>

      {/* Lead form */}
      <section id="lead-form" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-semibold">Open a work order</h2>
            <p className="mt-3 max-w-sm text-sm text-[var(--color-ink-soft)]">
              Four fields, two minutes. The more detail you give us in "project details," the
              faster we can scope it.
            </p>

            <div className="mt-8 space-y-4 border-t border-dashed border-[var(--color-paper-line)] pt-6 text-sm text-[var(--color-ink-soft)]">
              <TrustItem text="A person reads every submission — nothing gets auto-replied and ignored." />
              <TrustItem text="You'll hear back within one business day, usually sooner." />
              <TrustItem text="No obligation. This starts a conversation, not a contract." />
            </div>
          </div>

          <LeadForm />
        </div>
      </section>

      <footer className="border-t border-[var(--color-paper-line)] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 text-xs text-[var(--color-ink-soft)] sm:flex-row">
          <span>LeadDesk Mini — a lead intake tool built for small agencies.</span>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-[var(--color-ink)]"
          >
            Built for Digital Heroes Training Task
          </a>
        </div>
      </footer>
    </div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[var(--color-ink-soft)]">{k}</dt>
      <dd className="font-medium" style={accent ? { color: accent } : undefined}>
        {v}
      </dd>
    </div>
  );
}

function ServiceCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-paper-line)] bg-white p-6">
      <h3 className="font-[var(--font-display)] text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{body}</p>
    </div>
  );
}

function TrustItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-blueprint)]" />
      <span>{text}</span>
    </div>
  );
}
