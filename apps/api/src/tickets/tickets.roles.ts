/**
 * Roles que atienden los tickets de cada marca (siempre dentro de su marca). Quamtu y Kelqa: solo `admin`, a pedido;
 * las demás (FPTecnologi): `admin` y `comercial`. Debe coincidir con ROLES_POR_MARCA del menú del dashboard
 * (`apps/admin/src/lib/manifest.ts`).
 */
const POR_MARCA: Record<string, string[]> = {
  quamtu: ['admin'],
  kelqa: ['admin'],
};
const POR_DEFECTO = ['admin', 'comercial'];

export function rolesTickets(nombreMarca: string | null | undefined): string[] {
  const n = (nombreMarca ?? '').toLowerCase();
  return Object.entries(POR_MARCA).find(([clave]) => n.includes(clave))?.[1] ?? POR_DEFECTO;
}
