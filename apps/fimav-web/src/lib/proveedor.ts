import { contacto } from './contacto';

export type Proveedor = { razonSocial: string; ruc: string; nombreComercial: string; direccion: string; email: string };

const respaldo: Proveedor = {
  razonSocial: contacto.razonSocialLegal,
  ruc: contacto.ruc,
  nombreComercial: 'Fimav Perú',
  direccion: contacto.direccion,
  email: contacto.comercial,
};

/** Datos del proveedor para la hoja de reclamación: de la API del HUB, con respaldo local si falla. */
export async function getProveedor(): Promise<Proveedor> {
  const marca = process.env.HUB_MARCA_ID;
  if (!marca) return respaldo;
  try {
    const res = await fetch(`${process.env.HUB_API_URL ?? 'http://localhost:3001'}/public/libro-reclamaciones/proveedor?marcaId=${encodeURIComponent(marca)}`, { next: { revalidate: 3600 } });
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
