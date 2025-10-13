// Local storage-based auth state for the gateway
// Mirrors the token/user handling of the mobile app, adapted for web

export type StoredUser = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
};

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'tamu_access_token',
  REFRESH_TOKEN: 'tamu_refresh_token',
  USER_DATA: 'tamu_user_data',
};

export const authLocal = {
  getAccessToken(): string | null {
    try { return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN); } catch { return null; }
  },
  getRefreshToken(): string | null {
    try { return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN); } catch { return null; }
  },
  getUser(): StoredUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  async setTokens(accessToken: string, refreshToken: string) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      authBus.emit('tokens', { accessToken, refreshToken });
    } catch { /* noop */ }
  },
  async setUser(user: StoredUser | null) {
    try {
      if (user) localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      authBus.emit('user', user);
    } catch { /* noop */ }
  },
  async clear() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      authBus.emit('logout');
    } catch { /* noop */ }
  }
};

// Tiny event bus so components can react to auth changes
export type AuthEvent = 'tokens' | 'user' | 'login' | 'logout' | 'refresh';

type Subscriber = (payload?: any) => void;

class AuthBus {
  private subs: Map<AuthEvent, Set<Subscriber>> = new Map();

  subscribe(event: AuthEvent, fn: Subscriber) {
    if (!this.subs.has(event)) this.subs.set(event, new Set());
    this.subs.get(event)!.add(fn);
    return () => this.unsubscribe(event, fn);
  }

  unsubscribe(event: AuthEvent, fn: Subscriber) {
    this.subs.get(event)?.delete(fn);
  }

  emit(event: AuthEvent, payload?: any) {
    this.subs.get(event)?.forEach((fn) => {
      try { fn(payload); } catch { /* noop */ }
    });
  }
}

export const authBus = new AuthBus();
