'use client';
/*
 * FPTecnologi-HUB · Dashboard — AuthContext.
 *
 * Wraps the NestJS backend's 2-step auth flow (login -> requiresOtp -> verify)
 * and exposes the authenticated user's brands (`marcas`) plus the currently
 * active brand (`activeMarcaId`, persisted so the multi-tenant selector
 * survives reloads). All dashboard screens that call the API should read
 * `activeMarcaId` from here instead of hardcoding one.
 */
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError, tokenStore } from '../lib/api';

export interface MarcaAsignada {
  marcaId: string;
  marca: { id: string; nombre: string; dominioPrincipal?: string | null };
  rol: { id: string; nombre: string };
}

export interface AuthUser {
  id: string;
  email: string;
  nombre: string;
}

type LoginResult =
  | { requiresOtp: true; requiresTotp?: false; email: string }
  | { requiresTotp: true; requiresOtp?: false; email: string };

interface VerifyResult {
  accessToken: string;
  refreshToken: string;
  usuario: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  marcas: MarcaAsignada[];
  activeMarcaId: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyOtp: (email: string, codigo: string) => Promise<VerifyResult>;
  verifyTotp: (email: string, code: string) => Promise<VerifyResult>;
  register: (email: string, password: string, marcaId: string, nombre?: string) => Promise<{ id: string; email: string; nombre: string | null }>;
  requestPasswordReset: (email: string) => Promise<{ sent: true }>;
  confirmPasswordReset: (email: string, codigo: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveMarcaId: (marcaId: string) => void;
  refreshMarcas: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = 'ax:auth:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [marcas, setMarcas] = useState<MarcaAsignada[]>([]);
  const [activeMarcaId, setActiveMarcaIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const setActiveMarcaId = useCallback((marcaId: string) => {
    tokenStore.setActiveMarcaId(marcaId);
    setActiveMarcaIdState(marcaId);
  }, []);

  const refreshMarcas = useCallback(async () => {
    try {
      const list = await api.get<MarcaAsignada[]>('/usuarios/me/marcas');
      setMarcas(list);
      const current = tokenStore.getActiveMarcaId();
      const stillValid = current && list.some((m) => m.marcaId === current);
      if (!stillValid && list.length > 0) setActiveMarcaId(list[0].marcaId);
    } catch {
      setMarcas([]);
    }
  }, [setActiveMarcaId]);

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      const accessToken = tokenStore.getAccessToken();
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const storedUser = typeof window !== 'undefined' ? window.localStorage.getItem(USER_KEY) : null;
        if (storedUser) setUser(JSON.parse(storedUser) as AuthUser);
        await refreshMarcas();
      } catch {
        tokenStore.clear();
        setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return api.post<LoginResult>('/auth/login', { email, password }, { auth: false });
  }, []);

  const verifyOtp = useCallback(async (email: string, codigo: string) => {
    const result = await api.post<VerifyResult>('/auth/otp/verify', { email, codigo }, { auth: false });
    tokenStore.setTokens(result.accessToken, result.refreshToken);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_KEY, JSON.stringify(result.usuario));
    }
    setUser(result.usuario);
    await refreshMarcas();
    return result;
  }, [refreshMarcas]);

  const verifyTotp = useCallback(async (email: string, code: string) => {
    const result = await api.post<VerifyResult>('/auth/totp/verify-login', { email, code }, { auth: false });
    tokenStore.setTokens(result.accessToken, result.refreshToken);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_KEY, JSON.stringify(result.usuario));
    }
    setUser(result.usuario);
    await refreshMarcas();
    return result;
  }, [refreshMarcas]);

  const register = useCallback(async (email: string, password: string, marcaId: string, nombre?: string) => {
    return api.post<{ id: string; email: string; nombre: string | null }>(
      '/auth/register',
      { email, password, marcaId, nombre },
      { auth: false },
    );
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    return api.post<{ sent: true }>('/auth/password-reset/request', { email }, { auth: false });
  }, []);

  const confirmPasswordReset = useCallback(async (email: string, codigo: string, newPassword: string) => {
    await api.post<void>('/auth/password-reset/confirm', { email, codigo, newPassword }, { auth: false });
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {
      /* best-effort revoke; proceed with local logout regardless */
    }
    tokenStore.clear();
    if (typeof window !== 'undefined') window.localStorage.removeItem(USER_KEY);
    setUser(null);
    setMarcas([]);
    setActiveMarcaIdState(null);
    router.push('/auth/sign-in');
  }, [router]);

  useEffect(() => {
    setActiveMarcaIdState(tokenStore.getActiveMarcaId());
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, marcas, activeMarcaId, loading, login, verifyOtp, verifyTotp,
    register, requestPasswordReset, confirmPasswordReset,
    logout, setActiveMarcaId, refreshMarcas,
  }), [
    user, marcas, activeMarcaId, loading, login, verifyOtp, verifyTotp,
    register, requestPasswordReset, confirmPasswordReset,
    logout, setActiveMarcaId, refreshMarcas,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { ApiError };
