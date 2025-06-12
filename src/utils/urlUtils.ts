/**
 * أدوات مساعدة للتعامل مع عناوين URL
 */
export function isExternal(url?: string): boolean {
  if (!url) return false;
  try {
    const link = new URL(url, window.location.origin);
    return link.origin !== window.location.origin;
  } catch {
    return false;
  }
}
