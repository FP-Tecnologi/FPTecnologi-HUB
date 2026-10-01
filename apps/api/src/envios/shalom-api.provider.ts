import { Injectable } from '@nestjs/common';
import {
  departamentoDelDirectorio,
  provinciasConAgencias,
  type AgenciaCercana,
  type AgenciaShalom,
} from './agencias-shalom.js';

/**
 * Agencias Shalom en vivo (shalom-api.lat, endpoints públicos sin API key).
 *
 * Alcance de la prueba: solo el directorio de agencias (`/public/agencies/search`).
 * Cotizar tarifas y crear guías sí requieren API key con plan (ver docs/PENDIENTES.md → Envío con Shalom).
 *
 * Reglas:
 * - Si la API viva falla o tarda (>8s), se devuelve `null` y quien llama usa el directorio
 *   estático (`agencias-shalom.ts`). El checkout nunca se rompe por esto.
 * - Caché en memoria: el directorio cambia poco (24h); las búsquedas por ubicación, 10 min.
 * - Las agencias vivas llevan id `shalom:<ter_id>` y se registran para que `cotizar` las acepte.
 */
const BASE_URL = process.env.SHALOM_API_URL ?? 'https://api.shalom-api.lat';
const TIMEOUT_MS = 8000;
const TTL_DIRECTORIO_MS = 24 * 3600 * 1000;
const TTL_CERCANAS_MS = 10 * 60 * 1000;
const POR_PAGINA_MAX = 500;

interface RegistroVivo {
  ter_id: number;
  departamento?: string;
  provincia?: string;
  lugar_over?: string | null;
  zona?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  hora_atencion?: string | null;
  latitud?: string | number | null;
  longitud?: string | number | null;
  distancia_km?: number | null;
  ubi_id?: string | number | null;
}

const norm = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

const titulo = (s: string) => norm(s).replace(/(^|\s)\S/g, (c) => c.toUpperCase());

const numero = (v: string | number | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

@Injectable()
export class ShalomApiProvider {
  private readonly cache = new Map<string, { expira: number; valor: AgenciaShalom[] }>();
  /** Agencias vivas vistas (por id `shalom:<ter_id>`), para validar la sede en `cotizar`. */
  private readonly vivas = new Map<string, AgenciaShalom>();

  resolverViva(id: string): AgenciaShalom | undefined {
    return this.vivas.get(id);
  }

  /** Agencias vivas de un departamento (nombre canónico del directorio). `null` si no se pudo. */
  async agenciasDeDepartamento(departamento: string): Promise<AgenciaShalom[] | null> {
    const canonico = departamentoDelDirectorio(departamento);
    if (!canonico) return null;
    const clave = `dep:${canonico}`;
    const cached = this.leerCache(clave);
    if (cached) return cached;
    const filas = await this.buscar({ departamento: canonico });
    if (!filas) return null;
    // La API puede devolver de más con el filtro por nombre: quedarse solo con el departamento pedido.
    const valor = filas
      .map((r) => this.mapear(r))
      .filter((a) => a && norm(a.departamento) === norm(canonico))
      .filter((a): a is AgenciaShalom => !!a);
    this.guardarCache(clave, valor, TTL_DIRECTORIO_MS);
    return valor;
  }

  /** Las más cercanas a un punto, opcionalmente solo entre ciertos departamentos (nombres libres). */
  async cercanas(lat: number, lng: number, limite = 5, departamentos?: string[]): Promise<AgenciaCercana[] | null> {
    const canonicos = (departamentos ?? [])
      .map(departamentoDelDirectorio)
      .filter((d): d is string => !!d);
    const clave = `cerca:${lat.toFixed(3)},${lng.toFixed(3)}:${limite}:[${canonicos.sort().join('|')}]`;
    const cached = this.leerCache(clave);
    if (cached) return cached as AgenciaCercana[];
    const params: Record<string, string> = { near: `${lat},${lng}`, per_page: String(Math.min(POR_PAGINA_MAX, Math.max(limite * 20, 50))) };
    if (canonicos.length === 1) params.departamento = canonicos[0];
    const filas = await this.buscar(params);
    if (!filas) return null;
    const valor = filas
      .map((r) => ({ agencia: this.mapear(r), km: typeof r.distancia_km === 'number' ? r.distancia_km : null }))
      .filter((e): e is { agencia: AgenciaShalom; km: number | null } => !!e.agencia)
      .filter((e) => !canonicos.length || canonicos.some((d) => norm(d) === norm(e.agencia.departamento)))
      .map((e, i) => ({ ...e.agencia, distanciaKm: e.km === null ? i : Math.round(e.km * 10) / 10 }))
      .sort((x, y) => x.distanciaKm - y.distanciaKm)
      .slice(0, limite);
    this.guardarCache(clave, valor, TTL_CERCANAS_MS);
    return valor;
  }

  private mapear(r: RegistroVivo): AgenciaShalom | null {
    if (!r || typeof r.ter_id !== 'number') return null;
    const dep = departamentoDelDirectorio(r.departamento ?? '') ?? (r.departamento ? titulo(r.departamento) : '');
    if (!dep) return null;
    const provs = provinciasConAgencias(dep).map((p) => p.provincia);
    const prov = provs.find((p) => norm(p) === norm(r.provincia ?? '')) ?? (r.provincia ? titulo(r.provincia) : '');
    const agencia: AgenciaShalom = {
      id: `shalom:${r.ter_id}`,
      departamento: dep,
      provincia: prov,
      zona: r.lugar_over?.trim() || r.zona?.trim() || '',
      direccion: r.direccion?.trim() || '',
      telefono: r.telefono?.trim() || null,
      horario: r.hora_atencion?.trim() || '',
      lat: numero(r.latitud),
      lng: numero(r.longitud),
      ...(r.ubi_id ? { ubigeo: String(r.ubi_id) } : {}),
    };
    this.vivas.set(agencia.id, agencia);
    return agencia;
  }

  private async buscar(params: Record<string, string>): Promise<RegistroVivo[] | null> {
    try {
      const q = new URLSearchParams({ ...params, per_page: params.per_page ?? String(POR_PAGINA_MAX) });
      const res = await fetch(`${BASE_URL}/public/agencies/search?${q}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) return null;
      const cuerpo = (await res.json()) as { data?: RegistroVivo[] };
      return Array.isArray(cuerpo?.data) ? cuerpo.data : null;
    } catch {
      return null;
    }
  }

  private leerCache(clave: string): AgenciaShalom[] | null {
    const e = this.cache.get(clave);
    if (!e || e.expira < Date.now()) {
      if (e) this.cache.delete(clave);
      return null;
    }
    return e.valor;
  }

  private guardarCache(clave: string, valor: AgenciaShalom[], ttl: number) {
    this.cache.set(clave, { expira: Date.now() + ttl, valor });
  }
}
