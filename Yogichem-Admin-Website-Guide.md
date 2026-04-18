# Yogichem — Admin & Website Guide

> This document explains how to use the Yogichem website and admin dashboard. It covers every section, every page, and every field so you can manage your store confidently.

---

## PART 1 — WEBSITE (Customer Facing)

### Website URL
```
https://yogichem.replit.app
```

---

### Pages Available on the Website

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | `/` | Main landing page with hero banner, featured products, sale items |
| Beauty | `/category/beauty` | All beauty products |
| Health | `/category/health` | All health products |
| Baby & Child | `/category/baby` | All baby & child products |
| Wellness | `/category/wellness` | All wellness products |
| Electrical | `/category/electrical` | All electrical products |
| Gifts | `/category/gifts` | All gift products |
| Sale | `/sale` | All products currently on sale |
| Offers | `/offers` | Active coupon codes + featured products |
| Product Page | `/product/[name]` | Individual product detail page |
| Search | `/search` | Search results page |
| Basket / Cart | `/cart` | Shopping basket |
| Checkout | `/checkout` | 3-step checkout (address → delivery → payment) |
| Sign In | `/login` | Customer login page |
| Register | `/register` | New customer registration |
| My Account | `/account` | Account overview |
| My Orders | `/account/orders` | Order history |
| Order Detail | `/account/orders/[id]` | Full detail for a single order |
| My Addresses | `/account/addresses` | Saved delivery addresses |
| Wishlist | `/wishlist` | Saved/wishlisted products |
| My Wallet | `/account/wallet` | Wallet balance & transaction history |
| Profile | `/account/profile` | Edit name, email, phone, password |
| Notifications | `/account/notifications` | Email & WhatsApp notification preferences |
| Account Settings | `/account/settings` | Danger zone — delete account |
| Track My Order | `/track-order` | Track an order by order number + email |
| Help & FAQs | `/help` | Frequently asked questions |
| Delivery Info | `/delivery` | Delivery options, timings, costs |
| Returns | `/returns` | Returns policy & how to return |
| Contact Us | `/contact` | Contact form + phone & email details |
| Privacy Policy | `/privacy` | Privacy policy |
| Terms & Conditions | `/terms` | Terms and conditions |
| Cookie Policy | `/cookies` | Cookie policy |

---

### How Customers Shop

1. **Browse** — Use the category menu at the top or search bar
2. **Add to Basket** — Click "Add to Basket" on any product page
3. **Checkout** — Click the basket icon → Proceed to Checkout
   - **Step 1 (Shipping):** Address auto-fills from saved address if logged in
   - **Step 2 (Delivery):** Choose Standard, Next Day, or Click & Collect
   - **Step 3 (Payment):** Enter card details or choose PayPal
4. **Order Confirmation** — Customer receives an email confirmation automatically

### Coupon Codes (Active)

| Code | Discount |
|------|----------|
| `SAVE20` | 20% off entire order |
| `WELLNESS15` | 15% off wellness products |
| `BABY15` | 15% off baby & child |
| `FREESHIP` | Free shipping on any order |
| `WELCOME10` | 10% off for new customers |

---

## PART 2 — ADMIN DASHBOARD

### Admin Login URL
```
https://yogichem.replit.app/admin/login
```

### Admin Login Credentials
| Field | Value |
|-------|-------|
| Email | `admin@yogichem.com` |
| Password | `admin123` |

> **Important:** Change this password after first login for security.

---

## Admin Sections — Full Guide

---

### 1. Dashboard
**URL:** `/admin`

This is the first page you see after logging in. It gives a snapshot of how your store is performing.

| Item | What it Shows |
|------|--------------|
| Total Revenue | Total money earned from all orders |
| Total Orders | Number of orders placed |
| Total Customers | Number of registered customers |
| Total Products | Number of products in the store |
| Sales Chart | Bar chart showing sales over time |
| Category Breakdown | Pie chart showing which categories sell most |
| Recent Orders | Latest orders with status and amount |
| Low Stock Alerts | Products that are running low on stock |

---

### 2. Products
**URL:** `/admin/products`

This is where you manage your entire product catalogue.

#### Product List Page
- **Search bar** — Search products by name
- **Add New Product** button — Opens the Add Product form
- Each product row shows: Image, Name, Price, Stock level, Status badge (Active/Inactive/Sale)
- **Edit icon** — Edit that product
- **Delete icon** — Permanently delete that product

---

#### Add New Product
**URL:** `/admin/products/new`

Fill in the following fields:

**Basic Information**
| Field | What to Enter | Required? |
|-------|--------------|-----------|
| Product Name | Full name of the product (e.g. "Rose Hip Vitamin C Serum") | Yes |
| URL Slug | Auto-generated from the name — unique web address (e.g. `rose-hip-vitamin-c-serum`) | Yes |
| Short Description | 1–2 sentence summary shown on product cards | No |
| Description | Full product description (ingredients, how to use, benefits) | No |
| SKU | Your internal stock keeping unit code | No |
| Tags | Comma-separated keywords (e.g. `vitamin c, serum, brightening`) | No |

**Pricing**
| Field | What to Enter | Required? |
|-------|--------------|-----------|
| Selling Price | The price customers pay (e.g. `9.99`) | Yes |
| Compare At Price | Original/RRP price — shows as strikethrough (e.g. `14.99`) | No |
| Cost Price | What you paid for the product | No |
| Wholesale Price | Price for wholesale customers | No |

**Stock & Category**
| Field | What to Enter | Required? |
|-------|--------------|-----------|
| Category | Select from dropdown (Beauty, Health, etc.) | Yes |
| Stock Quantity | How many units you have in stock (e.g. `50`) | Yes |
| Low Stock Threshold | Alert level — when stock falls below this, you get a warning (e.g. `10`) | Yes |

**Product Flags (Toggles)**
| Toggle | What it Does |
|--------|-------------|
| Active | Makes the product visible on the website |
| Featured | Shows on the homepage "Featured Products" section |
| On Sale | Adds a red "SALE" badge and moves it to the Sale page |
| Sale Percentage | % discount shown (e.g. `20` for 20% off) — only when "On Sale" is on |

**Images**
| Field | What to Enter |
|-------|--------------|
| Product Image | Upload a PNG, JPG, or WebP image (max 5MB). Drag & drop or click to browse. |

**SEO (Search Engine Optimisation)**
| Field | What to Enter |
|-------|--------------|
| Meta Title | Page title for Google (e.g. "Rose Hip Vitamin C Serum — Yogichem") |
| Meta Description | Short description for Google results (max 160 characters) |

Click **Save Product** when done.

---

#### Edit Product
**URL:** `/admin/products/[product-id]`

Same fields as Add New Product. All existing values are pre-filled. Make changes and click **Save Changes**.

---

### 3. Categories
**URL:** `/admin/categories`

Manage the product categories shown in the navigation menu.

#### Category List
- Shows all categories with their image, name, and number of products
- **Add New Category** button
- **Edit** and **Delete** buttons on each row

#### Add / Edit Category Fields
| Field | What to Enter | Required? |
|-------|--------------|-----------|
| Category Name | e.g. "Beauty", "Wellness" | Yes |
| URL Slug | Auto-generated URL path (e.g. `beauty`) | Yes |
| Description | Short description of the category | No |
| Image | Upload a category banner or icon image | No |
| Parent Category | Choose a parent to make this a sub-category (e.g. "Skincare" under "Beauty") | No |
| Active | Toggle to show/hide the category on the website | Yes |

---

### 4. Orders
**URL:** `/admin/orders`

View and manage all customer orders.

#### Order List
- **Search bar** — Search by order number or customer name
- **Status Filter** — Filter by: All, Pending, Processing, Shipped, Delivered, Cancelled
- Each row shows: Order Number, Customer Name, Date, Items, Total, Status badge

#### Updating an Order Status
Click on an order to expand it, then change the **Status** dropdown:

| Status | Meaning |
|--------|---------|
| Pending | Order placed, awaiting action |
| Processing | Order is being packed/prepared |
| Shipped | Order has been dispatched |
| Delivered | Order successfully delivered |
| Cancelled | Order was cancelled |

---

### 5. Users / Customers
**URL:** `/admin/users`

View all registered customers.

| Column | What it Shows |
|--------|--------------|
| Name | Customer's full name |
| Email | Registered email address |
| Phone | Phone number from profile |
| Joined | Date they registered |
| Orders | Number of orders placed |
| Total Spent | Total lifetime spend |
| Wholesaler | Whether they have wholesale pricing |

- **Toggle Wholesaler** — Enable/disable wholesale pricing for a customer
- **View Details** — See full customer information

---

### 6. Promotions (Coupon Codes)
**URL:** `/admin/promotions`

Create and manage discount coupon codes.

#### Coupon List
Shows all coupons with: Code, Type (%), Value, Minimum Order, Usage Limit, Status (Active/Inactive)

#### Add / Edit Coupon Fields
| Field | What to Enter | Required? |
|-------|--------------|-----------|
| Coupon Code | The code customers type at checkout (e.g. `SAVE20`) — must be uppercase, no spaces | Yes |
| Discount Type | **Percentage** (e.g. 20% off) or **Fixed Amount** (e.g. £5 off) | Yes |
| Discount Value | The amount — e.g. `20` for 20% or `5` for £5 | Yes |
| Minimum Order Amount | Minimum basket value to use the code (e.g. `15.00`) — leave blank for no minimum | No |
| Usage Limit | Maximum number of times the code can be used in total (e.g. `100`) | No |
| Active | Toggle on/off to enable or disable the coupon | Yes |

---

### 7. Shipping
**URL:** `/admin/shipping`

Set up delivery costs and rules for each country you ship to.

#### Shipping Rules List
Shows each country with: Flag, Country Name, Standard Cost, Free Shipping Threshold, Next Day availability

#### Add / Edit Shipping Rule Fields
| Field | What to Enter | Required? |
|-------|--------------|-----------|
| Country Name | Full country name (e.g. "United Kingdom") | Yes |
| Country Code | 2-letter code (e.g. `GB`, `FR`, `DE`, `IE`, `US`) | Yes |
| Standard Shipping Cost | Cost in £ (e.g. `3.50`) | Yes |
| Standard Delivery Days | Estimated delivery time in days (e.g. `3`) | Yes |
| Free Shipping Threshold | Order value above which shipping is free (e.g. `25.00`) | No |
| Next Day Available | Toggle on/off — whether next day delivery is offered for this country | No |
| Next Day Cost | Cost for next day delivery (e.g. `4.95`) | No |
| Click & Collect Available | Toggle on/off — whether click & collect is available | No |

---

### 8. Suppliers
**URL:** `/admin/suppliers`

Manage your product suppliers and set up low-stock alerts.

| Feature | Description |
|---------|-------------|
| Supplier List | Name, contact email, phone, and products supplied |
| Low Stock Alerts | See which products are below their threshold |
| Auto-order | Configure automatic reorder emails when stock runs low |

---

### 9. Email Campaigns
**URL:** `/admin/email`

Send marketing emails to your customers.

| Field | What to Enter |
|-------|--------------|
| Campaign Name | Internal name for this email campaign |
| Subject Line | Email subject customers will see |
| Target Audience | All Customers, New Customers, Loyal Customers, etc. |
| Email Body | Write the message (supports HTML formatting) |
| Schedule | Send now or schedule for a future date/time |

---

### 10. WhatsApp Broadcasts
**URL:** `/admin/whatsapp`

Send WhatsApp messages to customers who have opted in.

| Field | What to Enter |
|-------|--------------|
| Message | The WhatsApp message to send |
| Target Group | All opted-in customers or a specific segment |
| Schedule | Send now or schedule |

---

### 11. Analytics
**URL:** `/admin/analytics`

Visual reports on your store's performance.

| Chart | What it Shows |
|-------|--------------|
| Sales Over Time | Revenue trend over days/weeks/months |
| Orders Over Time | Number of orders trend |
| Category Breakdown | Which categories generate the most revenue |
| Top Products | Best-selling products by quantity and revenue |
| Customer Growth | New customer registrations over time |

Use the **date range selector** at the top to filter by time period.

---

### 12. Settings
**URL:** `/admin/settings`

Configure global store settings.

**Store Information**
| Field | What to Enter |
|-------|--------------|
| Store Name | Your store name (e.g. `Yogichem`) |
| Contact Email | Main store email (e.g. `help@yogichem.com`) |
| Phone Number | Store contact number |
| Currency | Currently set to GBP (£) |
| Timezone | Currently set to Europe/London |

**Order Settings**
| Field | What to Enter |
|-------|--------------|
| Minimum Order Amount | Lowest amount a customer can order (e.g. `10.00`) |
| Free Shipping Threshold | Orders above this value get free shipping (e.g. `25.00`) |
| Next Day Cut-off Hour | Orders placed before this time get next day delivery (e.g. `14` = 2PM) |

**Feature Toggles**
| Toggle | What it Does |
|--------|-------------|
| Enable Email Notifications | Turns on/off order confirmation emails to customers |
| Enable WhatsApp | Turns on/off WhatsApp messaging integration |
| Maintenance Mode | Takes the website offline for maintenance — customers see a "coming soon" page |

---

## PART 3 — ORDER EMAILS

Every time a customer places an order:

1. **Customer receives** a branded order confirmation email with:
   - Order number
   - List of items ordered
   - Delivery address
   - Delivery method chosen
   - Subtotal, shipping cost, discount, and total
   - Link to view their order

2. **Admin receives** a copy (BCC) of the same email so you're always notified of new orders.

**Email sent from:** `keyursuhani1530@gmail.com`
**Admin copy sent to:** `keyursuhani1530@gmail.com`

> To change the admin notification email, update `ADMIN_EMAIL` in the Replit Secrets panel.

---

## PART 4 — QUICK REFERENCE

### Important URLs

| Purpose | URL |
|---------|-----|
| Website Homepage | `https://yogichem.replit.app` |
| Admin Dashboard | `https://yogichem.replit.app/admin` |
| Admin Login | `https://yogichem.replit.app/admin/login` |

### Admin Login
| | |
|--|--|
| Email | `admin@yogichem.com` |
| Password | `admin123` |

### Adding a New Product (Quick Steps)
1. Go to **Admin → Products → Add New Product**
2. Enter **Name**, **Price**, **Category**, **Stock**
3. Upload a **Product Image**
4. Toggle **Active** to ON
5. Toggle **Featured** if you want it on the homepage
6. Toggle **On Sale** + enter **Sale %** if it's discounted
7. Click **Save Product**

### Creating a Coupon (Quick Steps)
1. Go to **Admin → Promotions → Add Coupon**
2. Enter a **Code** (e.g. `SUMMER25`)
3. Choose **Type**: Percentage or Fixed
4. Enter **Value** (e.g. `25`)
5. Set **Minimum Order** if needed
6. Toggle **Active** to ON
7. Click **Save**

---

*Document prepared for Yogichem — April 2025*
