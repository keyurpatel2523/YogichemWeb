import { db } from '../server/db';
import { categories, products, productImages, promotions, shippingRules, coupons, adminUsers } from '../shared/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  await db.insert(adminUsers).values({
    email: 'admin@bootsshop.com',
    password: hashedPassword,
    name: 'Admin User',
    role: 'admin',
  }).onConflictDoNothing();

  const categoryData = [
    { name: 'Beauty', slug: 'beauty', description: 'Beauty products and cosmetics', sortOrder: 1 },
    { name: 'Health', slug: 'health', description: 'Health and pharmacy products', sortOrder: 2 },
    { name: 'Baby & Child', slug: 'baby', description: 'Baby and child products', sortOrder: 3 },
    { name: 'Wellness', slug: 'wellness', description: 'Wellness and supplements', sortOrder: 4 },
    { name: 'Electrical', slug: 'electrical', description: 'Electrical beauty devices', sortOrder: 5 },
    { name: 'Gifts', slug: 'gifts', description: 'Gift sets and ideas', sortOrder: 6 },
  ];

  for (const cat of categoryData) {
    await db.insert(categories).values(cat).onConflictDoNothing();
  }

  const cats = await db.select().from(categories);
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));

  const productData = [
    { name: 'No7 Lift & Luminate Triple Action Serum', slug: 'no7-lift-luminate-serum', price: '34.95', compareAtPrice: '44.95', categoryId: catMap['beauty'], stock: 50, isFeatured: true, isOnSale: true, salePercentage: 22, description: 'Advanced anti-aging serum for visibly firmer, brighter skin.' },
    { name: 'Dyson Supersonic Hair Dryer', slug: 'dyson-supersonic-hair-dryer', price: '329.99', categoryId: catMap['electrical'], stock: 15, isFeatured: true, description: 'Fast drying with intelligent heat control.' },
    { name: 'Vitamin D 1000IU Tablets', slug: 'vitamin-d-1000iu-tablets', price: '8.99', compareAtPrice: '12.99', categoryId: catMap['wellness'], stock: 200, isOnSale: true, salePercentage: 31, description: '180 tablets for bone and immune health.' },
    { name: 'Pampers Baby-Dry Nappies Size 4', slug: 'pampers-baby-dry-size-4', price: '12.00', categoryId: catMap['baby'], stock: 100, isFeatured: true, description: 'Up to 12 hours of overnight dryness.' },
    { name: 'Sol de Janeiro Brazilian Bum Bum Cream', slug: 'sol-de-janeiro-bum-bum-cream', price: '48.00', categoryId: catMap['beauty'], stock: 30, isFeatured: true, description: 'Luxuriously rich body cream with Brazilian Bum Bum scent.' },
    { name: 'Oral-B iO Series 9 Electric Toothbrush', slug: 'oral-b-io-series-9', price: '299.99', compareAtPrice: '449.99', categoryId: catMap['electrical'], stock: 20, isOnSale: true, salePercentage: 33, description: 'Revolutionary magnetic iO technology.' },
    { name: 'CeraVe Moisturising Cream 454g', slug: 'cerave-moisturising-cream', price: '16.00', categoryId: catMap['beauty'], stock: 80, isFeatured: true, description: 'Developed with dermatologists for dry skin.' },
    { name: 'Boots Paracetamol 500mg 16 Tablets', slug: 'boots-paracetamol-500mg', price: '0.39', categoryId: catMap['health'], stock: 500, description: 'For relief of mild to moderate pain.' },
    { name: 'Chanel No.5 Eau de Parfum 50ml', slug: 'chanel-no5-edp-50ml', price: '99.00', categoryId: catMap['beauty'], stock: 25, isFeatured: true, description: 'The iconic floral aldehyde fragrance.' },
    { name: 'Aptamil First Infant Milk 800g', slug: 'aptamil-first-infant-milk', price: '14.50', categoryId: catMap['baby'], stock: 60, description: 'Nutritionally complete formula from birth.' },
    { name: 'Philips Lumea IPL Hair Removal', slug: 'philips-lumea-ipl', price: '449.99', compareAtPrice: '549.99', categoryId: catMap['electrical'], stock: 10, isOnSale: true, salePercentage: 18, description: 'Professional IPL hair removal at home.' },
    { name: 'The Ordinary Niacinamide 10% + Zinc 1%', slug: 'the-ordinary-niacinamide', price: '5.90', categoryId: catMap['beauty'], stock: 150, isFeatured: true, description: 'High-strength vitamin and mineral formula.' },
    { name: 'Boots Multivitamins A-Z 180 Tablets', slug: 'boots-multivitamins-a-z', price: '7.49', compareAtPrice: '9.99', categoryId: catMap['wellness'], stock: 120, isOnSale: true, salePercentage: 25, description: 'Complete daily multivitamin support.' },
    { name: 'Jo Malone London Peony & Blush Suede', slug: 'jo-malone-peony-blush-suede', price: '115.00', categoryId: catMap['beauty'], stock: 18, isFeatured: true, description: 'The essence of charm with peonies in bloom.' },
    { name: 'Sudocrem Antiseptic Healing Cream 400g', slug: 'sudocrem-healing-cream-400g', price: '8.49', categoryId: catMap['baby'], stock: 90, description: 'Clinically proven to soothe and heal.' },
    { name: 'GHD Platinum+ Smart Styler', slug: 'ghd-platinum-plus', price: '239.00', categoryId: catMap['electrical'], stock: 22, isFeatured: true, description: 'Ultra-zone predictive technology for healthier styling.' },
  ];

  for (const prod of productData) {
    await db.insert(products).values(prod).onConflictDoNothing();
  }

  const prods = await db.select().from(products);
  
  const imageUrls = [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600',
    'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600',
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
    'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600',
    'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600',
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=600',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600',
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600',
    'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600',
  ];

  for (let i = 0; i < prods.length; i++) {
    await db.insert(productImages).values({
      productId: prods[i].id,
      url: imageUrls[i % imageUrls.length],
      isPrimary: true,
      sortOrder: 0,
    }).onConflictDoNothing();
  }

  await db.insert(shippingRules).values([
    { country: 'United Kingdom', countryCode: 'GB', standardShippingCost: '3.50', standardDeliveryDays: 3, freeShippingThreshold: '25.00', nextDayAvailable: true, nextDayCost: '4.95', nextDayCutoffHour: 14, clickCollectAvailable: true },
    { country: 'Ireland', countryCode: 'IE', standardShippingCost: '5.99', standardDeliveryDays: 5, freeShippingThreshold: '50.00', nextDayAvailable: false, clickCollectAvailable: false },
    { country: 'France', countryCode: 'FR', standardShippingCost: '7.99', standardDeliveryDays: 7, freeShippingThreshold: '75.00', nextDayAvailable: false },
    { country: 'Germany', countryCode: 'DE', standardShippingCost: '7.99', standardDeliveryDays: 7, freeShippingThreshold: '75.00', nextDayAvailable: false },
    { country: 'United States', countryCode: 'US', standardShippingCost: '12.99', standardDeliveryDays: 14, freeShippingThreshold: '100.00', nextDayAvailable: false },
  ]).onConflictDoNothing();

  await db.insert(coupons).values([
    { code: 'SAVE20', type: 'percentage', value: '20', minOrderAmount: '30.00', isActive: true },
    { code: 'WELLNESS15', type: 'percentage', value: '15', minOrderAmount: '20.00', isActive: true },
    { code: 'BABY15', type: 'percentage', value: '15', minOrderAmount: '40.00', isActive: true },
    { code: 'FREESHIP', type: 'fixed', value: '3.50', minOrderAmount: '15.00', isActive: true },
    { code: 'WELCOME10', type: 'percentage', value: '10', isActive: true, usageLimit: 1 },
  ]).onConflictDoNothing();

  await db.insert(promotions).values([
    { name: 'Big Boots Sale', description: 'Save up to 50% on beauty, healthcare & more', type: 'banner', isActive: true, priority: 1 },
    { name: 'Valentine\'s Day', description: 'Share the love with great gifts', type: 'event', isActive: true, priority: 2 },
    { name: 'Wellness Week', description: 'Save 15% on wellness products', type: 'weekly', isActive: true, priority: 3 },
  ]).onConflictDoNothing();

  console.log('Database seeded successfully!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed error:', error);
  process.exit(1);
});
