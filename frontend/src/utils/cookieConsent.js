/**
 * Cookie-consent state. Analytics (GA4 / Meta Pixel) must only be initialised
 * once `hasAnalyticsConsent()` is true — see
 * docs/specs/10-legal-and-compliance.md §13.3.
 */
export const COOKIE_CONSENT_KEY = 'cookie-consent';

export function readConsent() {
  try {
    return window.localStorage.getItem(COOKIE_CONSENT_KEY);
  } catch {
    // Storage unavailable (private mode) — treat as "already answered" so the
    // banner does not reappear on every page.
    return 'unavailable';
  }
}

export function hasAnalyticsConsent() {
  return readConsent() === 'accepted';
}

export function storeConsent(choice) {
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {
    /* ignore — the banner simply reappears next visit */
  }
}
