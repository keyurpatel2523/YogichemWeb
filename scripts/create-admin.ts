import './load-env';
import bcrypt from 'bcryptjs';
import { db } from '../server/db';
import { adminUsers } from '../shared/schema';
import { validatePassword } from '../src/lib/password';

async function createAdmin() {
  const email = process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  const name = process.env.ADMIN_INITIAL_NAME?.trim() || 'Store Admin';

  if (!email || !password) {
    console.error('Set ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD. No admin was created.');
    process.exit(1);
  }

  const passwordError = validatePassword(password, { minLength: 12 });
  if (passwordError) {
    console.error(passwordError);
    process.exit(1);
  }

  const existing = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
  if (existing.length > 0) {
    console.error('An admin account already exists. No changes were made.');
    process.exit(1);
  }

  await db.insert(adminUsers).values({
    email,
    password: await bcrypt.hash(password, 12),
    name,
    role: 'admin',
  });

  console.log(`Admin created for ${email}.`);
  process.exit(0);
}

createAdmin().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Failed to create admin');
  process.exit(1);
});
