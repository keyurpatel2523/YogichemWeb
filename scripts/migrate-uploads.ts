/**
 * Copy files in public/uploads to Vercel Blob and point matching database URLs at the new files.
 *
 * Dry run (default): prints the mapping and changes nothing.
 * Apply: npx tsx scripts/migrate-uploads.ts --apply
 *
 * Requires DATABASE_URL and BLOB_READ_WRITE_TOKEN. Does not delete local files or database rows.
 */
import './load-env';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { put } from '@vercel/blob';
import { eq } from 'drizzle-orm';
import { db } from '../server/db';
import { categories, productImages, promotions } from '../shared/schema';

const apply = process.argv.includes('--apply');

function localName(url: string): string | null {
  if (!url.startsWith('/uploads/')) return null;
  const name = url.slice('/uploads/'.length);
  if (!name || name.includes('/') || name.includes('..')) return null;
  return name;
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Set BLOB_READ_WRITE_TOKEN. Nothing was changed.');
    process.exit(1);
  }

  const uploadDir = join(process.cwd(), 'public', 'uploads');
  let files: string[] = [];
  try {
    files = await readdir(uploadDir);
  } catch {
    console.error(`No readable directory at ${uploadDir}. Nothing was changed.`);
    process.exit(1);
  }

  const images = await db.select().from(productImages);
  const cats = await db.select().from(categories);
  const promos = await db.select().from(promotions);
  const referenced = new Set<string>();
  for (const row of images) {
    const name = localName(row.url);
    if (name) referenced.add(name);
  }
  for (const row of cats) {
    const name = row.image ? localName(row.image) : null;
    if (name) referenced.add(name);
  }
  for (const row of promos) {
    const name = row.bannerImage ? localName(row.bannerImage) : null;
    if (name) referenced.add(name);
  }

  console.log(`${apply ? 'Applying' : 'Dry run'}: ${referenced.size} database URL(s) point at /uploads/.`);

  for (const name of Array.from(referenced)) {
    if (!files.includes(name)) {
      console.log(`MISSING local file, left unchanged: /uploads/${name}`);
      continue;
    }
    if (!apply) {
      console.log(`Would upload public/uploads/${name}`);
      continue;
    }

    const body = await readFile(join(uploadDir, name));
    const blob = await put(`products/${name}`, body, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    const from = `/uploads/${name}`;

    await db.update(productImages).set({ url: blob.url }).where(eq(productImages.url, from));
    await db.update(categories).set({ image: blob.url }).where(eq(categories.image, from));
    await db.update(promotions).set({ bannerImage: blob.url }).where(eq(promotions.bannerImage, from));
    console.log(`Uploaded ${from} -> ${blob.url}`);
  }

  if (!apply) {
    console.log('Dry run only. Re-run with --apply to write. Local files were not deleted.');
  } else {
    console.log('Done. Local files were left in place.');
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Migration failed');
  process.exit(1);
});
