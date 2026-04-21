# Threat Model

## Project Overview

Yally Bet is a pnpm monorepo with a production Express 5 API in `artifacts/api-server` and a production React/Vite frontend in `artifacts/yally-bet`. Users can register, log in, browse betting content, submit payment/ticket requests, and access unlocked tickets. Administrative users can review requests, manage users/admins, and change public site content and settings.

Production authentication uses a custom bearer-token session system backed by PostgreSQL tables such as `users`, `sessions`, and `admins`. The client is untrusted. Server-side authorization must be the source of truth for whether an account is a regular user, limited admin, or super admin.

Per platform assumptions, transport-layer TLS is provided by the deployment platform in production. `artifacts/mockup-sandbox` is treated as dev-only and out of scope unless production reachability is demonstrated.

## Assets

- **User accounts and sessions** -- user identities, bearer session tokens, and account metadata. Compromise allows impersonation and access to ticket history and paid content.
- **Administrative authority** -- membership in the `admins` table, super-admin status, admin permissions, and any bootstrap credentials or PINs. Compromise allows full control over users, ticket approvals, and public content.
- **Payment and request data** -- ticket requests include user identity, payment number, payment method, and request status. This data is sensitive and can be abused for fraud or privacy harm.
- **Public content and site configuration** -- banners, tipsters, history entries, packages, and app settings such as Telegram/WhatsApp/support links. These values are user-visible and can become phishing or script/navigation sinks if not constrained.
- **Application secrets and infrastructure access** -- database connection strings and any seeded administrative secrets. Exposure can lead to direct backend compromise.

## Trust Boundaries

- **Browser to API** -- all frontend input crosses into the Express API. The browser cannot be trusted to enforce permissions, roles, or business rules.
- **API to PostgreSQL** -- the API has direct write access to sessions, users, admins, content, and payment-request data. Injection or authorization failures at the API layer would directly affect persistent state.
- **Public user to authenticated user** -- browsing content is public or lightly protected, while ticket requests and unlocked-ticket access require a valid session.
- **Authenticated user to admin** -- admin-only routes in `/api/users`, `/api/admins`, `/api/requests`, `/api/banners`, and `/api/content/*` must enforce server-side authorization based on intended privileges, not UI state.
- **Limited admin to super admin** -- some admins may be intended to handle only specific functions (for example payment requests). Privilege separation inside the admin surface matters because those accounts can affect all users and content.
- **Production to dev-only code** -- legacy or unused frontend-only admin login shims are not authoritative for production access control unless they are wired into the live app path.

## Scan Anchors

- Production backend entry points: `artifacts/api-server/src/index.ts`, `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/index.ts`
- Highest-risk code areas: `artifacts/api-server/src/lib/auth.ts`, `artifacts/api-server/src/lib/seed.ts`, `artifacts/api-server/src/routes/admins.ts`, `artifacts/api-server/src/routes/auth.ts`, `artifacts/api-server/src/routes/content.ts`
- Public surfaces: `/api/auth/*`, `GET /api/banners`, `GET /api/content/*`, frontend social/support links driven by settings
- Authenticated/admin surfaces: `/api/users/*`, `/api/admins/*`, `/api/requests/*`, write operations on `/api/banners` and `/api/content/*`
- Dev-only areas usually ignored: `artifacts/mockup-sandbox`, helper scripts under `scripts/` unless production reachability is shown

## Threat Categories

### Spoofing

The application relies on opaque bearer tokens stored client-side and validated against the `sessions` table. All protected endpoints MUST require a valid, unexpired session token, and any privileged bootstrap path MUST avoid hardcoded production credentials or predictable defaults. Administrative identity MUST be derived from authoritative server-side state, not from legacy frontend-only login flows.

### Tampering

Authenticated and administrative users can mutate ticket requests, banners, content tables, packages, and app settings. The API MUST validate request bodies and MUST enforce the intended permission boundary for each administrative action so that a user with one limited workflow cannot modify unrelated users, roles, or public content.

### Information Disclosure

The system stores user emails, phone numbers, payment-request details, admin permissions, and potentially sensitive settings. Administrative endpoints MUST not expose secrets such as bootstrap credentials or reusable PIN values to broader audiences than necessary. Error responses and logs MUST avoid leaking internal database or server details back to clients.

### Denial of Service

Public authentication endpoints and public content endpoints are internet-facing. Login, registration, and other state-changing routes SHOULD resist brute-force and abuse through reasonable throttling and validation so an attacker cannot cheaply exhaust resources or enumerate accounts at scale.

### Elevation of Privilege

This project’s highest-risk threat is unauthorized access to the admin surface. Only explicitly granted admin accounts should be able to reach administrative capabilities, and limited admins MUST be restricted to their assigned functions. Super-admin rights MUST never be derived from hardcoded identities or predictable seeded credentials. Publicly visible content fields and settings MUST not become a path for lower-privileged users to execute actions or code in higher-value contexts.