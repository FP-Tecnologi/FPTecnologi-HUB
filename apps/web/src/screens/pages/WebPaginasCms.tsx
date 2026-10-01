'use client';
/*
 * FPTecnologi-HUB — CMS de las páginas internas de la web informativa (Web
 * informativa → Nosotros / Servicios / Proyectos / Contacto). Reusa el editor
 * de la home (CmsEditor): secciones a la izquierda, formulario del texto y vista
 * previa de la web real a la derecha. Los valores por defecto y la forma de cada
 * sección viven en la web (web-fptecnologi/src/lib/paginasContenido.ts).
 */
import { CmsEditor, type CmsConfig, type Seccion } from './WebHomeCms';

const BADGE = { key: 'badge', label: 'Etiqueta (badge)', tipo: 'text' } as const;
const TITULO = { key: 'titulo', label: 'Título — parte en color sólido', tipo: 'text' } as const;
const DESTACADO = { key: 'destacado', label: 'Título — parte con brillo', tipo: 'text' } as const;
const DESCRIPCION = { key: 'descripcion', label: 'Descripción', tipo: 'textarea' } as const;

const ENCABEZADO = [BADGE, TITULO, DESTACADO, DESCRIPCION];
const HERO = (nombre = 'Encabezado de la página'): Seccion => ({ key: 'hero', nombre, ancla: '', campos: ENCABEZADO });

const base = (pagina: string, titulo: string, previewPath: string, secciones: Seccion[]): CmsConfig => ({
  pagina,
  titulo,
  subtitulo: 'Edita los textos de cada sección de la página. Los cambios se publican al guardar.',
  previewPath,
  conVisible: false,
  secciones,
});

const NOSOTROS = base('nosotros', 'Nosotros', '/nosotros', [
  HERO(),
  { key: 'quienes', nombre: 'Quiénes somos', ancla: '', campos: [BADGE, TITULO, DESTACADO, { key: 'parrafos', label: 'Párrafos', tipo: 'lista-texto' }] },
  {
    key: 'proposito',
    nombre: 'Misión, visión y valores',
    ancla: '',
    campos: [BADGE, TITULO, DESTACADO, { key: 'items', label: 'Tarjetas (título + texto)', tipo: 'lista-items', itemLabel: 'Tarjeta' }],
  },
]);

const SERVICIOS = base('servicios', 'Servicios', '/servicios', [
  HERO(),
  { key: 'listado', nombre: 'Listado de servicios', ancla: '', campos: ENCABEZADO },
]);

const PROYECTOS = base('proyectos', 'Proyectos', '/proyectos', [HERO()]);

const CONTACTO = base('contacto', 'Contacto', '/contacto', [
  HERO(),
  { key: 'asesores', nombre: 'Asesores por área', ancla: '', campos: [BADGE, TITULO, DESTACADO] },
  {
    key: 'visita',
    nombre: 'Visítanos (oficina y horario)',
    ancla: '',
    campos: [BADGE, TITULO, DESTACADO, { key: 'horario', label: 'Horario de atención', tipo: 'text' }],
  },
]);

export function WebNosotrosCms() {
  return <CmsEditor config={NOSOTROS} />;
}
export function WebServiciosCms() {
  return <CmsEditor config={SERVICIOS} />;
}
export function WebProyectosCms() {
  return <CmsEditor config={PROYECTOS} />;
}
export function WebContactoCms() {
  return <CmsEditor config={CONTACTO} />;
}
