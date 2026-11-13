# Test report

Run on 13 November 2026 from this repository. No production database, SendGrid key, or Vercel Blob token was available, so live journeys were not executed.

## Commands that ran

| Command | Result |
|---|---|
| `npm install` (including `@vercel/blob`) | Completed. npm also reported 25 existing dependency vulnerabilities. They were not changed. |
| `npm test` (`tsx --test src/lib/*.test.ts`) | Passed. 12 tests, 0 failed. |
| `npx tsc --noEmit` | Passed. |
| `npm run build` | Passed. Next.js 14.2.35 compiled, type-checked, and generated the static pages. API routes are dynamic. |

The 12 unit tests cover password rules, order totals (standard, next-day before and after 14:00 UK, collection, percentage and fixed coupons, exhausted coupons, invalid quantities), campaign HTML sanitising, rate-limit windows, forwarded client IP, and safe redirects.

## Not run

| Check | Why |
|---|---|
| Customer registration, login, logout | Needs `DATABASE_URL` and `SESSION_SECRET` against a database you approve. |
| Admin login and `npm run admin:create` | Same. The script was not pointed at any database. |
| Product list, cart, checkout, order row, stock decrement | Needs a database. Checkout maths was unit-tested. The HTTP handler was not called. |
| Image upload and `npm run uploads:migrate` | Needs `BLOB_READ_WRITE_TOKEN` and a database. The script defaults to a dry run and was not executed. |
| SendGrid order mail and campaigns | No API key. |
| Browser pass on desktop or mobile | No running app with credentials. The production build does not prove the pages behave correctly. |
| ESLint | No ESLint config or `lint` script exists. |
| End-to-end suite | There are no Playwright or Cypress tests in the repo. |

## What a later manual pass should confirm

1. Register a customer with a short password and confirm the API rejects it.
2. Register with a valid password, sign out, sign in, and confirm the session cookie is httpOnly and not readable from the page.
3. Add a product to the cart, apply a coupon, place the order, and compare the saved `subtotal`, `shipping_cost`, `discount`, and `total` with the database prices.
4. Confirm the order’s `payment_status` is `unpaid`.
5. Sign in to admin, upload an image, and confirm the returned URL is a Blob URL when the token is set.
6. Confirm an empty database does not create an admin by itself.

Until those steps are done, do not treat registration, login, checkout, or uploads as verified.
