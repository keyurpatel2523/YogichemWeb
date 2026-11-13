import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { safeRedirectPath } from './redirect';

describe('safeRedirectPath', () => {
  it('allows internal paths and rejects external targets', () => {
    assert.equal(safeRedirectPath('/checkout', '/account'), '/checkout');
    assert.equal(safeRedirectPath('https://evil.example', '/account'), '/account');
    assert.equal(safeRedirectPath('//evil.example', '/account'), '/account');
    assert.equal(safeRedirectPath(null, '/account'), '/account');
  });
});
