export interface GoogleUserProfile {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
export const GOOGLE_LOGIN_PATH = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_PATH ?? '/auth/google';

/**
 * Retrieves configured Google Client ID from environment or localStorage.
 */
export function getStoredGoogleClientId(): string {
  if (typeof window === 'undefined') return '';
  return (
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    localStorage.getItem('google_client_id') ||
    ''
  );
}

/**
 * Saves custom Google Client ID into localStorage for persistence.
 */
export function setStoredGoogleClientId(clientId: string): void {
  if (typeof window === 'undefined') return;
  if (clientId.trim()) {
    localStorage.setItem('google_client_id', clientId.trim());
  } else {
    localStorage.removeItem('google_client_id');
  }
}

/**
 * Safely decodes a Google JWT id_token without external dependencies.
 */
export function parseGoogleJwt(token: string): GoogleUserProfile | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing Google JWT:', e);
    return null;
  }
}

/**
 * Stores Google user session in localStorage.
 */
export function saveGoogleUserSession(token: string, user?: GoogleUserProfile | null) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  if (user) {
    localStorage.setItem('google_user', JSON.stringify(user));
  }
}

/**
 * Retrieves the stored Google user profile, if available.
 */
export function getStoredGoogleUser(): GoogleUserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('google_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Builds standard Google OAuth 2.0 authorization URL.
 */
export function buildGoogleOAuthUrl(clientId: string, redirectUri: string): string {
  const scope = encodeURIComponent('openid email profile');
  const nonce = Math.random().toString(36).substring(2);
  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token%20id_token&scope=${scope}&nonce=${nonce}&prompt=select_account`;
}
