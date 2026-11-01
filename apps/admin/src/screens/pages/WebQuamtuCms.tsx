'use client';
/*
 * FPTecnologi-HUB — CMS de la web de Quamtu (Web Quamtu → Inicio). Mismo editor que Fimav y Kelqa (CmsEditor): secciones
 * a la izquierda, vista previa de quamtu.com a la derecha. Los valores por defecto y la forma de cada sección viven en
 * la web (apps/quamtu-web/src/lib/cms.ts); se guarda en la API con el marcaId de Quamtu. Solo con la marca Quamtu activa.
 */
import { CmsEditor, type CmsConfig, type Seccion } from './WebHomeCms';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth } from '../../context/AuthContext';
import { webDeMarca } from '../../lib/webMarca';

type CampoDe = Seccion['campos'][number];
const T = (key: string, label: string): CampoDe => ({ key, label, tipo: 'text' });
const TA = (key: string, label: string): CampoDe => ({ key, label, tipo: 'textarea' });
const sec = (key: string, nombre: string, campos: CampoDe[], ancla = ''): Seccion => ({ key, nombre, ancla, campos });

const INICIO: CmsConfig = {
  pagina: 'inicio',
  titulo: 'Quamtu · Inicio',
  subtitulo: 'Edita los textos de quamtu.com. Los cambios se publican al guardar. El catálogo de piezas, precios y casos de éxito se cambian en el código.',
  previewPath: '/',
  conVisible: false,
  secciones: [
    sec('hero', 'Portada', [T('etiqueta', 'Etiqueta sobre el título'), T('titulo', 'Título — inicio'), T('acento', 'Título — parte con brillo'), T('cierre', 'Título — final'), TA('texto', 'Texto')]),
    sec('organizaciones', 'Para empresas e instituciones', [T('titulo', 'Título — inicio'), T('acento', 'Título — parte con brillo'), TA('texto', 'Texto'), {
      key: 'items', label: 'Ventajas', tipo: 'lista-objetos', itemLabel: 'Ventaja', tituloDe: 't',
      campos: [{ key: 't', label: 'Título', tipo: 'text' }, { key: 'd', label: 'Descripción', tipo: 'textarea' }],
    }], 'organizaciones'),
    sec('faq', 'Preguntas frecuentes', [{
      key: 'preguntas', label: 'Preguntas', tipo: 'lista-objetos', itemLabel: 'Pregunta', tituloDe: 'p',
      campos: [{ key: 'p', label: 'Pregunta', tipo: 'text' }, { key: 'r', label: 'Respuesta', tipo: 'textarea' }],
    }]),
  ],
};

/** El editor solo con la marca Quamtu activa: así nada se guarda por error en otra marca. */
function SoloQuamtu({ config }: { config: CmsConfig }) {
  const { marcas, activeMarcaId, adminMode } = useAuth();
  const activa = marcas.find((m) => m.marcaId === activeMarcaId);
  if (adminMode || !activa || !/quamtu/i.test(activa.marca.nombre)) {
    return (
      <>
        <PageHead title={config.titulo} subtitle="Contenido de la web de Quamtu." />
        <div className="ax-card"><div className="ax-card__body"><p>Elige la marca <strong>Quamtu</strong> en el selector del menú para editar su web.</p></div></div>
      </>
    );
  }
  return <CmsEditor config={{ ...config, web: webDeMarca(activa.marca.nombre, activa.marca.dominioPrincipal) }} />;
}

export const QuamtuInicioCms = () => <SoloQuamtu config={INICIO} />;
