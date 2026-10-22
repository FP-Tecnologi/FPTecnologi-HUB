import { CONTACT_INFO } from './content';

export type Proveedor = { razonSocial: string; ruc: string; nombreComercial: string; direccion: string; email: string };

// Respaldo local si la API no responde. La razón social y el RUC no están en el sitio: se leen de la
// API (Marcas -> datos fiscales); mientras tanto no se inventan.
const respaldo: Proveedor = {
  razonSocial: '', // por confirmar
  ruc: '', // por confirmar
  nombreComercial: 'FPTecnologi & System',
  direccion: CONTACT_INFO.address,
  email: CONTACT_INFO.email,
};

/** Datos del proveedor para la hoja de reclamación: de la API del HUB, con respaldo local si falla. */
export async function getProveedor(): Promise<Proveedor> {
  const marca = process.env.HUB_MARCA_ID;
  if (!marca) return respaldo;
  try {
    const res = await fetch(`${process.env.HUB_API_URL ?? 'http://localhost:3001'}/public/libro-reclamaciones/proveedor?marcaId=${encodeURIComponent(marca)}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) return respaldo;
    const j = await res.json();
    const d = j.data ?? j;
    return {
      razonSocial: d.razonSocial || respaldo.razonSocial,
      ruc: d.ruc || respaldo.ruc,
      nombreComercial: d.nombreComercial || respaldo.nombreComercial,
      direccion: d.direccion || respaldo.direccion,
      email: d.email || respaldo.email,
    };
  } catch {
    return respaldo;
  }
}
