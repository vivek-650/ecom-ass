# Implementation Report

## What was completed

All 11 tasks in the assignment brief: project scaffold, database schema, Supabase-Auth-backed
RBAC, product CRUD with Cloudinary uploads, the storefront UI, wishlist/cart, Razorpay checkout
with server-side verification, role-scoped order history/dashboards, a documented Git workflow,
deployment configs for Render/Vercel, and this documentation set.

## How each feature was implemented

**Authentication & RBAC.** Registration and login run through Supabase Auth on the frontend
(`frontend/src/api/auth.api.ts`), which is where password hashing and session issuance actually
happen — there's no reason to hand-roll that. A Postgres trigger (`handle_new_user` in
`supabase/schema.sql`) creates a matching `profiles` row with a `role` on every sign-up. Every
Express request carries the Supabase access token as a Bearer header; `requireAuth`
(`backend/src/middleware/auth.middleware.js`) verifies it against Supabase and attaches the
caller's profile (including role) to `req.user`. `restrictTo(...)` then gates routes by role,
and product mutations additionally check `owner_id === req.user.id` (or admin) inside
`products.service.js` — so the permission boundary lives entirely on the server.

**Product CRUD + Cloudinary.** Product creation/update accepts `multipart/form-data`; `multer`
holds the file in memory and `upload.service.js` streams the buffer straight to Cloudinary via
`upload_stream`, so the file never hits this server's disk. Only the returned `secure_url` (and
`public_id`, for cleanup on delete/replace) is stored in Postgres.

**Cart & wishlist.** Both are per-user tables with a `unique (user_id, product_id)` constraint,
so "add" is really an upsert — adding an already-cart'd item increments quantity instead of
creating a duplicate row.

**Razorpay checkout.** Two-step server flow, mirroring how Razorpay's own docs recommend
avoiding forged success callbacks: `POST /orders/razorpay` snapshots the current cart into a
pending `orders` + `order_items` row (locking in price and seller at that moment) and opens a
matching Razorpay order; `POST /orders/verify` recomputes the HMAC-SHA256 signature from
`order_id|payment_id` using the Razorpay key secret and compares it to what the client sent. A
mismatch marks the order `failed` and returns 400 — nothing is trusted from the browser alone.
On success, stock is decremented per line item and the cart is cleared.

**Order history & dashboards.** `order_items.seller_id` is denormalised at checkout time
specifically so "orders containing my products" (Sales Person view) is a single indexed query
instead of a multi-table fan-out on every page load.

**Frontend architecture.** TanStack Query owns all server state (products, cart, wishlist,
orders) with typed API modules per resource (`frontend/src/api/*.api.ts`) and a shared Axios
instance that injects the Supabase token and unwraps the backend's `{ success, data, message }`
envelope. Cart/wishlist mutations write straight into the query cache on success instead of
re-fetching, so the navbar badge updates instantly. Routing uses two guard layers
(`ProtectedRoute` for "must be signed in", `RoleRoute` for "must have role X") — cosmetic only,
since the backend enforces the same rule independently.

## Challenges and how they were solved

- **Trusting the frontend for RBAC is the most common shortcut on this kind of assignment.**
  Solved by never branching on role in a controller without also checking it in
  `restrictTo`/ownership checks in the service layer — the frontend hiding "Add Product" from a
  User is UX, not the actual gate.
- **Razorpay's client-side "success" callback is not proof of payment.** Solved by never writing
  `status = 'paid'` anywhere except after the server recomputes and matches the HMAC signature.
- **Bootstrapping the very first Admin** without an insecure self-service "become admin"
  checkbox. Solved with `supabase/seed.sql` — a one-time manual SQL promotion after the first
  real sign-up, documented in the README.

## Pending features / known limitations

- No seeded demo accounts ship with the repo (no live Supabase project is bundled with the
  code) — the README documents the one-time setup to create Admin/Sales/User test accounts.
  Live URLs and screenshots are placeholders in the README pending an actual Render/Vercel/
  Supabase deployment with real credentials.
- Stock decrement on payment success is not wrapped in a single Postgres transaction/RPC (it's
  a loop of per-item updates from Express); acceptable at this scale, but a high-concurrency
  storefront would want an atomic `decrement_stock` RPC instead.
- No pagination on the Admin "all orders"/"all users" views — fine at assignment scale, would
  need cursor pagination for a larger catalogue.

## Test credentials

See the README's "Test credentials" table — filled in once you complete local/live setup and
create one account per role.
