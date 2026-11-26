/*
 * FPTecnologi-HUB · Dashboard — nav manifest loader + index (TS port of src/js/core/manifest.js).
 *
 * The manifest is imported directly (bundled JSON) rather than fetched, so the
 * sidebar, breadcrumb, sidebar filter and command palette all share ONE indexed
 * resolution of the node tree. Drives every nav surface per BUILD-CONVENTIONS §5.
 */

import raw from '../data/nav-manifest.json';

export interface NavBadge {
  type: string;
  value?: number;
}
export interface NavNode {
  id: string;
  title: string;
  slug: string;
  icon: string;
  parent: string | null;
  section: string | null;
  order: number;
  badge: NavBadge | null;
  keywords: string[];
  inMenu: boolean;
  alias: string | null;
  external?: boolean;
  /** Grupo con página propia: al hacer clic navega a `slug` y además despliega sus hijos. */
  selfPage?: boolean;
  /**
   * Optional role whitelist (e.g. ["admin"]). Undefined/empty = visible to
   * every role. Matched case-insensitively against the user's active
   * UsuarioMarcaRol.rol.nombre (see AuthContext). "admin" always sees
   * everything regardless of this list. This is a first pass for
   * dash-menu-dinamico — extend per-node as real permission rules are
   * defined (still a manual whitelist, not a full permissions engine).
   */
  roles?: string[];
  /** Solo en la vista de una marca; oculto en el modo Administración (global). */
  soloMarca?: boolean;
  /** Ya vive en la vista Comercial (sección COMERCIAL): se oculta en la vista de marca para quien tiene rol comercial. */
  ocultoAComercial?: boolean;
  /** Solo para estas marcas (parte del nombre, sin distinguir mayúsculas). Ej. ["fimav"]. Sin lista = todas. */
  marcas?: string[];
}
interface RawManifest {
  meta?: Record<string, unknown>;
  nodes?: NavNode[];
}

export interface ManifestIndex {
  meta: Record<string, unknown>;
  nodes: NavNode[];
  byId: Map<string, NavNode>;
  bySlug: Map<string, NavNode>;
  /** Direct children of a node id (or '__root__' for top-level), order-sorted. */
  childrenOf: (id: string | null) => NavNode[];
  /** Resolve the canonical node for a node that may be an alias. */
  resolve: (node: NavNode | undefined | null) => NavNode | undefined | null;
  /** Root→node ancestor chain (canonical), inclusive of the node itself. */
  trail: (node: NavNode | undefined | null) => NavNode[];
}

function index(data: RawManifest): ManifestIndex {
  const nodes = Array.isArray(data.nodes) ? data.nodes : [];
  const byId = new Map<string, NavNode>();
  const bySlug = new Map<string, NavNode>();
  const children = new Map<string, NavNode[]>();

  for (const n of nodes) {
    byId.set(n.id, n);
    if (!bySlug.has(n.slug) || !n.alias) bySlug.set(n.slug, n);
    const p = n.parent || '__root__';
    if (!children.has(p)) children.set(p, []);
    children.get(p)!.push(n);
  }
  for (const list of children.values()) {
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  return {
    meta: data.meta || {},
    nodes,
    byId,
    bySlug,
    childrenOf: (id) => children.get(id || '__root__') || [],
    resolve: (node) => (node && node.alias && byId.get(node.alias)) || node,
    trail(node) {
      const out: NavNode[] = [];
      let cur: NavNode | undefined | null = node;
      const seen = new Set<string>();
      while (cur && !seen.has(cur.id)) {
        seen.add(cur.id);
        out.unshift(cur);
        cur = cur.parent ? byId.get(cur.parent) : null;
      }
      return out;
    },
  };
}

export const manifest: ManifestIndex = index(raw as RawManifest);

/** Ordered, deduped list of section names for the top-level groups. */
export function sections(): string[] {
  const seen: string[] = [];
  for (const n of manifest.childrenOf('__root__')) {
    if (n.section && !seen.includes(n.section)) seen.push(n.section);
  }
  return seen;
}

/** Top-level group nodes for a given section, order-sorted. */
export function groupsInSection(section: string): NavNode[] {
  return manifest.childrenOf('__root__').filter((n) => n.section === section);
}

/**
 * Whether a node is visible for the given role name (case-insensitive).
 * `roleName === null` (not logged in yet / no marca) hides role-restricted
 * nodes; "admin" always passes. Nodes without a `roles` whitelist are
 * visible to everyone.
 */
/**
 * Módulos de la sección MARCA que ve cada marca que no es FPTecnologi (las demás webs solo usan una parte del HUB).
 * Un grupo listado muestra todos sus hijos, salvo que la lista nombre alguno de ellos: entonces solo esos.
 * FPTecnologi (y cualquier marca que no esté aquí) ve todos los módulos, menos los marcados `marcas` de otra marca.
 */
export const MODULOS_POR_MARCA: Record<string, string[]> = {
  quamtu: ['marca.webquamtu', 'marca.blogs', 'marca.cotizador', 'cotizador.leads', 'marca.herramientas', 'web.tickets', 'marca.libro', 'marca.equipo'],
  kelqa: ['marca.webkelqa', 'marca.blogs', 'marca.ecommerce', 'ecommerce.productos', 'ecommerce.catalogo', 'marca.herramientas', 'web.tickets', 'web.contactos', 'marca.libro', 'marca.equipo'],
  imaninki: ['marca.webimaninki', 'marca.blogs', 'marca.ecommerce', 'ecommerce.productos', 'ecommerce.catalogo', 'marca.herramientas', 'web.tickets', 'web.contactos', 'marca.libro', 'marca.equipo'],
  imc: ['marca.webimc', 'marca.blogs'],
  fimav: ['marca.webfimav', 'marca.blogs', 'marca.ecommerce', 'ecommerce.catalogo', 'marca.cotizador', 'cotizador.leads', 'marca.herramientas', 'web.contactos', 'marca.bbva', 'marca.libro', 'marca.equipo'],
};

/**
 * Roles que ven un módulo en una marca concreta, cuando no son los del manifiesto (`admin` siempre entra). Debe
 * coincidir con la API (p. ej. `apps/api/src/tickets/tickets.roles.ts`).
 */
export const ROLES_POR_MARCA: Record<string, Record<string, string[]>> = {
  quamtu: { 'web.tickets': ['admin'] },
  kelqa: { 'web.tickets': ['admin'] },
  imaninki: { 'web.tickets': ['admin'] },
};

/**
 * ¿Este nodo del menú corresponde a la marca activa? (ver MODULOS_POR_MARCA y `marcas`). Con `rol`, aplica además
 * ROLES_POR_MARCA.
 */
export function visibleParaMarca(node: NavNode, marcaNombre: string | null | undefined, rol?: string | null): boolean {
  const nombre = (marcaNombre ?? '').toLowerCase();
  if (node.marcas?.length && !node.marcas.some((m) => nombre.includes(m.toLowerCase()))) return false;
  if (rol !== undefined) {
    const reglas = Object.entries(ROLES_POR_MARCA).find(([k]) => nombre.includes(k))?.[1];
    const permitidos = reglas?.[node.id];
    if (permitidos && rol?.toLowerCase() !== 'admin' && !permitidos.includes((rol ?? '').toLowerCase())) return false;
  }
  const clave = Object.keys(MODULOS_POR_MARCA).find((k) => nombre.includes(k));
  if (!clave) return true;
  const lista = MODULOS_POR_MARCA[clave]!;
  const raiz = manifest.trail(node)[0];
  if (!raiz || raiz.section !== 'MARCA') return true;
  if (!lista.includes(raiz.id)) return false;
  if (node.id === raiz.id) return true;
  const padre = node.parent ? manifest.byId.get(node.parent) : null;
  const hermanos = padre ? manifest.childrenOf(padre.id).map((c) => c.id) : [];
  return !hermanos.some((id) => lista.includes(id)) || lista.includes(node.id);
}

/** Nodos de página (sin alias) que responden a una ruta; una subpágina sin nodo propio usa los de la ruta madre. */
function nodosDeRuta(slug: string): NavNode[] {
  const partes = slug.split('/');
  while (partes.length) {
    const ruta = partes.join('/');
    const todos = manifest.nodes.filter((n) => !n.alias && n.slug === ruta);
    if (todos.length) {
      // Un grupo comparte la ruta con su primera página: manda la página.
      const hojas = todos.filter((n) => manifest.childrenOf(n.id).length === 0);
      return hojas.length ? hojas : todos;
    }
    partes.pop();
  }
  return [];
}

/**
 * ¿Esta marca puede abrir esta ruta (aunque se escriba a mano en la barra de direcciones)? Solo restringe los módulos de
 * la sección MARCA; las demás páginas son de todos. Los roles los sigue controlando la API.
 */
export function rutaPermitidaEnMarca(slug: string, marcaNombre: string): boolean {
  const nodos = nodosDeRuta(slug);
  return !nodos.length || nodos.some((n) => {
    const trail = manifest.trail(n);
    return trail[0]?.section !== 'MARCA' || trail.every((x) => visibleParaMarca(x, marcaNombre));
  });
}

/**
 * ¿Se ofrece este nodo a quien está usando el dashboard? Mismas reglas que el menú lateral: el nodo y todos sus
 * ancestros deben estar en el menú y permitidos para el rol; GENERAL (Administración) e «inicio.dashboards» solo en la
 * vista de Administración; MARCA nunca en Administración y, dentro de una marca, solo sus módulos (visibleParaMarca).
 * La usa el buscador (⌘K) para no listar módulos que el menú oculta.
 */
export function visibleEnDashboard(node: NavNode, ctx: { roleName: string | null; adminMode: boolean; marcaNombre: string | null | undefined; comercialMode?: boolean }): boolean {
  const trail = manifest.trail(node);
  const raiz = trail[0];
  if (!raiz) return false;
  if (trail.some((n) => !n.inMenu || !visibleForRole(n, ctx.roleName))) return false;
  if (raiz.section === 'GENERAL' && !ctx.adminMode) return false;
  if (raiz.id === 'inicio.dashboards' && !ctx.adminMode) return false;
  // En Comercial el inicio es «Inicio comercial»: el resumen de la marca no se ofrece.
  if (raiz.id === 'inicio.panel' && ctx.comercialMode) return false;
  if (raiz.section === 'MARCA' && (ctx.adminMode || ctx.comercialMode)) return false;
  if (raiz.section === 'COMERCIAL' && !ctx.comercialMode) return false;
  if (ctx.adminMode) return !trail.some((n) => n.soloMarca);
  // En Comercial cada módulo sigue siendo de su marca: se evalúa la página real (la del alias) contra la marca de trabajo.
  const reales = ctx.comercialMode ? manifest.trail(manifest.resolve(node)) : trail;
  return reales.every((n) => visibleParaMarca(n, ctx.marcaNombre, ctx.roleName));
}

/**
 * ¿Se dibuja este grupo en el menú? Un grupo sin ningún hijo disponible (por rol o por marca) no se ofrece; una hoja
 * solo depende de sí misma.
 */
export function tieneContenido(node: NavNode, ctx: Parameters<typeof visibleEnDashboard>[1]): boolean {
  if (!visibleEnDashboard(node, ctx)) return false;
  const hijos = manifest.childrenOf(node.id);
  return hijos.length === 0 || node.id === 'inicio.dashboards' || hijos.some((h) => tieneContenido(h, ctx));
}

/** A dónde lleva un grupo en la barra del celular: su propia página si la tiene; si no, el primer hijo disponible. */
export function destinoDeGrupo(node: NavNode, ctx: Parameters<typeof visibleEnDashboard>[1]): string {
  const hijo = node.selfPage ? undefined : manifest.childrenOf(node.id).find((h) => tieneContenido(h, ctx));
  return hijo ? destinoDeGrupo(hijo, ctx) : (manifest.resolve(node)?.slug ?? node.slug);
}

/** Roles que trabajan desde la vista Comercial (CRM, captación, campañas y material de venta). */
export const ROLES_VISTA_COMERCIAL = ['comercial', 'jefe_comercial', 'direccion'];
/** Quién puede abrir la vista Comercial: los anteriores y el admin de una marca (el CRM vive solo allí). */
export const ROLES_ENTRAN_COMERCIAL = [...ROLES_VISTA_COMERCIAL, 'admin'];

export function visibleForRole(node: NavNode, roleName: string | null): boolean {
  if (node.ocultoAComercial && ROLES_VISTA_COMERCIAL.includes((roleName ?? '').toLowerCase())) return false;
  if (!node.roles || node.roles.length === 0) return true;
  if (!roleName) return false;
  const role = roleName.toLowerCase();
  if (role === 'admin') return true;
  return node.roles.some((r) => r.toLowerCase() === role);
}

/**
 * Normalise a router path to a manifest slug. "/" maps to the home slug
 * "" (Panel general); anything else strips slashes verbatim.
 */
export function slugFromPath(pathname: string): string {
  const p = (pathname || '/').replace(/\/+$/, '').replace(/^\/+/, '');
  if (!p || p === 'index') return '';
  return p;
}

/** Build a router href for a slug. */
export function hrefForSlug(slug: string): string {
  return '/' + slug;
}
