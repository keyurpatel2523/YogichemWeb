# Vercel deployment

Do not deploy, change DNS, or point this app at a production database until you have reviewed this guide. Nothing in this repository deploys itself.

## Project settings

| Setting | Value |
|---|---|
| Framework | Next.js |
| Root directory | repository root |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output | default Next.js output. Do not set `output: 'standalone'` |
| Node.js | 20.x |

`npm start` binds to port 5000 for a VPS. Vercel does not use it.

## 1. Database

1. Create a Neon Postgres database. Do not run `npm run db:seed` against a database that already has customers or orders.
2. Copy the **pooled** connection string. The host should contain `-pooler`, and the URL should include `sslmode=require`.
3. To move the existing Replit database, dump and restore. This does not delete the source database.

```bash
pg_dump "$REPLIT_DATABASE_URL" -F c -f yogichem.dump
pg_restore --no-owner --no-acl -d "$NEW_DATABASE_URL" yogichem.dump
```

4. If the new database is empty and you want the sample catalogue only, run `npm run db:push` and then `npm run db:seed`. The seed script does not create an admin.
5. Create the first admin once:

```bash
ADMIN_INITIAL_EMAIL="you@yourdomain.com" \
ADMIN_INITIAL_PASSWORD="a-long-unique-password1" \
ADMIN_INITIAL_NAME="Store Admin" \
npm run admin:create
```

The command refuses to run when any admin row already exists, and it does not print the password.

## 2. Images

Existing `/uploads/...` files live on the Replit disk, not in git. Copy that directory to `public/uploads/` on a machine that has `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN`, then:

```bash
npm run uploads:migrate          # prints the plan and writes nothing
npm run uploads:migrate -- --apply
```

The script updates `product_images`, `categories.image`, and `promotions.banner_image` when the URL is exactly `/uploads/<filename>`. It does not delete the local files or any database row. Absolute URLs, including Unsplash links, are left as they are.

New admin uploads go to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set.

## 3. Vercel environment

Add every required name from `ENVIRONMENT_VARIABLES.md` to Production, and to Preview if previews should work. Set `NEXT_PUBLIC_SITE_URL` before the first production build. Changing it later requires a new deployment.

Suggested production values:

- `DATABASE_URL`
- `SESSION_SECRET` (new random value; this signs out every existing token)
- `NEXT_PUBLIC_SITE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `ADMIN_EMAIL` when you want email

Do not put `ADMIN_INITIAL_PASSWORD` on Vercel. Run the admin script from your own machine against the database.

## 4. Deploy

1. Import the Git repository in Vercel.
2. Confirm the settings in the table above.
3. Deploy.
4. Attach the production domain in Vercel after you approve the DNS change. Vercel issues the certificate.

There is no cron. Scheduled email and WhatsApp rows are not delivered.

## 5. After the first deploy

- Sign in as the admin you created. The old `admin123` account is no longer created automatically. If that account already exists in the restored database, change or disable it in the database before the site is public.
- Customers who were signed in on the old site must sign in again. Sessions are httpOnly cookies named `yc_customer` and `yc_admin`.
- Place a test order. Confirm `payment_status` is `unpaid` and the total matches the database product price.
- Upload one image in admin and confirm the stored URL is a Blob URL.

## What stays local

`deploy/nginx.conf` and `ecosystem.config.js` are the old VPS process manager and reverse proxy. Vercel does not read them.
