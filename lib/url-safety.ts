export function publicUrl(value: unknown): URL | null {
  if (typeof value !== 'string' || value.length > 2048 || /[\u0000-\u0020\u007f]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    if (url.port && url.port !== (url.protocol === 'https:' ? '443' : '80')) return null;
    const host = url.hostname.toLowerCase();
    if (!host.includes('.') || /[:\[\]]/.test(host) || /^[\d.]+$/.test(host)) return null;
    if (/(?:^|\.)(?:localhost|local|internal|invalid|test|example|onion)$/.test(host) || host.endsWith('.')) return null;
    return url;
  } catch { return null; }
}
/** Preserve article IDs and version parameters; remove only tracking. */
export function canonicalUrl(value: string): string {
  const url = publicUrl(value);
  if (!url) return '';
  url.hash = '';
  for (const key of [...url.searchParams.keys()]) {
    if (/^(?:utm_.+|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid)$/i.test(key)) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  return url.toString();
}
export function sameHostFamily(host: string, approved: string): boolean {
  return host === approved || host === 'www.' + approved || 'www.' + host === approved;
}
