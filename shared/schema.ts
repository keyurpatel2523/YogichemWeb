import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  birthday: timestamp('birthday'),
  isWholesaler: boolean('is_wholesaler').default(false),
  walletBalance: decimal('wallet_balance', { precision: 10, scale: 2 }).default('0.00'),
  emailNotifications: boolean('email_notifications').default(true),
  whatsappNotifications: boolean('whatsapp_notifications').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: index('users_email_idx').on(table.email),
}));

export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  image: text('image'),
  parentId: integer('parent_id'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  sku: varchar('sku', { length: 50 }).unique(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  wholesalePrice: decimal('wholesale_price', { precision: 10, scale: 2 }),
  categoryId: integer('category_id').references(() => categories.id),
  stock: integer('stock').default(0),
  lowStockThreshold: integer('low_stock_threshold').default(10),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  isOnSale: boolean('is_on_sale').default(false),
  salePercentage: integer('sale_percentage'),
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  tags: jsonb('tags').$type<string[]>(),
  specifications: jsonb('specifications').$type<Record<string, string>>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  slugIdx: index('products_slug_idx').on(table.slug),
  categoryIdx: index('products_category_idx').on(table.categoryId),
  featuredIdx: index('products_featured_idx').on(table.isFeatured),
}));

export const productImages = pgTable('product_images', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  url: text('url').notNull(),
  alt: varchar('alt', { length: 255 }),
  sortOrder: integer('sort_order').default(0),
  isPrimary: boolean('is_primary').default(false),
});

export const productVariants = pgTable('product_variants', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  sku: varchar('sku', { length: 50 }),
  price: decimal('price', { precision: 10, scale: 2 }),
  stock: integer('stock').default(0),
  attributes: jsonb('attributes').$type<Record<string, string>>(),
});

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 20 }).default('shipping'),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  address1: text('address1').notNull(),
  address2: text('address2'),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  isDefault: boolean('is_default').default(false),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }).default('0.00'),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0.00'),
  tax: decimal('tax', { precision: 10, scale: 2 }).default('0.00'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  couponCode: varchar('coupon_code', { length: 50 }),
  walletAmountUsed: decimal('wallet_amount_used', { precision: 10, scale: 2 }).default('0.00'),
  shippingAddress: jsonb('shipping_address').$type<Record<string, string>>(),
  billingAddress: jsonb('billing_address').$type<Record<string, string>>(),
  shippingMethod: varchar('shipping_method', { length: 50 }),
  paymentMethod: varchar('payment_method', { length: 50 }),
  paymentStatus: varchar('payment_status', { length: 50 }).default('pending'),
  notes: text('notes'),
  isNextDayDelivery: boolean('is_next_day_delivery').default(false),
  estimatedDelivery: timestamp('estimated_delivery'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  orderNumberIdx: index('orders_order_number_idx').on(table.orderNumber),
  userIdx: index('orders_user_idx').on(table.userId),
  statusIdx: index('orders_status_idx').on(table.status),
}));

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  variantId: integer('variant_id').references(() => productVariants.id),
  name: varchar('name', { length: 255 }).notNull(),
  sku: varchar('sku', { length: 50 }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
});

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  sessionId: varchar('session_id', { length: 100 }),
  productId: integer('product_id').references(() => products.id).notNull(),
  variantId: integer('variant_id').references(() => productVariants.id),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdx: index('cart_user_idx').on(table.userId),
  sessionIdx: index('cart_session_idx').on(table.sessionId),
}));

export const wishlistItems = pgTable('wishlist_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  priceWhenAdded: decimal('price_when_added', { precision: 10, scale: 2 }),
  notifyOnPriceDrop: boolean('notify_on_price_drop').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
  maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0),
  isActive: boolean('is_active').default(true),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  applicableCategories: jsonb('applicable_categories').$type<number[]>(),
  applicableProducts: jsonb('applicable_products').$type<number[]>(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }),
  bannerImage: text('banner_image'),
  bannerLink: text('banner_link'),
  isActive: boolean('is_active').default(true),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  priority: integer('priority').default(0),
  applicableCategories: jsonb('applicable_categories').$type<number[]>(),
  applicableProducts: jsonb('applicable_products').$type<number[]>(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  contactPerson: varchar('contact_person', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const supplierProducts = pgTable('supplier_products', {
  id: serial('id').primaryKey(),
  supplierId: integer('supplier_id').references(() => suppliers.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  supplierSku: varchar('supplier_sku', { length: 50 }),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  leadTimeDays: integer('lead_time_days'),
  minOrderQuantity: integer('min_order_quantity').default(1),
});

export const stockNotifications = pgTable('stock_notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  productId: integer('product_id').references(() => products.id).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  notificationType: varchar('notification_type', { length: 20 }).notNull(),
  isNotified: boolean('is_notified').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const shippingRules = pgTable('shipping_rules', {
  id: serial('id').primaryKey(),
  country: varchar('country', { length: 100 }).notNull(),
  countryCode: varchar('country_code', { length: 10 }).notNull(),
  standardShippingCost: decimal('standard_shipping_cost', { precision: 10, scale: 2 }).notNull(),
  standardDeliveryDays: integer('standard_delivery_days').notNull(),
  freeShippingThreshold: decimal('free_shipping_threshold', { precision: 10, scale: 2 }),
  nextDayAvailable: boolean('next_day_available').default(false),
  nextDayCost: decimal('next_day_cost', { precision: 10, scale: 2 }),
  nextDayCutoffHour: integer('next_day_cutoff_hour').default(14),
  clickCollectAvailable: boolean('click_collect_available').default(false),
  isActive: boolean('is_active').default(true),
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  orderId: integer('order_id').references(() => orders.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export const emailCampaigns = pgTable('email_campaigns', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  content: text('content').notNull(),
  status: varchar('status', { length: 50 }).default('draft'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  recipientCount: integer('recipient_count').default(0),
  openCount: integer('open_count').default(0),
  clickCount: integer('click_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const whatsappBroadcasts = pgTable('whatsapp_broadcasts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).default('draft'),
  scheduledAt: timestamp('scheduled_at'),
  sentAt: timestamp('sent_at'),
  recipientCount: integer('recipient_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  userId: integer('user_id'),
  productId: integer('product_id'),
  orderId: integer('order_id'),
  data: jsonb('data'),
  country: varchar('country', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  eventTypeIdx: index('analytics_event_type_idx').on(table.eventType),
  createdAtIdx: index('analytics_created_at_idx').on(table.createdAt),
}));

export const notificationLogs = pgTable('notification_logs', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 50 }).notNull(),
  recipient: varchar('recipient', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }),
  content: text('content'),
  status: varchar('status', { length: 50 }).notNull(),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems),
  walletTransactions: many(walletTransactions),
  stockNotifications: many(stockNotifications),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
  wishlistItems: many(wishlistItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;
export type Promotion = typeof promotions.$inferSelect;
export type ShippingRule = typeof shippingRules.$inferSelect;
