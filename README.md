# Lumos Market

A role-based e-commerce platform built for the Full Stack Developer Internship one-day
assessment: three roles (Admin, Sales Person, User), backend-enforced permissions,
Cloudinary image uploads, Razorpay checkout with server-side signature verification, and
a from-scratch premium storefront UI.

```
ecom/
├── backend/     Express API — RBAC, product/cart/wishlist/order logic, Cloudinary, Razorpay
├── frontend/    React + Vite storefront and role dashboards
└── supabase/    Database schema (schema.sql) and admin bootstrap script (seed.sql)
```

## 1. Stack

| Layer          | Choice                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| Frontend       | React 18 + TypeScript + Vite, Tailwind CSS, React Router, TanStack Query |
| Backend        | Node.js + Express (ESM)                                                 |
| Database       | Supabase (Postgres) — used as a plain Postgres database, not for Auth   |
| Auth           | Hand-rolled: bcrypt password hashing + our own signed JWTs, issued by the Express backend |
| Image storage  | Cloudinary                                                               |
| Payments       | Razorpay (test mode)                                                    |
| Deployment     | Render (backend) + Vercel (frontend)                                    |

**Why our own auth, not Supabase Auth?** Registration and login are fully self-contained in
this backend: `POST /auth/register` hashes the password with bcrypt and inserts a `profiles`
row directly; `POST /auth/login` verifies the hash and signs our own JWT (`{ sub, role }`,
7-day expiry). The frontend never talks to any auth provider directly — it stores the JWT
and sends it as `Authorization: Bearer <token>` on every request, which `requireAuth` verifies
and uses to load the caller's role from `profiles` before any route logic runs. See
[`backend/src/modules/auth/auth.service.js`](backend/src/modules/auth/auth.service.js),
[`backend/src/middleware/auth.middleware.js`](backend/src/middleware/auth.middleware.js), and
[`backend/src/middleware/role.middleware.js`](backend/src/middleware/role.middleware.js).

## 2. Local setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Cloudinary](https://cloudinary.com) account
- A [Razorpay](https://razorpay.com) account (test mode keys)

### 2.1 Database
Supabase is used here purely as a hosted Postgres database — its Auth product is not used
anywhere in this app.
1. Create a new Supabase project.
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql) once — it creates
   the `profiles` (with `password_hash`), `products`, `cart_items`, `wishlist_items`, `orders`,
   `order_items`, and `idempotency_keys` tables, plus the `role` enum and RLS (enabled with no
   policies — the Express backend is the only client, always via the service-role key).

### 2.2 Backend
```bash
cd backend
cp .env.example .env      # fill in Supabase / Cloudinary / Razorpay / JWT_SECRET values
npm install
npm run dev                # starts on http://localhost:5000
```
Generate `JWT_SECRET` with `openssl rand -hex 32` (or any long random string) — it signs the
app's own session tokens and must stay secret.

### 2.3 Frontend
```bash
cd frontend
cp .env.example .env      # set the API base URL
npm install
npm run dev                # starts on http://localhost:5173
```

### 2.4 Create your first Admin
Every self-registration is either `user` or `sales_person` — nobody can grant themselves
`admin` from the UI, on purpose. Register one account normally, then run
[`supabase/seed.sql`](supabase/seed.sql) (swap in that account's email) in the Supabase SQL
editor to promote it. From then on, that Admin can promote/demote anyone from the
**Admin → Users** tab.

## 3. Environment variables

See [`backend/.env.example`](backend/.env.example) and
[`frontend/.env.example`](frontend/.env.example) for the full list. Never commit a real `.env`
— both are already gitignored.

## 4. Test credentials

One account per role, seeded against the dev database for grading:

| Role         | Email              | Password          |
| ------------ | ------------------ | ------------------ |
| Admin        | admin@lumos.test   | LumosAdmin123!      |
| Sales Person | sales@lumos.test   | LumosSales123!      |
| User         | user@lumos.test    | LumosUser123!       |

If you point this at a fresh database instead, these won't exist — register a `user` and a
`sales_person` via the register page, then promote one account to `admin` via
[`supabase/seed.sql`](supabase/seed.sql) (see 2.4 above).

## 5. Roles & permission boundary

| Role         | Can do                                                                            |
| ------------ | ---------------------------------------------------------------------------------- |
| Admin        | Manage any product, manage users & roles, view/all orders, view sales stats        |
| Sales Person | Add/edit/delete only their own products, view orders containing their products     |
| User         | Browse/search/filter, manage wishlist & cart, view their own order history         |

Every restriction above is enforced in Express middleware
([`requireAuth`](backend/src/middleware/auth.middleware.js) +
[`restrictTo`](backend/src/middleware/role.middleware.js)), not just hidden in the UI — a
Sales Person calling `DELETE /api/v1/products/:id` on another seller's product gets a `403`
regardless of what the frontend renders. The frontend's [`RoleRoute`](frontend/src/routes/RoleRoute.tsx)
only exists so the wrong role never sees a button it can't use — it is UX, not the security
boundary.

## 6. Feature completion summary

| Feature | Implementation |
| --- | --- |
| **Authentication** | Hand-rolled: bcrypt-hashed passwords in `profiles`, our own signed JWT issued on login, verified by `requireAuth` on every protected request. |
| **Role-based access** | `role` enum on `profiles`; Express `restrictTo(...)` middleware gates every mutating route. Product ownership is additionally checked in the service layer so a Sales Person can only touch their own listings. |
| **Product CRUD** | Public search/filter/paginate on `GET /products`; Admin/Sales Person can create/update/delete, with ownership enforced server-side. Images upload straight to Cloudinary via an in-memory `multer` buffer stream — the raw file never touches disk, and only the returned `secure_url` is persisted. |
| **Search & filters** | Keyword (`ilike` on name), category, and price range, all as query params, debounced client-side. |
| **Wishlist** | Add/remove per user, unique constraint on `(user_id, product_id)`. |
| **Cart** | Add/update quantity/remove; stock is checked on add and again at checkout; navbar badge reflects live count via React Query cache. |
| **Razorpay checkout** | Two-step flow: `POST /orders/razorpay` snapshots the cart into a pending `orders` + `order_items` row and opens a Razorpay order; `POST /orders/verify` recomputes the HMAC-SHA256 signature server-side before marking the order paid, decrementing stock, and clearing the cart. A forged success callback without a valid signature is rejected with 400 and the order is marked `failed`. |
| **Order history & dashboards** | Users see their own paid orders; Sales Person sees orders containing their products (joined via a denormalised `seller_id` on `order_items`); Admin sees every order plus a stats tab (total sales, orders, products, users). |
| **Deployment** | Backend on Render (see `render.yaml`), frontend on Vercel (`vercel.json` handles SPA routing). |
| **API versioning** | All routes live under `/api/v1` (health check stays unversioned at `/api/health`). A breaking change ships as `routes/v2/` mounted alongside `v1` — existing clients on `/api/v1` never break. |
| **Structured logging** | `pino` + `pino-http` replace `morgan`: JSON logs in production (ready for a log aggregator), pretty-printed in dev. Every request gets a correlation id (`X-Request-Id`), and the error middleware logs the full stack server-side via the request-scoped logger while returning a clean message to the client. Auth headers, cookies, and payment signatures are redacted from logs. |
| **Idempotent checkout** | `POST /orders/razorpay` requires an `Idempotency-Key` header (Stripe/Razorpay-style). A retried request with the same key replays the original response instead of snapshotting the cart into a second pending order — see `backend/src/middleware/idempotency.middleware.js`. |

## 7. Deployment

### Backend → Render
1. New **Web Service**, connect this repo, set **Root Directory** to `backend`.
2. Build command: `npm install`. Start command: `npm start`.
3. Add every variable from `backend/.env.example` under **Environment** (real values), and set
   `CLIENT_ORIGIN` to your Vercel frontend URL once it exists.

### Frontend → Vercel
1. Import this repo, set **Root Directory** to `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add the variables from `frontend/.env.example`, pointing `VITE_API_BASE_URL` at your live
   Render URL (`https://<your-service>.onrender.com/api/v1`).
4. Redeploy the backend once you know the final Vercel URL so `CLIENT_ORIGIN` (CORS) matches.

### Live URLs
- Frontend: _add after deploying_
- Backend: _add after deploying_

## 8. Screenshots

_Add 2–3 screenshots here after running the app locally or live (storefront grid, product
detail with Razorpay checkout open, and an Admin/Sales dashboard)._

## 9. Git workflow

Commit history is organized by layer/milestone (schema → backend modules → frontend modules →
docs/deployment), not squashed into one commit. `feature/deployment-and-docs` is a feature
branch merged into `main` via pull request, per Task 9.
