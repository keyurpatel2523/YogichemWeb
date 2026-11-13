const ALLOWED_TAGS = new Set([
  'a', 'b', 'blockquote', 'br', 'em', 'h1', 'h2', 'h3', 'h4', 'hr', 'i', 'li', 'ol', 'p', 'strong', 'u', 'ul',
]);

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, '&');
}

function sanitizeUrl(url: string): string | null {
  const trimmed = url.trim().replace(/[\u0000-\u001F\s]+/g, '');
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  return null;
}

function sanitizeTag(tag: string): string {
  const match = tag.match(/^<\s*(\/?)([a-zA-Z0-9]+)/);
  if (!match) return '';
  const closing = match[1] === '/';
  const name = match[2].toLowerCase();
  if (!ALLOWED_TAGS.has(name)) return '';
  if (closing) return `</${name}>`;
  if (name === 'br' || name === 'hr') return `<${name}>`;

  if (name === 'a') {
    const hrefMatch = tag.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
    const href = sanitizeUrl(hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3] || '');
    if (!href) return '<a>';
    return `<a href="${href.replace(/"/g, '')}" rel="noopener noreferrer">`;
  }
  return `<${name}>`;
}

export function sanitizeCampaignHtml(input: string): string {
  const withoutDangerousBlocks = input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const escapedText = withoutDangerousBlocks
    .replace(/</g, '\u0000TAG')
    .replace(/>/g, '\u0000END');

  return escapedText.replace(/\u0000TAG([\s\S]*?)\u0000END/g, (_full, inner: string) => {
    return sanitizeTag(`<${decodeBasicEntities(inner)}>`);
  });
}
