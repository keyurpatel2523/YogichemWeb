# BootsShop - eCommerce Platform

A fully-featured, database-driven eCommerce platform inspired by Boots.com, built with Next.js 14, PostgreSQL, and Drizzle ORM.

## Overview

This project is a complete health and beauty eCommerce solution with a customer-facing storefront and comprehensive admin dashboard. It features a Boots-inspired aesthetic with professional blue (#003DA5) color scheme.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: Zustand (cart, wishlist, compare, user)
- **UI Components**: Radix UI, Lucide icons
- **Charts**: Recharts
- **Authentication**: JWT with bcryptjs

## Project Structure

```
src/
├── app/
│   ├── (routes)/          # Customer pages
│   │   ├── page.tsx       # Homepage
│   │   ├── login/         # Auth pages
│   │   ├── register/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── wishlist/
│   │   ├── account/
│   │   ├── sale/
│   │   ├── category/[slug]/
│   │   └── product/[slug]/
│   ├── admin/             # Admin dashboard
│   │   ├── page.tsx       # Dashboard
│   │   ├── products/
│   │   ├── orders/
│   │   ├── users/
│   │   ├── promotions/
│   │   ├── shipping/
│   │   ├── suppliers/
│   │   ├── email/
│   │   ├── whatsapp/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/               # API routes
│   │   ├── products/
│   │   ├── categories/
│   │   ├── auth/
│   │   └── coupons/
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx
├── components/
│   ├── layout/            # Header, Footer
│   ├── home/              # Hero, Categories, Featured
│   ├── product/           # ProductCard
│   └── ui/                # shadcn components
├── lib/
│   ├── store.ts           # Zustand stores
│   └── utils.ts           # Utilities
shared/
├── schema.ts              # Drizzle schema (20+ tables)
server/
├── db.ts                  # Database connection
scripts/
├── seed.ts                # Database seeder
```

## Features

### Customer Storefront
- **Homepage**: Hero carousel, category grid, featured products, promotions
- **Product Pages**: Gallery, variants, wishlist, compare, stock status
- **Shopping**: Cart, coupon validation, checkout (3-step)
- **User Account**: Profile, orders, wishlist, wallet, addresses
- **Delivery**: Next-day delivery (before 2PM), click & collect, free shipping over £25

### Admin Dashboard
- **Dashboard**: Stats overview, charts, recent orders
- **Products**: CRUD, stock management, images
- **Orders**: Status tracking, filters
- **Users**: Customer management, wholesaler status
- **Promotions**: Coupons, promotional campaigns
- **Shipping**: Country-specific rules, next-day settings
- **Suppliers**: Low-stock alerts, auto-ordering
- **Marketing**: Email campaigns, WhatsApp broadcasts
- **Analytics**: Sales trends, category breakdown, top products
- **Settings**: Store configuration

## Database Schema

Key tables:
- users, addresses, orders, orderItems
- products, productImages, productVariants
- categories, brands, suppliers
- coupons, promotions, wishlists
- walletTransactions, notifications
- shippingRules, adminUsers

## Running the Project

```bash
# Development
npm run dev

# Database
npm run db:push      # Push schema changes
npm run db:seed      # Seed sample data
npm run db:studio    # Open Drizzle Studio
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (auto-configured)
- `SESSION_SECRET` - JWT secret for auth

## Sample Data

The seeder creates:
- Categories: Beauty, Health, Baby & Child, Wellness, Electrical, Gifts
- 16 sample products with images
- Shipping rules for UK, Ireland, France, Germany, US
- Coupon codes: SAVE20, WELLNESS15, BABY15, FREESHIP, WELCOME10
- Admin user: admin@bootsshop.com / admin123

## Recent Changes

- Fixed Server Component error (removed onContextMenu from body)
- Created complete customer storefront
- Built admin dashboard with 11 management modules
- Implemented cart, wishlist, compare functionality
- Added comprehensive API routes:
  - Products (list, detail)
  - Categories
  - Auth (login, register with JWT)
  - Orders (create, list user orders)
  - Coupons validation
  - Admin APIs: orders, products, users, coupons, shipping, stats
- Checkout properly creates orders in the database
- JWT auth with proper token verification
- Database seeded with sample data

## Color Palette

- Primary Blue: #003DA5
- Navy: #1A1A3E
- Teal: #00A19A
- Red: #E31837
- Green: #00A550
- Orange: #FF6B00
