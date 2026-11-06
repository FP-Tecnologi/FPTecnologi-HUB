'use client';
/*
 * FPTecnologi-HUB — CMS de la web de Imaninki (Web Imaninki → …). Mismo editor que Fimav (CmsEditor): secciones a la izquierda,
 * vista previa de imaninki.com a la derecha. Los valores por defecto y la forma de cada sección viven en la web de Imaninki
 * (apps/imaninki-web/src/lib/cms.ts); se guarda en la API con el marcaId de Imaninki. Solo con la marca Imaninki activa.
 */
import { CmsEditor, type CmsConfig, type Seccion } from './WebHomeCms';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth } from '../../context/AuthContext';
import { webDeMarca } from '../../lib/webMarca';

type CampoDe = Seccion['campos'][number];
const T = (key: string, label: string): CampoDe => ({ key, label, tipo: 'text' });
const TA = (key: string, label: string): CampoDe => ({ key, label, tipo: 'textarea' });
const sec = (key: string, nombre: string, campos: CampoDe[], ancla = ''): Seccion => ({ key, nombre, ancla, campos });

/** Título de la web: etiqueta pequeña + parte sólida + parte con brillo turquesa. */
const TITULO = [T('etiqueta', 'Etiqueta (pequeña, arriba)'), T('titulo', 'Título — parte sólida'), T('acento', 'Título — parte turquesa')];

const base = (pagina: string, titulo: string, previewPath: string, secciones: Seccion[]): CmsConfig => ({
  pagina,
  titulo: `Imaninki · ${titulo}`,
  subtitulo: 'Edita los textos de imaninki.com. Los cambios se publican al guardar. Fotos, líneas de producto y datos de contacto se cambian en el código.',
  previewPath,
  conVisible: false,
  secciones,
});

const INICIO = base('inicio', 'Inicio', '/', [
  sec('hero', 'Portada', [T('etiqueta', 'Etiqueta sobre el título'), T('titulo', 'Título — parte blanca'), T('acento', 'Título — parte con brillo'), TA('texto', 'Texto')], 'inicio'),
  sec('quienes', 'Quiénes somos', [...TITULO, TA('texto', 'Primer párrafo'), TA('texto2', 'Segundo párrafo'), TA('mision', 'Misión (recuadro)'), TA('vision', 'Visión (recuadro)')], 'nosotros'),
  sec('porque', '¿Por qué Imaninki?', [...TITULO, TA('texto', 'Texto')]),
  sec('canales', 'Venta directa y licitaciones', [...TITULO, TA('texto', 'Texto'), T('boton', 'Texto del botón')]),
  sec('clientes', 'Clientes y testimonios', [...TITULO, {
    key: 'testimonios', label: 'Testimonios', tipo: 'lista-objetos', itemLabel: 'Testimonio', tituloDe: 'empresa',
    campos: [{ key: 'texto', label: 'Testimonio', tipo: 'textarea' }, { key: 'autor', label: 'Cargo o autor', tipo: 'text' }, { key: 'empresa', label: 'Empresa o sector', tipo: 'text' }],
  }], 'clientes'),
]);

const NOSOTROS = base('nosotros', 'Nosotros', '/nosotros', [
  sec('banner', 'Banner de la página', [T('titulo', 'Título — parte blanca'), T('acento', 'Título — parte con brillo'), TA('texto', 'Texto')]),
  sec('mision', 'Misión y visión', [TA('mision', 'Misión'), TA('vision', 'Visión')]),
  sec('valores', 'Valores', [...TITULO, {
    key: 'items', label: 'Valores', tipo: 'lista-objetos', itemLabel: 'Valor', tituloDe: 'nombre',
    campos: [{ key: 'nombre', label: 'Nombre', tipo: 'text' }, { key: 'texto', label: 'Definición', tipo: 'textarea' }],
  }]),
  sec('listos', '¡Estamos listos! (cierre negro)', [TA('texto', 'Mensaje principal'), TA('texto2', 'Franja inferior — primera parte'), TA('texto3', 'Franja inferior — segunda parte')]),
]);

const CATALOGOS = base('catalogos', 'Catálogos', '/catalogos', [
  sec('banner', 'Banner de la página', [T('titulo', 'Título — parte blanca'), T('acento', 'Título — parte con brillo'), TA('texto', 'Texto')]),
  sec('lista', 'Catálogos en PDF', [{ key: 'items', label: 'Catálogos', tipo: 'lista-pdf', itemLabel: 'Catálogo', ayuda: 'Sube el PDF de cada catálogo; en la web se muestra como una tarjeta para ver o descargar. Cuando hay al menos uno, aparece el enlace «Catálogos (PDF)» en el pie de página.' }]),
]);

const LEGALES = base('legal', 'Textos legales', '/legal/privacidad', [
  sec('estado', 'Publicación', [{ key: 'publicado', label: 'Publicar textos legales', tipo: 'bool', ayuda: 'Los textos son un BORRADOR basado en los de Fimav: revísalos (idealmente con tu asesor legal) antes de activar. Mientras esté apagado, las páginas no existen en la web ni aparecen en el pie.' }]),
  sec('privacidad', 'Política de privacidad', [T('titulo', 'Título'), { ...TA('texto', 'Texto'), ayuda: 'Párrafos separados por una línea en blanco. «## Título» = subtítulo. Marcadores: {{titular}} (razón social, RUC y domicilio de Admin → Marcas), {{correo}} y {{telefono}}.' } as CampoDe]),
  sec('terminos', 'Términos y condiciones', [T('titulo', 'Título'), TA('texto', 'Texto')]),
  sec('devoluciones', 'Devoluciones y cambios', [T('titulo', 'Título'), TA('texto', 'Texto')]),
]);

const CONTACTO = base('contacto', 'Contacto', '/contacto', [
  sec('banner', 'Banner de la página', [T('titulo', 'Título — parte blanca'), T('acento', 'Título — parte con brillo'), TA('texto', 'Texto')]),
  sec('preguntas', 'Preguntas frecuentes', [...TITULO, {
    key: 'items', label: 'Preguntas', tipo: 'lista-objetos', itemLabel: 'Pregunta', tituloDe: 'p',
    campos: [{ key: 'p', label: 'Pregunta', tipo: 'text' }, { key: 'r', label: 'Respuesta', tipo: 'textarea' }],
  }]),
]);

/** El editor solo con la marca Imaninki activa: así nada se guarda por error en otra marca. */
function SoloImaninki({ config }: { config: CmsConfig }) {
  const { marcas, activeMarcaId, adminMode } = useAuth();
  const activa = marcas.find((m) => m.marcaId === activeMarcaId);
  if (adminMode || !activa || !/imaninki/i.test(activa.marca.nombre)) {
    return (
      <>
        <PageHead title={config.titulo} subtitle="Contenido de la web de Imaninki." />
        <div className="ax-card"><div className="ax-card__body"><p>Elige la marca <strong>Imaninki</strong> en el selector del menú para editar su web.</p></div></div>
      </>
    );
  }
  return <CmsEditor config={{ ...config, web: webDeMarca(activa.marca.nombre, activa.marca.dominioPrincipal) }} />;
}

export const ImaninkiInicioCms = () => <SoloImaninki config={INICIO} />;
export const ImaninkiNosotrosCms = () => <SoloImaninki config={NOSOTROS} />;
export const ImaninkiCatalogosCms = () => <SoloImaninki config={CATALOGOS} />;
export const ImaninkiLegalesCms = () => <SoloImaninki config={LEGALES} />;
export const ImaninkiContactoCms = () => <SoloImaninki config={CONTACTO} />;
