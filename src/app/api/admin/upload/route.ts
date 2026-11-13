import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { requireAdmin } from '@/lib/admin-auth';
import { clientIp, rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

function extensionFor(file: File): string | null {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName === 'jpg' || fromName === 'jpeg' || fromName === 'png' || fromName === 'webp') {
    return fromName === 'jpeg' ? 'jpg' : fromName;
  }
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  if (file.type === 'image/jpeg') return 'jpg';
  return null;
}

export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  const limit = rateLimit(`upload:${clientIp(request)}`, 30, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = extensionFor(file);
    if (!ext) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG and WebP are allowed.' },
        { status: 400 },
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 },
      );
    }

    const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`products/${filename}`, bytes, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
        contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      });
      return NextResponse.json({ url: blob.url });
    }

    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Image storage is not configured. Set BLOB_READ_WRITE_TOKEN.' },
        { status: 503 },
      );
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(uploadDir, filename), bytes);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error('Upload error:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
