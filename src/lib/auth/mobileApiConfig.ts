// Mobile-style API config for gateway, mirroring TAMU-MOBILE-APP/lib/api/config.ts in spirit
// Focused, simplified for web usage

export type MobileApiConfig = {
  BASE_URL: string;
  TIMEOUT: number;
  HEADERS: Record<string, string>;
  FALLBACK_URLS: string[];
};

function normalizeApi(u?: string | null) {
  if (!u) return null;
  const base = u.replace(/\/$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}

const envAny = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
const MODE = String(envAny.MODE || envAny.VITE_MODE || envAny.NODE_ENV || '').toLowerCase();
const isDev = MODE === 'development' || MODE === 'dev' || MODE === 'local';

function computeBaseUrl() {
  // New variables for flexibility
  // Dev
  const DEV_BASE = envAny.VITE_MOBILE_API_DEV_BASE_URL || envAny.VITE_MOBILE_API_LOCAL_URL;
  // Prod
  const PROD_BASE = envAny.VITE_MOBILE_API_PROD_BASE_URL || envAny.VITE_MOBILE_API_BASE_URL || envAny.VITE_MOBILE_API_BASE;
  // Optional tunneling
  const NGROK = envAny.VITE_MOBILE_API_NGROK_URL;

  // Highest priority: explicit base
  const explicit = envAny.VITE_MOBILE_API_BASE_URL || envAny.VITE_MOBILE_API_BASE;
  if (explicit) {
    const v = normalizeApi(explicit);
    if (v) return v;
  }

  if (isDev) {
    // In dev, prefer DEV_BASE, fall back to NGROK, then localhost
    const dev = normalizeApi(DEV_BASE || 'http://localhost:5000');
    if (dev) return dev;
    const n = normalizeApi(NGROK);
    if (n) return n;
    return 'http://localhost:5000/api';
  }

  // Production: prefer PROD_BASE, fall back to NGROK; final fallback to a placeholder
  const prod = normalizeApi(PROD_BASE);
  if (prod) return prod;
  const n = normalizeApi(NGROK);
  if (n) return n;
  return 'https://your-production-api.com/api';
}

function buildFallbackUrls(): string[] {
  const urls: (string | null)[] = [];
  // Push in order of likelihood per MODE
  if (isDev) {
    urls.push(
      normalizeApi(envAny.VITE_MOBILE_API_DEV_BASE_URL || envAny.VITE_MOBILE_API_LOCAL_URL || 'http://localhost:5000'),
      normalizeApi(envAny.VITE_MOBILE_API_NGROK_URL),
      normalizeApi(envAny.VITE_MOBILE_API_BASE_URL || envAny.VITE_MOBILE_API_BASE),
    );
  } else {
    urls.push(
      normalizeApi(envAny.VITE_MOBILE_API_PROD_BASE_URL || envAny.VITE_MOBILE_API_BASE_URL || envAny.VITE_MOBILE_API_BASE),
      normalizeApi(envAny.VITE_MOBILE_API_NGROK_URL),
      normalizeApi(envAny.VITE_MOBILE_API_DEV_BASE_URL || envAny.VITE_MOBILE_API_LOCAL_URL),
    );
  }
  return [...new Set(urls.filter(Boolean) as string[])];
}

const API_CONFIG: MobileApiConfig = {
  BASE_URL: computeBaseUrl(),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  FALLBACK_URLS: buildFallbackUrls(),
};

export default API_CONFIG;
