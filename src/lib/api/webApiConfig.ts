declare global {
  interface Window {
    // Custom runtime-configurable variables (not Vite-specific)
    NEXT_WEB_API_BASE_DEV?: string;
    NEXT_WEB_API_BASE?: string; // may be comma-separated in production
  }
}

type ViteEnv = { [k: string]: string | undefined };
const viteEnv: ViteEnv = (import.meta as unknown as { env?: ViteEnv }).env || {};

function pickFirstUrl(raw: string | undefined, fallback: string) {
  const src = (raw || '').trim();
  if (!src) return fallback;
  if (src.includes(',')) {
    const first = src.split(',').map(s => s.trim()).find(Boolean);
    return (first || fallback).replace(/\/$/, '');
  }
  return src.replace(/\/$/, '');
}

// Decide dev/prod without relying on Vite's MODE; use hostname heuristic
function isDevHost() {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

function resolveBaseUrl() {
  const defaultBaseProd = 'https://tamu-business.vercel.app';
  // Prefer Vite's DEV flag when present; fallback to MODE === 'development' and hostname check
  const envAny = (import.meta as unknown as { env?: Record<string, unknown> }).env || {};
  const viteDev = typeof envAny.DEV === 'boolean'
    ? (envAny.DEV as boolean)
    : String(envAny.DEV ?? '').toLowerCase() === 'true';
  const viteModeDev = String(envAny.MODE ?? '').toLowerCase() === 'development';
  const dev = Boolean(viteDev || viteModeDev || isDevHost());

  // Prefer window-provided values first (runtime configurable)
  if (dev) {
    const fromWindow = window.NEXT_WEB_API_BASE_DEV || window.NEXT_WEB_API_BASE;
    if (fromWindow) return pickFirstUrl(fromWindow, 'http://localhost:3000');
    // Fallbacks: prefer Vite-exposed vars, then any NEXT_* provided via import.meta (if any)
    const fromVite =
      viteEnv.VITE_WEB_API_BASE_DEV ||
      viteEnv.VITE_WEB_API_BASE ||
      viteEnv.NEXT_WEB_API_BASE_DEV ||
      viteEnv.NEXT_WEB_API_BASE;
    // Final dev fallback to localhost:3000 to avoid hitting prod by default
    return pickFirstUrl(fromVite, 'http://localhost:3000');
  }

  // Production
  const prodFromWindow = window.NEXT_WEB_API_BASE;
  if (prodFromWindow) return pickFirstUrl(prodFromWindow, defaultBaseProd);
  const prodFromVite =
    viteEnv.VITE_WEB_API_BASE ||
    viteEnv.NEXT_WEB_API_BASE;
  return pickFirstUrl(prodFromVite, defaultBaseProd);
}

export const WEB_API_BASE = resolveBaseUrl();

export function withBase(path: string) {
  const base = WEB_API_BASE.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function getJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try { const j = await res.json(); if (j?.message) message = j.message; } catch(e){console.log(e.message)}
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}
