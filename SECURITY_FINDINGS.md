# Security findings

Status after this change set. Findings that were fixed are marked fixed. The rest are still open and were not changed because they need a product decision or a live service.

## Fixed in this change

| Finding | What changed |
|---|---|
| Empty databases received `admin@yogichem.com` / `admin123` from a public products request | `autoSeed()` was removed. The first admin is created only by `npm run admin:create`, which refuses to run if an admin exists and requires a 12-character password. |
| Default password was written in the client guide, admin guide, and seed script | Those copies were removed. |
| Checkout trusted the browser for price, shipping, discount, and total, and stored `payment_status = paid` | `POST /api/orders` loads prices from Postgres, applies the shared delivery and coupon rules, and saves `payment_status = unpaid` and `status = pending`. Stock updates and the coupon counter run in one transaction. |
| Card numbers were typed into a form that claimed they were encrypted, and were then discarded | Checkout no longer asks for card or PayPal details. The confirmation says no payment was taken. |
| JWTs were stored in `localStorage` | Login sets httpOnly, `SameSite=Lax` cookies. `Secure` is on when `NODE_ENV=production`. The browser store keeps the profile only. A 401 from the profile request clears a stale profile. Bearer tokens are still accepted by the API so a non-browser client can call it, but the site no longer stores one. |
| Login accepted any redirect query, including an external URL | Redirects must be a same-site path. |
| Registration and password change trusted the browser length check | The server requires 8–72 characters with a letter and a number. New admin passwords require 12. |
| Login, registration, orders, coupons, and uploads had no limit | Each instance keeps a short in-memory limit. On Vercel this is per instance, not global. |
| Campaign HTML was inserted raw into email and the admin preview | Content is reduced to a small set of formatting tags. `javascript:` links and event handlers are removed. |
| Order mail fell back to a personal inbox when SendGrid settings were missing | Mail is not sent unless both the API key and from-address are set. |
| Admin order updates could set `paymentStatus` from the request body | Status updates only accept `pending`, `processing`, `shipped`, `delivered`, or `cancelled`. |
| Blanket `Cache-Control: no-store` covered every path, including hashed static files | That header was removed. `nosniff`, `SAMEORIGIN`, a referrer policy, and a locked-down permissions policy are set instead. |
| `.replit` contained a personal email and was unused by the app | The file was removed after confirming no application code reads it. |

## Still open

| Finding | Why it remains |
|---|---|
| No payment provider | Orders are saved unpaid on purpose. A provider was not added. |
| In-memory rate limits reset on each serverless instance | A shared store such as Redis would be a new service. |
| Bearer tokens still work if a caller already has one | Rotating `SESSION_SECRET` before go-live invalidates them. Do that when you are ready to sign everyone out. |
| Admin pages are gated in the browser; the HTML is not secret | The APIs reject missing admin cookies. |
| Account deletion button does not delete the account | It now says so. There is still no deletion API. |
| `npm audit` reported 25 vulnerabilities (4 low, 7 moderate, 13 high, 1 critical) | `npm audit fix` was not run. Several fixes would be breaking upgrades. Review them separately. |
| No ESLint configuration | `npm run build` completed its type check. There is no lint script. |
| Contact form, order tracking, WhatsApp delivery, scheduled campaigns, and admin settings | They do not pretend to succeed. They are not backed by a provider. |
| Uploaded images on Replit are not in git | They stay where they are until `uploads:migrate --apply` is run by you. |

## Authentication model

Customer cookie `yc_customer` lasts 7 days. Admin cookie `yc_admin` lasts 8 hours. Both are httpOnly and `SameSite=Lax`. Logout clears the matching cookie. Customer and admin tokens are different payloads; a customer cookie is not accepted as an admin session.
