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

const T = (key: string, label: string, ayuda?: string) => ({ key, label, tipo: 'text', ayuda }) as const;

const AJUSTES = base('sitio', 'Ajustes del sitio', '/contacto', [
  {
    key: 'contacto',
    nombre: 'Datos de contacto y WhatsApp',
    ancla: '',
    campos: [
      T('direccion', 'Dirección'),
      T('telefonoVentas', 'Teléfono de ventas'),
      T('telefonoWeb', 'Teléfono de ventas web'),
      T('correo', 'Correo de ventas'),
      T('whatsapp', 'WhatsApp general (con código de país)', 'Solo números, ej. 51908856286. Lo usan los botones de WhatsApp de toda la web. El horario se edita en Contacto → Visítanos.'),
    ],
  },
  {
    key: 'redes',
    nombre: 'Redes sociales',
    ancla: '',
    campos: [T('facebook', 'Facebook (URL)', 'Vacío = no se muestra'), T('instagram', 'Instagram (URL)'), T('linkedin', 'LinkedIn (URL)'), T('youtube', 'YouTube (URL)')],
  },
  {
    key: 'cifras',
    nombre: 'Cifras de la empresa',
    ancla: '',
    campos: [{ key: 'items', label: 'Cifras (título = número, ej. 13+; texto = descripción)', tipo: 'lista-items', itemLabel: 'Cifra' }],
  },
  { key: 'cambio', nombre: 'Tipo de cambio', ancla: '', campos: [T('tipoCambio', 'Soles por dólar (USD → PEN)', 'Se usa al mostrar precios en soles. Ej. 3.75')] },
]);

const LEGAL_CAMPOS = [
  T('resumen', 'Resumen (bajo el título)', 'Vacío = el texto base'),
  T('actualizado', 'Fecha de actualización', 'Ej. 1 de octubre de 2026'),
  { key: 'contenido', label: 'Texto completo', tipo: 'textarea', ayuda: 'Cada sección empieza con una línea «## Título»; los párrafos van separados por una línea en blanco. Vacío = se usa el texto base.' },
] as const;
const LEGAL = base('legal', 'Textos legales', '/legal/privacidad', [
  { key: 'privacidad', nombre: 'Política de privacidad', ancla: '', campos: [...LEGAL_CAMPOS] },
  { key: 'terminos', nombre: 'Términos y condiciones', ancla: '', campos: [...LEGAL_CAMPOS] },
  { key: 'devoluciones', nombre: 'Cambios y devoluciones', ancla: '', campos: [...LEGAL_CAMPOS] },
]);

const SEO_CAMPOS = [T('titulo', 'Título en Google', 'Vacío = el de la página. Ideal: hasta 60 caracteres'), { key: 'descripcion', label: 'Descripción en Google', tipo: 'textarea', ayuda: 'Ideal: hasta 155 caracteres' }] as const;
const SEO = base('seo', 'SEO por página', '/', [
  ['home', 'Inicio'], ['nosotros', 'Nosotros'], ['servicios', 'Servicios'], ['proyectos', 'Proyectos'], ['contacto', 'Contacto'], ['tienda', 'Tienda'], ['cotizador', 'Cotizador'], ['blog', 'Blog'],
].map(([key, nombre]) => ({ key, nombre, ancla: '', campos: [...SEO_CAMPOS] })));

export function WebAjustesCms() {
  return <CmsEditor config={AJUSTES} />;
}
export function WebLegalCms() {
  return <CmsEditor config={LEGAL} />;
}
export function WebSeoCms() {
  return <CmsEditor config={SEO} />;
}
