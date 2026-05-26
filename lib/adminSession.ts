/**
 * Admin session management with expiration
 * Provides secure session handling with automatic expiration
 */

const SESSION_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const SESSION_KEY = 'admin_session_expires';

/**
 * Create a new admin session with expiration timestamp
 */
export function createAdminSession(): number {
  const expiresAt = Date.now() + SESSION_DURATION;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, expiresAt.toString());
  }
  return expiresAt;
}

/**
 * Check if admin session is valid (not expired)
 */
export function isAdminSessionValid(): boolean {
  if (typeof window === 'undefined') return false;
  
  const expiresAtStr = sessionStorage.getItem(SESSION_KEY);
  if (!expiresAtStr) return false;
  
  const expiresAt = parseInt(expiresAtStr, 10);
  const now = Date.now();
  
  if (now >= expiresAt) {
    // Session expired - clear it
    clearAdminSession();
    return false;
  }
  
  return true;
}

/**
 * Clear admin session
 */
export function clearAdminSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem('admin_authenticated');
    sessionStorage.removeItem('admin_password');
  }
}

/**
 * Get time remaining in session (in milliseconds)
 */
export function getSessionTimeRemaining(): number {
  if (typeof window === 'undefined') return 0;
  
  const expiresAtStr = sessionStorage.getItem(SESSION_KEY);
  if (!expiresAtStr) return 0;
  
  const expiresAt = parseInt(expiresAtStr, 10);
  const now = Date.now();
  const remaining = expiresAt - now;
  
  return remaining > 0 ? remaining : 0;
}

/**
 * Format time remaining as human-readable string
 */
export function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

