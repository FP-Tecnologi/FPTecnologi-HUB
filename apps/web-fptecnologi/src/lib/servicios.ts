/*
 * Servicios TI de la web desde la API central (Dashboard → Soluciones →
 * Servicios): tarjeta + contenido de la página /servicios/[slug]. Solo
 * componentes de servidor. Si la API no responde (o aún no hay servicios
 * cargados) se usa el contenido local de content.ts + serviciosDetalle.ts para
 * que la web no quede sin servicios. Cache 60 s.
 */
import { SOLUTIONS } from './content';
import { SERVICIOS_DETALLE, type ServicioDetalle } from './serviciosDetalle';
import { api } from './catalogo';

/** Lo que necesita una tarjeta de servicio (home, listado, menú). */
export type ServicioTarjeta = { title: string; slug: string; tag: string; icon: string; image: string; description: string };
export type ServicioPublico = ServicioTarjeta & { detalle: ServicioDetalle | null; precioDesde: number | null };

type ApiServicio = {
  nombre: string;
  descripcion: string | null;
  precioDesde: string | number | null;
  slug: string | null;
  etiqueta: string | null;
  icono: string | null;
  imagenUrl: string | null;
  intro: string | null;
  incluye: string[];
  beneficios: { titulo: string; texto: string }[];
  sectores: string[];
  faqs: { p: string; r: string }[];
};

const IMAGEN_DEFECTO = '/images/solutions/seguridad.jpg';

const slugDe = (nombre: string) =>
  nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function mapear(s: ApiServicio): ServicioPublico {
  const tieneDetalle = !!s.intro || s.incluye.length > 0;
  return {
    title: s.nombre,
    slug: s.slug ?? slugDe(s.nombre),
    tag: s.etiqueta || 'Servicio de',
    icon: s.icono || 'shield',
    image: s.imagenUrl || IMAGEN_DEFECTO,
    description: s.descripcion || '',
    precioDesde: s.precioDesde === null ? null : Number(s.precioDesde),
    detalle: tieneDetalle
      ? { intro: s.intro || s.descripcion || '', incluye: s.incluye, beneficios: s.beneficios, sectores: s.sectores, faqs: s.faqs }
      : null,
  };
}

const LOCAL: ServicioPublico[] = SOLUTIONS.map((s) => ({
  title: s.title,
  slug: s.slug,
  tag: s.tag,
  icon: s.icon,
  image: s.image,
  description: s.description,
  precioDesde: null,
  detalle: SERVICIOS_DETALLE[s.slug] ?? null,
}));

/** Servicios activos, en el orden definido en el dashboard. */
export async function getServicios(): Promise<ServicioPublico[]> {
  const data = await api<ApiServicio[]>('/servicios');
  return data && data.length > 0 ? data.map(mapear) : LOCAL;
}

export async function getServicio(slug: string): Promise<ServicioPublico | null> {
  return (await getServicios()).find((s) => s.slug === slug) ?? null;
}
