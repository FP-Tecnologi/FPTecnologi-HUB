/**
 * Roles que atienden los tickets de cada marca (siempre dentro de su marca). Quamtu, Kelqa e Imaninki: solo `admin`, a pedido;
 * las demás (FPTecnologi): `admin`, `comercial` y `soporte`. Debe coincidir con ROLES_POR_MARCA del menú del dashboard
 * (`apps/admin/src/lib/manifest.ts`).
 */
const POR_MARCA: Record<string, string[]> = {
  quamtu: ['admin'],
  kelqa: ['admin'],
  imaninki: ['admin'],
};
const POR_DEFECTO = ['admin', 'comercial', 'soporte'];

export function rolesTickets(nombreMarca: string | null | undefined): string[] {
  const n = (nombreMarca ?? '').toLowerCase();
  return Object.entries(POR_MARCA).find(([clave]) => n.includes(clave))?.[1] ?? POR_DEFECTO;
}
