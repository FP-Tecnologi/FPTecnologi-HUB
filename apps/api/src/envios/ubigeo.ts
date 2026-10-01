import { UBIGEO } from './ubigeo.data.js';

const norm = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');

function distritosRaw(departamento: string, provincia: string) {
  const d = Object.keys(UBIGEO).find((k) => norm(k) === norm(departamento));
  if (!d) return [];
  const p = Object.keys(UBIGEO[d]).find((k) => norm(k) === norm(provincia));
  return p ? UBIGEO[d][p] : [];
}

/** Distritos (nombres INEI) de una provincia; [] si el departamento/provincia no está en el ubigeo. Ignora tildes y mayúsculas. */
export const distritosDe = (departamento: string, provincia: string): string[] =>
  distritosRaw(departamento, provincia).map(([, nombre]) => nombre).sort((a, b) => a.localeCompare(b, 'es'));

/** Código ubigeo INEI de un distrito (6 dígitos) o undefined. */
export const codigoDistrito = (departamento: string, provincia: string, distrito: string): string | undefined =>
  distritosRaw(departamento, provincia).find(([, nombre]) => norm(nombre) === norm(distrito))?.[0];

/**
 * ¿La agencia está en ese distrito? Con la API viva se compara el código ubigeo (exacto). Sin código (directorio
 * estático) se compara la zona ("BREÑA", "CERCADO LIMA") y el "DISTRITO - PROVINCIA" de la dirección.
 */
export function agenciaEnDistrito(a: { zona: string; direccion: string; ubigeo?: string }, distrito: string, codigo?: string): boolean {
  if (a.ubigeo && codigo) return a.ubigeo === codigo;
  const d = norm(distrito);
  const zona = norm(a.zona).replace(/^cercado\s+/, '');
  if (zona === d) return true;
  const escapado = d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Debe empezar palabra y no ser parte de otro nombre ("San Juan DE MIRAFLORES" no es Miraflores).
  return new RegExp(`(?<![a-z0-9])(?<!\\b(?:de|del|la)\\s)${escapado}\\s*-`).test(norm(a.direccion));
}
