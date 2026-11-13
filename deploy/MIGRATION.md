# Yogichem deployment

The current target is Vercel plus your own Postgres database. Follow [VERCEL_DEPLOYMENT.md](../VERCEL_DEPLOYMENT.md). Environment names are in [ENVIRONMENT_VARIABLES.md](../ENVIRONMENT_VARIABLES.md).

The sections below are the earlier VPS plan (Nginx, PM2, a long-running Node process). They are not used by Vercel. Keep them only if you later choose a VPS. Vercel cannot serve files written to `public/uploads`; new uploads go to Vercel Blob, and existing files move with `npm run uploads:migrate`.

---

# Earlier VPS notes


## 1. Analysis summary

**Replit-specific dependencies**
- No `@replit/*` npm packages in `package.json` — the app code itself is portable.
- `.replit` config: declares `nodejs-20` + `postgresql-16` modules, the `javascript_database`
  and `replitmail` integrations, and an `autoscale` deployment target that runs
  `npm run build` / `npm run start`. None of this is read outside Replit — `replitmail` isn't
  even referenced in code (SendGrid is used for mail instead). This file can stay (harmless)
  or be deleted once off Replit.
- `dev`/`start` scripts hardcode `-p 5000 -H 0.0.0.0`, a Replit convention. Fine to keep for
  the VPS too — Nginx will reverse-proxy to it (see `deploy/nginx.conf`).

**Database provider**: Replit's built-in PostgreSQL 16 (Neon-backed). Connection is via
`DATABASE_URL` with `sslmode=require`; `server/db.ts` already branches on that string to
decide whether to set `ssl: { rejectUnauthorized: false }`, so it works against both Replit's
DB and a plain local Postgres with no further code changes.

**ORM**: Drizzle ORM (`drizzle-orm` + `drizzle-kit`), schema in `shared/schema.ts`,
config in `drizzle.config.ts` (dialect: `postgresql`).

**Environment variables required** (see `.env.example`, now in the repo root):
| Variable | Used for |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `SESSION_SECRET` | JWT signing for customer + admin auth |
| `SENDGRID_API_KEY` | Order/marketing emails |
| `SENDGRID_FROM_EMAIL` | From address for outgoing email |
| `ADMIN_EMAIL` | BCC target for admin order notifications |
| `NEXT_PUBLIC_SITE_URL` | Absolute URLs in admin pages, server-action origin allowlist |
| `PORT` (optional) | Defaults to 5000 |

**Hardcoded Replit URLs found and fixed:**
- `src/app/client-guide/page.tsx` — 5 occurrences of `https://yogichem.replit.app` →
  now read from `NEXT_PUBLIC_SITE_URL` (defaults to `https://yogichem.co.uk`).
- `src/app/admin/whatsapp/page.tsx:263` and `src/app/admin/email/page.tsx:283` — example
  placeholder text shown to admins in empty textareas, domain literal updated to
  `yogichem.co.uk`.
- `next.config.js` — `serverActions.allowedOrigins` was `['*']` (wildcard, needed because
  Replit preview domains are unpredictable). Tightened to derive the real host from
  `NEXT_PUBLIC_SITE_URL`.

No other Replit-specific URLs, `REPL_ID`/`REPL_SLUG` env reads, or Replit SDK calls exist
in `src/`, `server/`, `shared/`, or `scripts/`.

---

## 2. Database migration (Replit Postgres → your own Postgres)

Run these from your machine (or anywhere with network access to both databases) — `pg_dump`
and `pg_restore`/`psql` are the standard Postgres tools, install via `brew install postgresql`
if missing locally.

```bash
# 1. Dump the Replit database. Get the current DATABASE_URL from Replit's Secrets panel.
pg_dump "$REPLIT_DATABASE_URL" -F c -f yogichem_dump.bak

# 2. On the new server, install Postgres 16 and create the app database/user.
sudo apt update && sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER yogichem_app WITH PASSWORD 'CHANGE_ME';"
sudo -u postgres psql -c "CREATE DATABASE yogichem OWNER yogichem_app;"

# 3. Copy the dump to the server and restore it.
scp yogichem_dump.bak youruser@your-vps-ip:/tmp/
ssh youruser@your-vps-ip
pg_restore --no-owner --role=yogichem_app -d "postgresql://yogichem_app:CHANGE_ME@localhost:5432/yogichem" /tmp/yogichem_dump.bak

# 4. Sanity check.
psql "postgresql://yogichem_app:CHANGE_ME@localhost:5432/yogichem" -c "\dt"
psql "postgresql://yogichem_app:CHANGE_ME@localhost:5432/yogichem" -c "SELECT count(*) FROM products;"
```

If you'd rather start clean and re-seed instead of migrating real data, skip the dump/restore
and just run `npm run db:push && npm run db:seed` on the server after step 2.

Going forward, schema changes are applied with Drizzle, not raw SQL:
```bash
npm run db:push     # pushes shared/schema.ts changes to DATABASE_URL
```

---

## 3. Server setup (Ubuntu + Nginx + PM2)

```bash
# Node 20 (matches the Replit nodejs-20 module)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2

# Clone/copy the app
sudo mkdir -p /var/www/yogichem
sudo chown $USER:$USER /var/www/yogichem
git clone <your-repo-url> /var/www/yogichem
cd /var/www/yogichem

# Configure environment
cp .env.example .env
nano .env            # fill in DATABASE_URL, SESSION_SECRET, SENDGRID_*, NEXT_PUBLIC_SITE_URL
chmod 600 .env

# Install deps and build
npm install
npm run build

# Make sure the persistent upload dir survives future deploys
mkdir -p public/uploads logs

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup            # follow the printed systemd command to enable boot-start
```

`ecosystem.config.js` (added to repo root) binds Next.js to `127.0.0.1:5000` only — it's not
reachable from the internet directly, only through Nginx.

## 4. Nginx + SSL

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/yogichem
sudo ln -s /etc/nginx/sites-available/yogichem /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Point your domain's A record at the VPS IP first, then:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yogichem.co.uk -d www.yogichem.co.uk
```

Certbot rewrites the Nginx config to add the 443/SSL block and an HTTP→HTTPS redirect, and
installs a renewal timer automatically (`systemctl status certbot.timer` to confirm).

## 5. Redeploying after future changes

```bash
cd /var/www/yogichem
git pull
npm install
npm run build
pm2 restart yogichem
```

`public/uploads/` is not touched by `git pull` or `npm run build` (it's gitignored and
written at runtime), so previously uploaded product images persist across deploys.

## 6. Useful checks

```bash
pm2 logs yogichem        # app logs
pm2 status               # process health
sudo nginx -t             # validate nginx config before reload
sudo journalctl -u nginx -f
psql "$DATABASE_URL" -c "\dt"   # confirm DB connectivity from the server
```
