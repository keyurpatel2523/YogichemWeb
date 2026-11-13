# Environment variables

Copy `.env.example` to `.env` for local work. On Vercel, set the same names in Project Settings → Environment Variables. Do not commit real values.

`NEXT_PUBLIC_SITE_URL` is the only value that is included in the browser bundle. Everything else is server-only.

| Variable | Purpose | Required | Used in | Where to obtain | Class |
|---|---|---|---|---|---|
| `DATABASE_URL` | Postgres connection. Use the Neon **pooled** host (`-pooler`) and `sslmode=require` on Vercel. | Yes, at runtime | `server/db.ts`, `drizzle.config.ts` | Neon, or another Postgres host | Database, server-only |
| `SESSION_SECRET` | Signs the httpOnly customer and admin session cookies. Minimum 32 characters. | Yes, at runtime | `src/lib/auth.ts` | `openssl rand -base64 48` | Auth secret, server-only |
| `SENDGRID_API_KEY` | Sends order summaries and “send now” campaigns | No. Orders still save. Mail is skipped or the campaign stays a draft. | `src/utils/sendgridMail.ts` | SendGrid | Third-party, server-only |
| `SENDGRID_FROM_EMAIL` | From address. Must be a verified SendGrid sender. | Required only if the API key is set | `src/utils/sendgridMail.ts` | SendGrid sender authentication | Server-only |
| `ADMIN_EMAIL` | BCC for order summaries | Optional | `src/utils/sendgridMail.ts` | Your operations inbox | Server-only |
| `BLOB_READ_WRITE_TOKEN` | Stores new product and category images | Required in production. Local development writes to `public/uploads` when this is absent. | `src/app/api/admin/upload/route.ts`, `scripts/migrate-uploads.ts` | Vercel Blob store | Server-only |
| `NEXT_PUBLIC_SITE_URL` | Absolute links in the client guide, order email, and the server-action origin allowlist | Recommended. Defaults to `https://yogichem.co.uk` where a fallback exists. Set it at **build** time on Vercel. | `next.config.js`, `src/app/layout.tsx`, `src/utils/orderEmail.ts`, `src/app/client-guide/page.tsx` | Your production URL | Public |
| `ADMIN_INITIAL_EMAIL` | First admin email | Only for `npm run admin:create` | `scripts/create-admin.ts` | You choose it | Server-only, one-time |
| `ADMIN_INITIAL_PASSWORD` | First admin password, at least 12 characters with a letter and a number | Only for `npm run admin:create` | `scripts/create-admin.ts` | You choose it. Do not reuse a shared password. | Server-only, one-time |
| `ADMIN_INITIAL_NAME` | Display name for that admin | Optional. Defaults to `Store Admin` | `scripts/create-admin.ts` | You choose it | Server-only, one-time |
| `NODE_ENV` | `development` or `production` | Set by Next.js and Vercel | cookie `Secure` flag | Platform | Runtime |
| `VERCEL` | Tells the database pool to use one connection per instance | Set by Vercel | `server/db.ts` | Platform | Runtime |
| `PORT` | Listen port for `npm run dev` and `npm run start` | Not used on Vercel | `package.json` scripts | Local only | Development |

## Validation

- `SESSION_SECRET` shorter than 32 characters fails sign-in with “Server configuration error”. The value is not printed.
- `DATABASE_URL` is checked on the first query, not at import, so `next build` can run before the database is attached.
- Missing SendGrid settings do not stop checkout. The order response sets `emailSent: false`.
- Missing `BLOB_READ_WRITE_TOKEN` in production returns HTTP 503 from `POST /api/admin/upload`. Development falls back to `public/uploads`.

## Not present

There is no Stripe, PayPal, WhatsApp, OAuth, or analytics key. Do not add one until that integration is approved.
