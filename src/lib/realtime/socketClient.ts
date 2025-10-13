// Socket.IO client wrapper using official package
// Uses cookie-based auth by default. Configure endpoint via VITE_SOCKET_URL or NEXT_SOCKET_URL

import { io, type Socket } from 'socket.io-client';
import { authLocal, authBus } from '@/lib/auth/authLocal';

export type SocketConnectionState = 'idle' | 'connecting' | 'connected' | 'unauthorized' | 'disconnected' | 'error';

export type QueryParams = Record<string, string | number | boolean | undefined>;

export interface GenericSocket extends Socket {
  on(event: string, listener: (...args: unknown[]) => void): this;
  emit(event: string, ...args: unknown[]): this;
}

export type ClientSocket = GenericSocket;

declare global {
  interface Window {
    NEXT_SOCKET_URL?: string;
  }
}

let bootedOrigin: string | null = null;

async function ensureServerBoot(origin: string) {
  if (bootedOrigin === origin) return;
  try {
    await fetch(`${origin.replace(/\/$/, '')}/api/socket`, { method: 'GET', credentials: 'include' });
  } catch {
    // Non-fatal: server may already be initialized
  }
  bootedOrigin = origin;
}

export async function connectSocket(namespacePath: string = '/realtime', query: QueryParams = {}): Promise<ClientSocket> {
  // Prefer runtime-injected window value, fallback to Vite env
  const viteEnv = (import.meta as unknown as { env?: Record<string, unknown> }).env || {};
  const winBase = (window).NEXT_SOCKET_URL as string | undefined;
  const viteBase = (viteEnv.VITE_SOCKET_URL as string | undefined) || undefined;
  // Base server origin (protocol + host:port). If empty, same-origin
  const base = (winBase && winBase.trim()) || (viteBase && viteBase.trim()) || '';
  const origin = base || (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}` : '');
  // Socket.IO engine path (mobile uses '/api/socket.io') and namespace '/realtime'
  const url = `${origin}${namespacePath}`;
  // Ensure Next.js boot route initializes IO server (dev/HMR friendly)
  await ensureServerBoot(origin);
  const token = authLocal.getAccessToken();
  const socket = io(url, {
    path: '/api/socket.io',
    transports: ['websocket'],
    withCredentials: true,
    query,
    auth: token ? { token } : undefined,
    autoConnect: !!token,
  });
  // If token arrives later, set and connect
  if (!token) {
    const unsub = authBus.subscribe('login', () => {
      try {
        const t = authLocal.getAccessToken();
        if (t) {
          (socket).auth = { token: t };
          socket.connect();
        }
      } catch { /* noop */ }
      try { unsub(); } catch { /* noop */ }
    });
  }
  return socket as ClientSocket;
}
