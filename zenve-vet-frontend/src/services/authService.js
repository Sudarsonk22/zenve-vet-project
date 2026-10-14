// Thin bridge to the EXISTING authentication of the app.
// The project zip contained no login system, so this assumes the JWT is kept in
// localStorage under VITE_AUTH_TOKEN_KEY. If your login stores it elsewhere,
// change getToken() / clearToken() only.
const TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

export const SESSION_EXPIRED_EVENT = 'zenve:session-expired';

// Called by apiClient when the backend answers 401.
export function handleSessionExpired(loginRoute) {
  clearToken();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  if (loginRoute && window.location.pathname !== loginRoute) {
    window.location.assign(loginRoute);
  }
}
