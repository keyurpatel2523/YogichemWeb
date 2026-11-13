export const CUSTOMER_COOKIE = 'yc_customer';
export const ADMIN_COOKIE = 'yc_admin';

export const CUSTOMER_MAX_AGE = 60 * 60 * 24 * 7;
export const ADMIN_MAX_AGE = 60 * 60 * 8;

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}
