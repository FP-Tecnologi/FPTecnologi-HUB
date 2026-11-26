/*
 * Proyectos y clientes de la web desde la API central (Dashboard → Web →
 * Proyectos / Clientes). Solo componentes de servidor. Si la API no responde
 * se usan los de muestra de projects.ts / clients.ts; si responde, se muestra
 * exactamente lo que haya activo (aunque esté vacío). Cache 60 s.
 */
import { api } from './catalogo';
import { PROJECTS, slugProyecto, type Project } from './projects';
import { CLIENT_SECTORS, type Client, type ClientSector } from './clients';

type ApiProyecto = {
  titulo: string;
  departamento: string;
  imagenUrl: string | null;
  cliente: string;
  anio: number | null;
  monto: number | null;
  descripcion: string;
  alcance: string[];
  detalle?: string;
  galeria?: string[];
  videos?: string[];
  esEjemplo: boolean;
};
type ApiCliente = { nombre: string; sigla: string; logoUrl: string | null; sector: string; esEjemplo: boolean };

const IMAGEN_PROYECTO = '/images/solutions/seguridad.jpg';

export async function getProyectos(): Promise<Project[]> {
  const data = await api<ApiProyecto[]>('/proyectos');
  if (!data) return PROJECTS;
  return data.map((p) => ({
    title: p.titulo,
    department: p.departamento,
    image: p.imagenUrl || IMAGEN_PROYECTO,
    client: p.cliente,
    year: p.anio ?? undefined,
    monto: p.monto ?? undefined,
    description: p.descripcion,
    scope: p.alcance,
    detalle: p.detalle ?? '',
    galeria: p.galeria ?? [],
    videos: p.videos ?? [],
    ejemplo: p.esEjemplo,
  }));
}

/** Un proyecto por su slug (derivado del título) + los demás, para "otros proyectos". */
export async function getProyecto(slug: string): Promise<{ proyecto: Project; otros: Project[] } | null> {
  const todos = await getProyectos();
  const proyecto = todos.find((p) => slugProyecto(p.title) === slug);
  if (!proyecto) return null;
  return { proyecto, otros: todos.filter((p) => p !== proyecto) };
}

/** Clientes agrupados por sector (solo los sectores que tienen clientes). */
export async function getClientes(): Promise<ClientSector[]> {
  const data = await api<ApiCliente[]>('/clientes');
  if (!data) return CLIENT_SECTORS;
  return CLIENT_SECTORS.map((sector) => ({
    ...sector,
    clients: data
      .filter((c) => c.sector === sector.key)
      .map((c): Client => ({ name: c.nombre, short: c.sigla, logo: c.logoUrl ?? undefined, ejemplo: c.esEjemplo })),
  })).filter((s) => s.clients.length > 0);
}
