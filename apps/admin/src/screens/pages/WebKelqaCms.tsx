'use client';
/*
 * FPTecnologi-HUB — CMS de la web de Kelqa (Web Kelqa → …). Mismo editor que Fimav (CmsEditor): secciones a la izquierda,
 * vista previa de kelqa.com a la derecha. Los valores por defecto y la forma de cada sección viven en la web de Kelqa
 * (apps/kelqa-web/src/lib/cms.ts); se guarda en la API con el marcaId de Kelqa. Solo con la marca Kelqa activa.
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
  titulo: `Kelqa · ${titulo}`,
  subtitulo: 'Edita los textos de kelqa.com. Los cambios se publican al guardar. Fotos, líneas de producto y datos de contacto se cambian en el código.',
  previewPath,
  conVisible: false,
  secciones,
});

const INICIO = base('inicio', 'Inicio', '/', [
  sec('hero', 'Portada', [T('etiqueta', 'Etiqueta sobre el título'), T('titulo', 'Título — parte blanca'), T('acento', 'Título — parte con brillo'), TA('texto', 'Texto')], 'inicio'),
  sec('quienes', 'Quiénes somos', [...TITULO, TA('texto', 'Primer párrafo'), TA('texto2', 'Segundo párrafo'), TA('mision', 'Misión (recuadro)'), TA('vision', 'Visión (recuadro)')], 'nosotros'),
  sec('porque', '¿Por qué Kelqa?', [...TITULO, TA('texto', 'Texto')]),
  sec('canales', 'Venta directa y licitaciones', [...TITULO, TA('texto', 'Texto'), T('boton', 'Texto del botón')]),
  sec('clientes', 'Clientes y testimonios', [...TITULO, {
    key: 'testimonios', label: 'Testimonios', tipo: 'lista-objetos', itemLabel: 'Testimonio', tituloDe: 'empresa',
    campos: [{ key: 'texto', label: 'Testimonio', tipo: 'textarea' }, { key: 'autor', label: 'Cargo o autor', tipo: 'text' }, { key: 'empresa', label: 'Empresa o sector', tipo: 'text' }],
  }], 'clientes'),
]);

const NOSOTROS = base('nosotros', 'Nosotros', '/nosotros', [
  sec('banner', 'Banner de la página', [T('titulo', 'Título — parte blanca'), T('acento', 'Título — parte con brillo'), TA('texto', 'Texto')]),
  sec('quienes', 'Quiénes somos', [...TITULO, TA('texto', 'Primer párrafo'), TA('texto2', 'Segundo párrafo'), TA('texto3', 'Tercer párrafo'), T('destacado', 'Recuadro oscuro — título'), T('destacadoTexto', 'Recuadro oscuro — texto')]),
  sec('mision', 'Misión y visión', [TA('mision', 'Misión'), TA('vision', 'Visión')]),
  sec('valores', 'Valores corporativos', [...TITULO, {
    key: 'items', label: 'Valores', tipo: 'lista-objetos', itemLabel: 'Valor', tituloDe: 'nombre',
    campos: [{ key: 'nombre', label: 'Nombre', tipo: 'text' }, { key: 'texto', label: 'Definición', tipo: 'textarea' }],
  }]),
  sec('propuesta', '¿Por qué escoger Kelqa?', [...TITULO, {
    key: 'items', label: 'Razones', tipo: 'lista-objetos', itemLabel: 'Razón', tituloDe: 'texto',
    campos: [{ key: 'texto', label: 'Texto', tipo: 'textarea' }],
  }]),
]);

const CONTACTO = base('contacto', 'Contacto', '/contacto', [
  sec('banner', 'Banner de la página', [T('titulo', 'Título — parte blanca'), T('acento', 'Título — parte con brillo'), TA('texto', 'Texto')]),
  sec('preguntas', 'Preguntas frecuentes', [...TITULO, {
    key: 'items', label: 'Preguntas', tipo: 'lista-objetos', itemLabel: 'Pregunta', tituloDe: 'p',
    campos: [{ key: 'p', label: 'Pregunta', tipo: 'text' }, { key: 'r', label: 'Respuesta', tipo: 'textarea' }],
  }]),
]);

/** El editor solo con la marca Kelqa activa: así nada se guarda por error en otra marca. */
function SoloKelqa({ config }: { config: CmsConfig }) {
  const { marcas, activeMarcaId, adminMode } = useAuth();
  const activa = marcas.find((m) => m.marcaId === activeMarcaId);
  if (adminMode || !activa || !/kelqa/i.test(activa.marca.nombre)) {
    return (
      <>
        <PageHead title={config.titulo} subtitle="Contenido de la web de Kelqa." />
        <div className="ax-card"><div className="ax-card__body"><p>Elige la marca <strong>Kelqa</strong> en el selector del menú para editar su web.</p></div></div>
      </>
    );
  }
  return <CmsEditor config={{ ...config, web: webDeMarca(activa.marca.nombre, activa.marca.dominioPrincipal) }} />;
}

export const KelqaInicioCms = () => <SoloKelqa config={INICIO} />;
export const KelqaNosotrosCms = () => <SoloKelqa config={NOSOTROS} />;
export const KelqaContactoCms = () => <SoloKelqa config={CONTACTO} />;
