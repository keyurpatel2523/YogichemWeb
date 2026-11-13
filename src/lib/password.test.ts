import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { validatePassword } from './password';

describe('validatePassword', () => {
  it('rejects missing, short, long, and letter-only passwords', () => {
    const short = validatePassword('short1');
    const long = validatePassword(`${'a'.repeat(73)}1`);
    const letters = validatePassword('longpassword');
    const digits = validatePassword('12345678');
    assert.equal(validatePassword(''), 'Password is required');
    assert.ok(short && /at least 8/.test(short));
    assert.ok(long && /at most 72/.test(long));
    assert.ok(letters && /letter and a number/.test(letters));
    assert.ok(digits && /letter and a number/.test(digits));
  });

  it('accepts a normal password and a longer admin password policy', () => {
    assert.equal(validatePassword('correcthorsebattery1'), null);
    const adminShort = validatePassword('shortpass1', { minLength: 12 });
    assert.ok(adminShort && /at least 12/.test(adminShort));
    assert.equal(validatePassword('long-enough-pass1', { minLength: 12 }), null);
  });
});
