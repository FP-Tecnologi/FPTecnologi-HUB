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

interface VerifyResult {
  accessToken: string;
  refreshToken: string;
  usuario: AuthUser;
}

type LoginResult =
  | { requiresOtp: true; requiresTotp?: false; email: string }
  | { requiresTotp: true; requiresOtp?: false; email: string }
  // Dispositivo confiable: el backend saltea el 2FA y devuelve tokens de una.
  | (VerifyResult & { requiresOtp?: false; requiresTotp?: false });

interface AuthContextValue {
  user: AuthUser | null;
  marcas: MarcaAsignada[];
  activeMarcaId: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyOtp: (email: string, codigo: string, trustDevice?: boolean) => Promise<VerifyResult>;
  verifyTotp: (email: string, code: string, trustDevice?: boolean) => Promise<VerifyResult>;
  completeGoogleLogin: (accessToken: string, refreshToken: string, usuario: AuthUser) => Promise<VerifyResult>;
  register: (email: string, password: string, marcaId: string, nombre?: string) => Promise<{ id: string; email: string; nombre: string | null }>;
  requestPasswordReset: (email: string) => Promise<{ sent: true }>;
  confirmPasswordReset: (email: string, codigo: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveMarcaId: (marcaId: string) => void;
  updateProfile: (data: { nombre?: string; email?: string; currentPassword?: string }) => Promise<AuthUser>;
  /** Vista global de administración (Panel general + gestión): sin marca activa. */
  adminMode: boolean;
  setAdminMode: (on: boolean) => void;
  refreshMarcas: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = 'ax:auth:user';
/** Persisted flag for the global admin view (no active marca). SSR-safe helpers. */
const ADMIN_FLAG = 'ax:auth:adminmode';
function readAdminFlag(): boolean {
  try {
    return typeof window !== 'undefined' && window.localStorage.getItem(ADMIN_FLAG) === '1';
  } catch {
    return false;
  }
}
function writeAdminFlag(on: boolean): void {
  try {
    if (typeof window === 'undefined') return;
    if (on) window.localStorage.setItem(ADMIN_FLAG, '1');
    else window.localStorage.removeItem(ADMIN_FLAG);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [marcas, setMarcas] = useState<MarcaAsignada[]>([]);
  const [activeMarcaId, setActiveMarcaIdState] = useState<string | null>(null);
  const [adminMode, setAdminModeState] = useState(false);
  const [loading, setLoading] = useState(true);

  const setAdminMode = useCallback((on: boolean) => {
    if (on) {
      tokenStore.setActiveMarcaId(null);
      setActiveMarcaIdState(null);
    }
    writeAdminFlag(on);
    setAdminModeState(on);
  }, []);

  const setActiveMarcaId = useCallback((marcaId: string) => {
    writeAdminFlag(false);
    setAdminModeState(false);
    tokenStore.setActiveMarcaId(marcaId);
    setActiveMarcaIdState(marcaId);
  }, []);

  const refreshMarcas = useCallback(async () => {
    try {
      const list = await api.get<MarcaAsignada[]>('/usuarios/me/marcas');
      setMarcas(list);
      const isAdmin = list.some((m) => m.rol.nombre.toLowerCase() === 'admin');
      if (readAdminFlag() && isAdmin) {
        tokenStore.setActiveMarcaId(null);
        setActiveMarcaIdState(null);
        setAdminModeState(true);
        return;
      }
      setAdminModeState(false);
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

  const completeSession = useCallback(async (result: VerifyResult) => {
    tokenStore.setTokens(result.accessToken, result.refreshToken);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_KEY, JSON.stringify(result.usuario));
    }
    setUser(result.usuario);
    await refreshMarcas();
    return result;
  }, [refreshMarcas]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.post<LoginResult>('/auth/login', { email, password }, { auth: false });
    // Dispositivo confiable: el backend salteó el 2FA y ya mandó los tokens.
    if (!result.requiresOtp && !result.requiresTotp) {
      await completeSession(result);
    }
    return result;
  }, [completeSession]);

  const verifyOtp = useCallback(async (email: string, codigo: string, trustDevice?: boolean) => {
    const result = await api.post<VerifyResult>('/auth/otp/verify', { email, codigo, trustDevice }, { auth: false });
    return completeSession(result);
  }, [completeSession]);

  const verifyTotp = useCallback(async (email: string, code: string, trustDevice?: boolean) => {
    const result = await api.post<VerifyResult>('/auth/totp/verify-login', { email, code, trustDevice }, { auth: false });
    return completeSession(result);
  }, [completeSession]);

  /** Called by the /auth/google/callback page once the backend redirects back with tokens in the URL. */
  const completeGoogleLogin = useCallback(async (accessToken: string, refreshToken: string, usuario: AuthUser) => {
    return completeSession({ accessToken, refreshToken, usuario });
  }, [completeSession]);

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

  const updateProfile = useCallback(async (data: { nombre?: string; email?: string; currentPassword?: string }) => {
    const updated = await api.patch<AuthUser>('/usuarios/me', data);
    setUser(updated);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_KEY, JSON.stringify(updated));
    }
    return updated;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = tokenStore.getRefreshToken();
    try {
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {
      /* best-effort revoke; proceed with local logout regardless */
    }
    tokenStore.clear();
    writeAdminFlag(false);
    if (typeof window !== 'undefined') window.localStorage.removeItem(USER_KEY);
    setUser(null);
    setMarcas([]);
    setActiveMarcaIdState(null);
    setAdminModeState(false);
    router.push('/auth/sign-in');
  }, [router]);

  useEffect(() => {
    setActiveMarcaIdState(tokenStore.getActiveMarcaId());
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, marcas, activeMarcaId, loading, login, verifyOtp, verifyTotp, completeGoogleLogin,
    register, requestPasswordReset, confirmPasswordReset,
    logout, setActiveMarcaId, adminMode, setAdminMode, refreshMarcas, updateProfile,
  }), [
    user, marcas, activeMarcaId, loading, login, verifyOtp, verifyTotp, completeGoogleLogin,
    register, requestPasswordReset, confirmPasswordReset,
    logout, setActiveMarcaId, adminMode, setAdminMode, refreshMarcas, updateProfile,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { ApiError };
