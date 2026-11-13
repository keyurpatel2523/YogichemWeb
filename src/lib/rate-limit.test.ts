import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { clientIp, rateLimit, resetRateLimits } from './rate-limit';

describe('rateLimit', () => {
  it('blocks once the limit inside the window is reached', () => {
    resetRateLimits();
    assert.equal(rateLimit('login:1', 2, 60_000, 1_000).ok, true);
    assert.equal(rateLimit('login:1', 2, 60_000, 1_100).ok, true);
    const blocked = rateLimit('login:1', 2, 60_000, 1_200);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.ok(blocked.retryAfterSeconds > 0);
    assert.equal(rateLimit('login:1', 2, 60_000, 61_000).ok, true);
  });
});

describe('clientIp', () => {
  it('uses the first forwarded address', () => {
    const headers = new Headers({ 'x-forwarded-for': '203.0.113.5, 10.0.0.1' });
    assert.equal(clientIp({ headers }), '203.0.113.5');
  });
});
