'use client';
/*
 * FPTecnologi-HUB — CMS de la web de Fimav Perú (Web Fimav → …). Mismo editor que la web de FPTecnologi (CmsEditor):
 * secciones a la izquierda, vista previa de fimavperu.com a la derecha. Los valores por defecto y la forma de cada
 * sección viven en la web de Fimav (apps/fimav-web/src/lib/cms.ts); se guarda en la API con el marcaId de Fimav.
 * Solo se usa con la marca Fimav activa (el menú no lo muestra en otras marcas y la pantalla lo vuelve a comprobar).
 */
import { CmsEditor, type CmsConfig, type Seccion } from './WebHomeCms';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth } from '../../context/AuthContext';

const WEB_FIMAV = process.env.NEXT_PUBLIC_WEB_FIMAV_URL ?? 'http://localhost:3005';

type CampoDe = Seccion['campos'][number];
const T = (key: string, label: string, ayuda?: string): CampoDe => ({ key, label, tipo: 'text', ...(ayuda ? { ayuda } : {}) });
const TA = (key: string, label: string, ayuda?: string): CampoDe => ({ key, label, tipo: 'textarea', ...(ayuda ? { ayuda } : {}) });
const IMG = (key: string, label: string): CampoDe => ({ key, label, tipo: 'imagen' });

/** Título con el estilo de la web: sobretítulo pequeño + parte gris + parte roja. */
const TITULO = [T('eyebrow', 'Sobretítulo (pequeño, arriba)'), T('claro', 'Título — parte gris'), T('rojo', 'Título — parte roja')];
const BANNER: Seccion = {
  key: 'banner',
  nombre: 'Banner de la página',
  ancla: '',
  campos: [T('eyebrow', 'Etiqueta (y miga de pan)'), T('titulo', 'Título — parte blanca'), T('resaltado', 'Título — parte roja'), IMG('imagen', 'Foto de fondo')],
};
const sec = (key: string, nombre: string, campos: CampoDe[], ancla = ''): Seccion => ({ key, nombre, ancla, campos });

const base = (pagina: string, titulo: string, previewPath: string, secciones: Seccion[]): CmsConfig => ({
  pagina,
  titulo: `Fimav · ${titulo}`,
  subtitulo: 'Edita los textos e imágenes de fimavperu.com. Los cambios se publican al guardar.',
  previewPath,
  conVisible: false,
  web: WEB_FIMAV,
  secciones,
});

const INICIO = base('inicio', 'Inicio', '/', [
  sec('hero', 'Banner principal (diapositivas)', [{
    key: 'slides', label: 'Diapositivas', tipo: 'lista-objetos', itemLabel: 'Diapositiva', tituloDe: 'rojo',
    ayuda: 'Cada diapositiva: título (gris + rojo), subtítulo y texto del recuadro, foto de fondo, dos fotos hexagonales y hasta dos botones (si un botón no tiene texto o enlace, no se muestra).',
    campos: [
      { key: 'claro', label: 'Título — parte blanca', tipo: 'text' },
      { key: 'rojo', label: 'Título — parte roja', tipo: 'text' },
      { key: 'subtitulo', label: 'Subtítulo del recuadro', tipo: 'text' },
      { key: 'texto', label: 'Texto del recuadro', tipo: 'textarea' },
      { key: 'fondo', label: 'Foto de fondo', tipo: 'imagen' },
      { key: 'imagenIzquierda', label: 'Foto hexagonal izquierda', tipo: 'imagen' },
      { key: 'imagenDerecha', label: 'Foto hexagonal derecha', tipo: 'imagen' },
      { key: 'boton1Texto', label: 'Botón principal — texto', tipo: 'text' },
      { key: 'boton1Url', label: 'Botón principal — enlace', tipo: 'text', ayuda: 'Ej. /cotizar, /catalogo, /peru-compras' },
      { key: 'boton2Texto', label: 'Botón secundario — texto', tipo: 'text' },
      { key: 'boton2Url', label: 'Botón secundario — enlace', tipo: 'text' },
    ],
  }]),
  sec('nosotros', 'Sobre nosotros', [...TITULO, TA('texto', 'Texto'), IMG('imagen', 'Foto')], 'sobre-nosotros'),
  sec('categorias', 'Categorías (título)', TITULO),
  sec('perucompras', 'Perú Compras', [...TITULO, T('subtitulo', 'Subtítulo (junto al ícono)'), TA('texto', 'Texto'), IMG('imagen', 'Foto'), T('franja', 'Texto de la franja roja'), T('boton', 'Texto del botón')]),
  sec('porque', '¿Por qué escogernos?', [...TITULO, TA('intro', 'Introducción'), { key: 'items', label: 'Razones (una por línea)', tipo: 'lista-texto' }, IMG('imagen', 'Foto')]),
  sec('marcas', 'Marcas aliadas (título)', TITULO),
]);

const NOSOTROS = base('nosotros', 'Nosotros', '/nosotros', [
  BANNER,
  sec('quienes', 'Quiénes somos', [...TITULO, TA('texto', 'Texto')]),
  sec('mision', 'Misión', [...TITULO, TA('texto', 'Texto')]),
  sec('vision', 'Visión', [...TITULO, TA('texto', 'Texto')]),
  sec('porque', '¿Por qué escogernos?', [...TITULO, { key: 'items', label: 'Razones (una por línea)', tipo: 'lista-texto' }]),
]);

const CATALOGO = base('catalogo', 'Catálogo', '/catalogo', [
  BANNER,
  sec('categorias', 'Categorías', [{
    key: 'items', label: 'Categorías', tipo: 'lista-objetos', itemLabel: 'Categoría', tituloDe: 'nombre', fijo: true,
    ayuda: 'Las categorías y su dirección en la web (/catalogo/…) son fijas; aquí se editan su nombre, descripción, marcas y fotos. El nombre también aparece en el formulario de cotizar.',
    campos: [
      { key: 'nombre', label: 'Nombre', tipo: 'text' },
      { key: 'resumen', label: 'Descripción', tipo: 'textarea' },
      { key: 'marcas', label: 'Marcas', tipo: 'text', ayuda: 'Separadas por comas. Ej.: Lenovo, HP, Dell' },
      { key: 'foto1', label: 'Foto 1 (también es el banner de la categoría)', tipo: 'imagen' },
      { key: 'foto2', label: 'Foto 2', tipo: 'imagen' },
      { key: 'foto3', label: 'Foto 3', tipo: 'imagen' },
    ],
  }]),
]);

const PERU_COMPRAS = base('peru-compras', 'Perú Compras', '/peru-compras', [
  BANNER,
  sec('sector', 'Sector Estatal', [T('subtitulo', 'Subtítulo (junto al ícono)'), TA('texto', 'Primer párrafo'), TA('texto2', 'Segundo párrafo (vacío = no se muestra)'), IMG('imagen', 'Foto')]),
  sec('trabajo', 'Cómo trabajamos', [...TITULO, { key: 'items', label: 'Tarjetas (título + texto)', tipo: 'lista-items', itemLabel: 'Tarjeta' }]),
  sec('categorias', 'Categorías (título)', TITULO),
  sec('marcas', 'Marcas (título)', TITULO),
]);

const CONTACTO = base('contacto', 'Contacto', '/contacto', [
  BANNER,
  sec('datos', 'Datos de contacto (título)', TITULO),
  sec('mapa', 'Cómo llegar', [...TITULO, T('direccionMapa', 'Dirección que se busca en el mapa', 'Vacío = la dirección de Ajustes')]),
  sec('formulario', 'Formulario (título)', TITULO),
]);

const COTIZAR = base('cotizar', 'Cotizar', '/cotizar', [BANNER, sec('asesor', 'Recuadro «hablar con un asesor»', [T('titulo', 'Título')])]);

const AJUSTES = base('ajustes', 'Ajustes del sitio', '/contacto', [
  sec('contacto', 'Datos de contacto (toda la web)', [
    T('direccion', 'Dirección'),
    T('telefono', 'Teléfono', 'Como se muestra. Ej.: 01 397-9527'),
    T('whatsapp', 'WhatsApp', 'Celular de 9 dígitos. Lo usan el botón flotante, contacto y cotizar.'),
    T('ventas', 'Correo de ventas'),
    T('comercial', 'Correo comercial'),
  ]),
  sec('redes', 'Redes sociales (pie de página)', [T('facebook', 'Facebook', 'URL completa (https://…). Vacío = ícono sin enlace'), T('instagram', 'Instagram', 'URL completa (https://…). Vacío = ícono sin enlace')]),
  sec('pie', 'Pie de página', [TA('fraseCorta', 'Frase bajo el logo')]),
  sec('cta', 'Bloque «Cotiza con Fimav Perú» (sobre el pie)', [...TITULO, T('boton', 'Texto del botón')]),
]);

const LEGAL_CAMPOS = [T('titulo', 'Título'), TA('texto', 'Texto completo', 'Cada subtítulo empieza con «## »; los párrafos se separan con una línea en blanco.')];
const LEGALES = base('legal', 'Textos legales', '/legal/privacidad', [
  sec('privacidad', 'Política de privacidad', LEGAL_CAMPOS),
  sec('terminos', 'Términos y condiciones', LEGAL_CAMPOS),
  sec('devoluciones', 'Devoluciones y cambios', LEGAL_CAMPOS),
  sec('preguntas-frecuentes', 'Preguntas frecuentes', LEGAL_CAMPOS),
]);

/** El editor solo con la marca Fimav activa: así nada se guarda por error en otra marca. */
function SoloFimav({ config }: { config: CmsConfig }) {
  const { marcas, activeMarcaId, adminMode } = useAuth();
  const activa = marcas.find((m) => m.marcaId === activeMarcaId);
  if (adminMode || !activa || !/fimav/i.test(activa.marca.nombre)) {
    return (
      <>
        <PageHead title={config.titulo} subtitle="Contenido de la web de Fimav Perú." />
        <div className="ax-card"><div className="ax-card__body"><p>Elige la marca <strong>Fimav Perú</strong> en el selector del menú para editar su web.</p></div></div>
      </>
    );
  }
  return <CmsEditor config={config} />;
}

export const FimavInicioCms = () => <SoloFimav config={INICIO} />;
export const FimavNosotrosCms = () => <SoloFimav config={NOSOTROS} />;
export const FimavCatalogoCms = () => <SoloFimav config={CATALOGO} />;
export const FimavPeruComprasCms = () => <SoloFimav config={PERU_COMPRAS} />;
export const FimavContactoCms = () => <SoloFimav config={CONTACTO} />;
export const FimavCotizarCms = () => <SoloFimav config={COTIZAR} />;
export const FimavAjustesCms = () => <SoloFimav config={AJUSTES} />;
export const FimavLegalesCms = () => <SoloFimav config={LEGALES} />;
