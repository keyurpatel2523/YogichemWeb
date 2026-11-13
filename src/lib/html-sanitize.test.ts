import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { sanitizeCampaignHtml } from './html-sanitize';

describe('sanitizeCampaignHtml', () => {
  it('keeps simple formatting and safe links', () => {
    const clean = sanitizeCampaignHtml('<p>Hello <strong>there</strong></p><a href="https://yogichem.co.uk/sale">Sale</a>');
    assert.match(clean, /<p>/);
    assert.match(clean, /<strong>/);
    assert.match(clean, /href="https:\/\/yogichem\.co\.uk\/sale"/);
  });

  it('removes scripts, event handlers, and javascript urls', () => {
    const clean = sanitizeCampaignHtml(
      '<p onclick="alert(1)">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">x</a><img src=x onerror=alert(1)>',
    );
    assert.equal(clean.includes('script'), false);
    assert.equal(clean.includes('onclick'), false);
    assert.equal(clean.includes('javascript:'), false);
    assert.equal(clean.includes('<img'), false);
    assert.match(clean, /<p>Hi<\/p>/);
  });
});
