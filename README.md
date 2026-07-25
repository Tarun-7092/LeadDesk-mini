# LeadDesk Mini

A small lead-capture product for a digital agency: a public landing page with a
lead form, and a protected admin queue for reviewing, searching, and updating
those leads.

**Live public site:** `<add your deployed frontend URL>`
**Admin:** `<add your deployed frontend URL>/admin` (redirects to `/admin/login` if signed out)
**Repo:** `<add your GitHub URL>`

---

## 1. Product overview

LeadDesk Mini is built for a small digital agency that takes in website /
web-app development inquiries and needs a lightweight way to:

- Let prospects submit a project inquiry from the public site.
- Give the team a single place to see every inquiry, search it, and move it
  through a simple pipeline: **New → Contacted → Closed**.

It intentionally does not try to be a full CRM — no pipelines beyond the three
required statuses, no tagging, no email automation. The brief was to ship a
tight, correct version of one workflow, not a bloated dashboard.

## 2. Features

**Public**
- Landing page with hero, services section, and trust/expectations section.
- Lead form (name, email, budget range, message) with client-side validation
  and clear loading / success / error states.
- Duplicate-submit protection (the submit button disables while a request is
  in flight).

**Admin**
- Cookie-based login, no hardcoded frontend password.
- Protected `/admin` route — unauthenticated visitors are redirected to
  `/admin/login`; the redirect check runs against the server on every load, so
  refreshing the page doesn't leak access.
- Lead table with search (name / email / message), a status control per row,
  and loading / empty / no-results / error states.
- Logout.

## 3. Tech stack

| Layer | Choice |
|---|---|
| Frontend | React + TypeScript + Vite + Tailwind CSS v4 + React Router |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB + Mongoose |
| Auth | JWT in an httpOnly cookie |
| Validation | Zod (server), matching hand-written rules (client) |

## 4. Architecture

```
leaddesk-mini/
├── backend/           Express API, TypeScript, Mongoose models
│   └── src/
│       ├── config/    env loading + Mongo connection
│       ├── models/    User, Lead (Mongoose schemas)
│       ├── routes/    auth.ts, leads.ts
│       ├── middleware/requireAuth.ts
│       ├── utils/     auth (hash/JWT), validation (Zod schemas)
│       └── scripts/   seedAdmin.ts (creates the first admin user)
└── frontend/           React app, TypeScript, Vite, Tailwind
    └── src/
        ├── api/client.ts       fetch wrapper (always sends cookies)
        ├── context/AuthContext.tsx
        ├── pages/              LandingPage, AdminLogin, AdminDashboard
        └── components/
```

**Request flow:** the React app never talks to MongoDB directly. It calls the
Express API over `fetch` with `credentials: "include"`. Public lead
submission (`POST /api/leads`) requires no auth. Every admin endpoint
(`GET /api/leads`, `PATCH /api/leads/:id/status`, `GET /api/auth/me`) runs
through a `requireAuth` middleware that reads and verifies the JWT from an
httpOnly cookie before touching the database.

**Auth flow:**
1. Admin submits email + password on `/admin/login`.
2. Server looks up the user, compares the password against a bcrypt hash,
   and — if it matches — signs a JWT (`{ userId }`) and sets it as an
   `httpOnly`, `sameSite`, `secure` (in production) cookie.
3. The browser sends that cookie automatically on every subsequent request.
   `requireAuth` verifies the JWT signature and expiry on each protected
   request; no server-side session store is needed.
4. Logout clears the cookie. There's no separate token blacklist — expiry is
   what eventually invalidates a token if the cookie is somehow retained
   (see the tradeoff in section 7).

## 5. Data model

**User** (admin accounts only — there is no public user signup)
| Field | Type | Notes |
|---|---|---|
| email | string | unique, lowercased |
| passwordHash | string | bcrypt, 12 salt rounds |
| name | string | |
| createdAt | Date | |

**Lead**
| Field | Type | Notes |
|---|---|---|
| name | string | required, ≤120 chars |
| email | string | required, validated format, ≤254 chars |
| budgetRange | enum | `UNDER_1K`, `1K_5K`, `5K_15K`, `15K_PLUS`, `NOT_SURE` |
| message | string | required, 10–2000 chars |
| status | enum | `NEW` (default) → `CONTACTED` → `CLOSED` |
| createdAt / updatedAt | Date | via Mongoose `timestamps: true` |

Indexes: a text index on `name`/`email`/`message` (search) and a compound
index on `status` + `createdAt` (queue ordering).

## 6. API contract

All responses are JSON. Errors are `{ "error": "<message>" }` with an
appropriate 4xx/5xx status — internal error details are never sent to the
client.

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/api/leads` | none | `{ name, email, budgetRange, message }` | 201 with `{ id, createdAt }`; 400 on validation failure |
| GET | `/api/leads` | required | — | Query: `search`, `status`, `page`, `limit`. Returns `{ items, total, page, limit, totalPages }` |
| PATCH | `/api/leads/:id/status` | required | `{ status }` | status must be one of NEW/CONTACTED/CLOSED |
| POST | `/api/auth/login` | none | `{ email, password }` | Sets the auth cookie on success |
| POST | `/api/auth/logout` | none | — | Clears the auth cookie |
| GET | `/api/auth/me` | required | — | Returns the signed-in admin's `{ id, email, name }` |
| GET | `/api/health` | none | — | Basic liveness check |

## 7. Key engineering decisions

**1. JWT-in-httpOnly-cookie instead of server-side sessions**
- *Why:* no session store (Redis, DB-backed sessions) to provision or keep
  alive — one less moving part for a small, single-admin-role app, and it
  deploys cleanly on free-tier hosting without sticky sessions.
- *Tradeoff:* a stolen token is valid until it expires (12h by default);
  there's no way to revoke one token individually without adding a
  server-side deny-list. Acceptable here because the admin surface is small,
  internal, and JWT lifetime is short — a real multi-admin product with
  higher stakes would justify the extra session-store complexity.

**2. Lead status as a fixed enum, not free text**
- *Why:* the whole point of a status is that it drives filtering, badge
  color, and (eventually) automation. Free text would let the field drift
  ("contactd", "Closed - won", etc.) and break every downstream query.
- *Tradeoff:* adding a new stage later means a migration across the schema,
  validation, and UI, instead of just typing a new string. For three
  well-defined stages that's a fine trade.

**3. Search implemented server-side against MongoDB, not client-side filtering**
- *Why:* the admin should get the same, authoritative result set regardless
  of how many leads exist — client-side filtering only works once all leads
  are already downloaded, which doesn't scale and would leak the full lead
  list to the browser before filtering. Search also needs to compose with
  auth and future pagination.
- *Tradeoff:* the current implementation uses a case-insensitive regex
  across name/email/message rather than MongoDB's `$text` index search. That
  regex is simple to reason about and works well at small-to-medium volume,
  but doesn't rank relevance and gets slower as the collection grows into
  the hundreds of thousands of documents — at that point the `$text` index
  already created on the schema would be the next step.

**4. Validation duplicated on client and server (not client-only)**
- *Why:* client-side validation is for immediate UX feedback; it's not a
  security boundary because anyone can call the API directly, bypassing the
  browser entirely. The server re-validates everything with Zod and is the
  only thing that decides what gets written to the database.
- *Tradeoff:* the validation rules live in two places (a hand-written
  checker on the client, Zod schemas on the server) instead of one shared
  package, which risks drift if a rule changes on one side and not the
  other. For a project this size, sharing a validation package across a
  Vite frontend and a Node backend added more build complexity than it
  saved.

## 8. Local setup

Requires Node 18+ and a MongoDB connection string (local `mongod` or a free
MongoDB Atlas cluster).

```bash
# Backend
cd backend
cp .env.example .env        # fill in MONGODB_URI, JWT_SECRET, FRONTEND_ORIGIN
npm install
npm run seed:admin          # requires SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD env vars, see below
npm run dev                 # http://localhost:4000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173, proxies /api to :4000
```

To seed the first admin user, either export the two env vars before running
`npm run seed:admin`, or add them temporarily to `backend/.env`:

```bash
SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=change-me-now npm run seed:admin
```

## 9. Environment variables

**backend/.env** (see `backend/.env.example`)
```
NODE_ENV
PORT
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
FRONTEND_ORIGIN
SEED_ADMIN_EMAIL      (only used by the seed script, not by the server)
SEED_ADMIN_PASSWORD   (only used by the seed script, not by the server)
SEED_ADMIN_NAME       (only used by the seed script, not by the server)
```

**frontend/.env** (see `frontend/.env.example`) — only needed if the frontend
and backend are deployed on different domains:
```
VITE_API_URL
```

No real values are committed anywhere in this repo; `.env` is gitignored.

## 10. Test credentials

```
URL:      <add your deployed admin URL>
Email:    <add demo admin email>
Password: <add demo admin password>
```

*(Fill this in with a demo account created only for evaluation — never reuse
a real password here.)*

## 11. AI usage

> **AI Usage:** I used AI tools for scaffolding the initial project structure,
> writing boilerplate CRUD/validation code, and reviewing the auth flow for
> edge cases. I did not use the output blindly; I made the final decisions
> about the data model, the JWT-cookie authentication approach, the enum-based
> status representation, where search is implemented, and the visual/UX
> direction, and I tested and adjusted the implementation myself before
> considering it done.

---

Built for Digital Heroes Training Task — https://digitalheroesco.com
