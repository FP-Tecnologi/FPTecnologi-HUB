'use client';
/*
 * FPTecnologi-HUB — CMS de la web de Company IMC (Web IMC → …). Mismo editor que Fimav y Kelqa (CmsEditor): secciones a la
 * izquierda, vista previa de companyimc.com a la derecha. Los valores por defecto y la forma de cada sección viven en la
 * web (apps/imc-web/src/lib/cms.ts); se guarda en la API con el marcaId de IMC. Solo con la marca IMC activa.
 */
import { CmsEditor, type CmsConfig, type Seccion } from './WebHomeCms';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth } from '../../context/AuthContext';
import { webDeMarca } from '../../lib/webMarca';

type CampoDe = Seccion['campos'][number];
const T = (key: string, label: string, ayuda?: string): CampoDe => ({ key, label, tipo: 'text', ...(ayuda ? { ayuda } : {}) });
const TA = (key: string, label: string): CampoDe => ({ key, label, tipo: 'textarea' });
const sec = (key: string, nombre: string, campos: CampoDe[], ancla = ''): Seccion => ({ key, nombre, ancla, campos });

const base = (pagina: string, titulo: string, previewPath: string, secciones: Seccion[]): CmsConfig => ({
  pagina,
  titulo: `Company IMC · ${titulo}`,
  subtitulo: 'Edita los textos de companyimc.com. Los cambios se publican al guardar. Las fotos y logos se cambian en el código; el teléfono, WhatsApp, correo, dirección y horario, en «Ajustes del sitio».',
  previewPath,
  conVisible: false,
  secciones,
});

const INICIO = base('inicio', 'Inicio', '/', [
  sec('sobre', 'Sobre nosotros', [T('cita', 'Frase destacada'), TA('texto', 'Texto')]),
  sec('porque', '¿Por qué escogernos?', [TA('cita', 'Frase destacada'), {
    key: 'items', label: 'Motivos', tipo: 'lista-objetos', itemLabel: 'Motivo', tituloDe: 'texto',
    campos: [{ key: 'texto', label: 'Texto', tipo: 'textarea' }],
  }]),
]);

const CONTACTO = base('contacto', 'Contacto', '/contacto/', [
  sec('banner', 'Banner de la página', [T('etiqueta', 'Etiqueta (pequeña, arriba)'), T('titulo', 'Título — parte blanca'), T('acento', 'Título — parte con brillo'), TA('texto', 'Texto')]),
]);

const AJUSTES = base('ajustes', 'Ajustes del sitio', '/contacto/', [
  sec('contacto', 'Datos de contacto (toda la web)', [
    T('telefono', 'Teléfono', 'Como se muestra. Ej.: +51 984 262 805'),
    T('whatsapp', 'WhatsApp', 'Celular de 9 dígitos (sin +51). Lo usan el botón flotante, el pie y contacto.'),
    T('correo', 'Correo de ventas'),
    T('direccion', 'Dirección', 'En una sola línea.'),
    T('horario', 'Horario de atención'),
  ]),
]);

/** El editor solo con la marca IMC activa: así nada se guarda por error en otra marca. */
function SoloImc({ config }: { config: CmsConfig }) {
  const { marcas, activeMarcaId, adminMode } = useAuth();
  const activa = marcas.find((m) => m.marcaId === activeMarcaId);
  if (adminMode || !activa || !/imc/i.test(activa.marca.nombre)) {
    return (
      <>
        <PageHead title={config.titulo} subtitle="Contenido de la web de Company IMC." />
        <div className="ax-card"><div className="ax-card__body"><p>Elige la marca <strong>IMC</strong> en el selector del menú para editar su web.</p></div></div>
      </>
    );
  }
  return <CmsEditor config={{ ...config, web: webDeMarca(activa.marca.nombre, activa.marca.dominioPrincipal) }} />;
}

export const ImcInicioCms = () => <SoloImc config={INICIO} />;
export const ImcContactoCms = () => <SoloImc config={CONTACTO} />;
export const ImcAjustesCms = () => <SoloImc config={AJUSTES} />;
