// Socket.IO client wrapper using official package
// Uses cookie-based auth by default. Configure endpoint via VITE_SOCKET_URL or NEXT_SOCKET_URL

import { io, type Socket } from 'socket.io-client';

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

export function connectSocket(path: string, query: QueryParams = {}): ClientSocket {
  // Prefer runtime-injected window value, fallback to Vite env
  const viteEnv = (import.meta as unknown as { env?: Record<string, unknown> }).env || {};
  const winBase = (window).NEXT_SOCKET_URL as string | undefined;
  const viteBase = (viteEnv.VITE_SOCKET_URL as string | undefined) || undefined;
  const base = (winBase && winBase.trim()) || (viteBase && viteBase.trim()) || '';
  // Determine dev for potential same-origin default
  const viteDev = typeof viteEnv.DEV === 'boolean' ? (viteEnv.DEV as boolean) : String(viteEnv.DEV ?? '').toLowerCase() === 'true';
  const url = base ? `${String(base)}${path}` : path; // if base is empty, assume same-origin
  const socket = io(url, {
    transports: ['websocket'],
    withCredentials: true,
    query,
  });
  return socket as ClientSocket;
}
