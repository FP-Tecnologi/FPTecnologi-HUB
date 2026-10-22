export type Proveedor = {
  razonSocial: string | null;
  ruc: string | null;
  nombreComercial: string;
  direccion: string;
  email: string | null;
};

// Respaldo local si la API no responde. La razón social y el RUC de Quamtu no están publicados en el sitio:
// no se inventan (// por confirmar; se cargan en Marcas del dashboard y llegan por la API).
const respaldo: Proveedor = {
  razonSocial: null,
  ruc: null,
  nombreComercial: 'Quamtu',
  direccion: 'Jr. Huaraz 1841, Breña, Lima, Perú',
  email: null,
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
      razonSocial: d.razonSocial || null,
      ruc: d.ruc || null,
      nombreComercial: d.nombreComercial || respaldo.nombreComercial,
      direccion: d.direccion || respaldo.direccion,
      email: d.email || null,
    };
  } catch {
    return respaldo;
  }
}
