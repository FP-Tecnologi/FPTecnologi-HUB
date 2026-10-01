/*
 * Popups de aviso (Web informativa → Popups del dashboard): tipos, a qué "página" corresponde cada ruta y la
 * memoria de frecuencia del visitante. Misma forma que apps/api/src/popups/popups.modelo.ts.
 */
export interface PopupContenido {
  etiqueta: string; titulo: string; texto: string; imagenUrl: string; descuento: string; codigo: string; fecha: string; lugar: string;
  botonTexto: string; accion: 'ninguna' | 'url' | 'producto' | 'whatsapp'; url: string; whatsappTexto: string; cerrarTexto: string;
  tema: 'azul' | 'oscuro' | 'claro' | 'acento';
}
export interface PopupPublico {
  id: string;
  plantilla: string;
  formato: 'modal' | 'esquina' | 'barra';
  contenido: PopupContenido;
  producto: { nombre: string; imagen: string; precio: number; precioAntes: number | null; moneda: string } | null;
  enlace: string;
  disparador: 'carga' | 'retraso' | 'scroll' | 'salida';
  disparadorValor: number;
  frecuencia: 'siempre' | 'sesion' | 'una_vez' | 'horas' | 'dias';
  frecuenciaValor: number;
  dispositivo: 'todos' | 'escritorio' | 'movil';
  version: number;
}

/** Clave de página que el dashboard ofrece en "¿En qué páginas se muestra?" para una ruta de la web. */
export function paginaDe(pathname: string): string {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/') return 'home';
  if (p.startsWith('/producto')) return 'producto';
  if (p.startsWith('/tienda') || p.startsWith('/marcas')) return 'tienda';
  if (p.startsWith('/carrito') || p.startsWith('/checkout')) return 'carrito';
  if (p.startsWith('/servicios')) return 'servicios';
  if (p.startsWith('/proyectos')) return 'proyectos';
  if (p.startsWith('/nosotros')) return 'nosotros';
  if (p.startsWith('/contacto') || p.startsWith('/cotizador')) return 'contacto';
  if (p.startsWith('/blog')) return 'blog';
  return 'otras';
}

const clave = (id: string) => `popup:${id}`;
const leer = (almacen: Storage, id: string): { v: number; t: number } | null => {
  try { return JSON.parse(almacen.getItem(clave(id)) ?? 'null'); } catch { return null; }
};

/** ¿Corresponde mostrarlo según la frecuencia configurada y lo que este visitante ya vio? */
export function frecuenciaPermite(p: PopupPublico, ahora = Date.now()): boolean {
  try {
    if (p.frecuencia === 'siempre') return true;
    if (p.frecuencia === 'sesion') return !leer(sessionStorage, p.id) || leer(sessionStorage, p.id)!.v !== p.version;
    const visto = leer(localStorage, p.id);
    if (!visto || visto.v !== p.version) return true; // editado después de que lo vio: vuelve a salir
    if (p.frecuencia === 'una_vez') return false;
    const ms = p.frecuenciaValor * (p.frecuencia === 'horas' ? 3_600_000 : 86_400_000);
    return ahora - visto.t >= ms;
  } catch {
    return true; // almacenamiento bloqueado: mejor mostrarlo que perderlo
  }
}

export function marcarVisto(p: PopupPublico) {
  const dato = JSON.stringify({ v: p.version, t: Date.now() });
  try { sessionStorage.setItem(clave(p.id), dato); } catch { /* sin almacenamiento */ }
  try { localStorage.setItem(clave(p.id), dato); } catch { /* sin almacenamiento */ }
}

export function contarEvento(id: string, tipo: 'vista' | 'clic') {
  try {
    void fetch(`/api/hub/popups/${encodeURIComponent(id)}/evento`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo }), keepalive: true });
  } catch { /* el conteo nunca debe romper la página */ }
}
