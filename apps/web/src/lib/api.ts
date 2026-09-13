/*
 * FPTecnologi-HUB · Dashboard — cliente HTTP para la API central NestJS (ver apps/api).
 *
 * Responsibilities:
 *   - Attach `Authorization: Bearer <accessToken>` and `x-marca-id` headers.
 *   - Transparently refresh the access token on a 401 and retry once.
 *   - Unwrap the backend's standard envelopes:
 *       success -> { success: true, statusCode, data, timestamp }
 *       error   -> { success: false, statusCode, message, error, path, timestamp }
 *   - Never throw on missing storage (SSR-safe): all token helpers guard
 *     `typeof window`.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const ACCESS_TOKEN_KEY = 'ax:auth:access';
const REFRESH_TOKEN_KEY = 'ax:auth:refresh';
const ACTIVE_MARCA_KEY = 'ax:auth:marcaId';

// Non-httpOnly marker cookie — never carries the real token, just lets
// middleware.ts (Edge runtime, can't read localStorage) know a session
// exists so it can redirect. Every real request is still authorized by the
// Bearer token from localStorage, not this cookie.
const SESSION_COOKIE = 'ax_session';
const SESSION_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days, matches refresh token lifetime

function setSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${SESSION_COOKIE_MAX_AGE_S}; SameSite=Lax`;
}

function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  data?: T;
  message?: string | string[];
  error?: string;
}

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export const tokenStore = {
  getAccessToken: () => readStorage(ACCESS_TOKEN_KEY),
  getRefreshToken: () => readStorage(REFRESH_TOKEN_KEY),
  getActiveMarcaId: () => readStorage(ACTIVE_MARCA_KEY),
  setTokens(accessToken: string, refreshToken: string) {
    writeStorage(ACCESS_TOKEN_KEY, accessToken);
    writeStorage(REFRESH_TOKEN_KEY, refreshToken);
    setSessionCookie();
  },
  setActiveMarcaId(marcaId: string | null) {
    writeStorage(ACTIVE_MARCA_KEY, marcaId);
  },
  clear() {
    writeStorage(ACCESS_TOKEN_KEY, null);
    writeStorage(REFRESH_TOKEN_KEY, null);
    writeStorage(ACTIVE_MARCA_KEY, null);
    clearSessionCookie();
  },
};

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean; // default true — send Authorization header when a token exists
  marcaId?: string | null; // overrides the active marca for this call
  signal?: AbortSignal;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenStore.getRefreshToken();
  if (!refreshToken) return false;
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const json = (await res.json()) as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
        if (json.success && json.data) {
          tokenStore.setTokens(json.data.accessToken, json.data.refreshToken);
          return true;
        }
        return false;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request<T>(path: string, options: RequestOptions = {}, _retried = false): Promise<T> {
  const { method = 'GET', body, auth = true, marcaId, signal } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const accessToken = tokenStore.getAccessToken();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }
  const effectiveMarcaId = marcaId !== undefined ? marcaId : tokenStore.getActiveMarcaId();
  if (effectiveMarcaId) headers['x-marca-id'] = effectiveMarcaId;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
    // Necesario para que el navegador guarde/envíe la cookie httpOnly de
    // "dispositivo confiable" (ax_device) — la API está en otro origen.
    credentials: 'include',
  });

  // Access token expired mid-session: refresh once, then retry the call.
  if (res.status === 401 && auth && !_retried && tokenStore.getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, options, true);
  }

  let json: ApiEnvelope<T> | null = null;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    /* empty body (e.g. 204) */
  }

  if (!res.ok || (json && json.success === false)) {
    const message = json?.message
      ? Array.isArray(json.message) ? json.message.join(', ') : json.message
      : `Request failed with status ${res.status}`;
    throw new ApiError(message, json?.statusCode ?? res.status);
  }

  return (json?.data as T) ?? (undefined as T);
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) => request<T>(path, { ...options, method: 'DELETE' }),
};

export { API_URL };
