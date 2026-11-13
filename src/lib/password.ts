export interface PasswordPolicy {
  minLength?: number;
}

const DEFAULT_MIN = 8;
const MAX_LENGTH = 72;

export function validatePassword(password: unknown, policy: PasswordPolicy = {}): string | null {
  const minLength = policy.minLength ?? DEFAULT_MIN;
  if (typeof password !== 'string' || password.length === 0) {
    return 'Password is required';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  if (password.length > MAX_LENGTH) {
    return `Password must be at most ${MAX_LENGTH} characters`;
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must include a letter and a number';
  }
  return null;
}
