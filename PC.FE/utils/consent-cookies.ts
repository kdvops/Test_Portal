export type ConsentValue = 'accepted' | 'rejected' | null;

const COOKIE_NAME = 'app_cookie_consent';

function setCookie(name: string, value: string, days = 180) {
  try {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
  } catch {}
}

function getCookie(name: string): string | null {
  try {
    const prefix = `${name}=`;
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith(prefix))
      ?.substring(prefix.length) ?? null;
  } catch { return null; }
}

export function getConsent(): ConsentValue {
  if (typeof window === 'undefined') return null;
  const cookie = getCookie(COOKIE_NAME);
  if (cookie === 'accepted' || cookie === 'rejected') return cookie;
  try {
    const ls = localStorage.getItem(COOKIE_NAME);
    if (ls === 'accepted' || ls === 'rejected') return ls;
  } catch {}
  return null;
}

export function setConsent(val: Exclude<ConsentValue, null>, days = 180) {
  if (typeof window === 'undefined') return;
  setCookie(COOKIE_NAME, val, days);
  try { localStorage.setItem(COOKIE_NAME, val); } catch {}
}

export function clearConsent() {
  if (typeof window === 'undefined') return;
  setCookie(COOKIE_NAME, '', -1);
  try { localStorage.removeItem(COOKIE_NAME); } catch {}
}
