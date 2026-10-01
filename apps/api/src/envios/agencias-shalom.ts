import { SHALOM_AGENCIAS, type AgenciaShalomRaw } from './shalom-agencias.data.js';

export interface AgenciaShalom extends AgenciaShalomRaw {
  /** Código ubigeo INEI del distrito; solo lo traen las agencias de la API viva. */
  ubigeo?: string;
  /** Estable mientras no se regenere el directorio: "Departamento|Provincia|n". */
  id: string;
  departamento: string;
  provincia: string;
}

export interface AgenciaCercana extends AgenciaShalom {
  distanciaKm: number;
}

const TODAS: AgenciaShalom[] = Object.entries(SHALOM_AGENCIAS).flatMap(([departamento, provincias]) =>
  Object.entries(provincias).flatMap(([provincia, agencias]) =>
    agencias.map((a, i) => ({ ...a, id: `${departamento}|${provincia}|${i}`, departamento, provincia })),
  ),
);
const POR_ID = new Map(TODAS.map((a) => [a.id, a]));

const norm = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

/** Distancia en km entre dos puntos (haversine). */
export function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

export const agenciaPorId = (id: string) => POR_ID.get(id);

/** Nombre del departamento tal como está en el directorio (ignora tildes y mayúsculas). */
export function departamentoDelDirectorio(nombre: string): string | undefined {
  const n = norm(nombre);
  return Object.keys(SHALOM_AGENCIAS).find((d) => norm(d) === n);
}

export function agenciasDeDepartamento(departamento: string): AgenciaShalom[] {
  const dep = departamentoDelDirectorio(departamento);
  return dep ? TODAS.filter((a) => a.departamento === dep) : [];
}

/** Provincias del departamento que tienen al menos una agencia, con su conteo. */
export function provinciasConAgencias(departamento: string): Array<{ provincia: string; agencias: number }> {
  const dep = departamentoDelDirectorio(departamento);
  if (!dep) return [];
  return Object.entries(SHALOM_AGENCIAS[dep])
    .map(([provincia, ags]) => ({ provincia, agencias: ags.length }))
    .sort((a, b) => a.provincia.localeCompare(b.provincia, 'es'));
}

export function agenciasDeProvincia(departamento: string, provincia: string): AgenciaShalom[] {
  return agenciasDeDepartamento(departamento).filter((a) => norm(a.provincia) === norm(provincia));
}

/**
 * Agencias más cercanas a un punto (las que no tienen coordenadas no se pueden ordenar y se omiten).
 * Si se pasa departamento, solo se consideran las de ese departamento.
 */
export function agenciasCercanas(lat: number, lng: number, limite = 5, departamento?: string | string[]): AgenciaCercana[] {
  const deps = (Array.isArray(departamento) ? departamento : departamento ? [departamento] : []).map(departamentoDelDirectorio);
  const base = deps.length ? TODAS.filter((a) => deps.includes(a.departamento)) : TODAS;
  return base
    .filter((a) => a.lat !== null && a.lng !== null)
    .map((a) => ({ ...a, distanciaKm: Math.round(distanciaKm(lat, lng, a.lat!, a.lng!) * 10) / 10 }))
    .sort((x, y) => x.distanciaKm - y.distanciaKm)
    .slice(0, limite);
}

/** Texto que se guarda en el pedido y se muestra al equipo. */
export const etiquetaAgencia = (a: AgenciaShalom) =>
  `${a.zona} — ${a.direccion} (${a.provincia}, ${a.departamento})`;
