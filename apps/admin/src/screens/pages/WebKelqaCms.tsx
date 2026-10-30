'use client';
/*
 * FPTecnologi-HUB — CMS de la web de Kelqa (Web Kelqa → …). Mismo editor que Fimav y FPTecnologi (CmsEditor): secciones
 * a la izquierda, vista previa de kelqa.com a la derecha. Los valores por defecto y la forma de cada sección viven en
 * la web de Kelqa (apps/kelqa-web/src/lib/cms.ts); se guarda en la API con el marcaId de Kelqa.
 * Solo se usa con la marca Kelqa activa (el menú no lo muestra en otras marcas y la pantalla lo vuelve a comprobar).
 */
import { CmsEditor, type CmsConfig, type Seccion } from './WebHomeCms';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth } from '../../context/AuthContext';
import { webDeMarca } from '../../lib/webMarca';

type CampoDe = Seccion['campos'][number];
const T = (key: string, label: string, ayuda?: string): CampoDe => ({ key, label, tipo: 'text', ...(ayuda ? { ayuda } : {}) });
const TA = (key: string, label: string, ayuda?: string): CampoDe => ({ key, label, tipo: 'textarea', ...(ayuda ? { ayuda } : {}) });
const IMG = (key: string, label: string): CampoDe => ({ key, label, tipo: 'imagen' });
const sec = (key: string, nombre: string, campos: CampoDe[], ancla = ''): Seccion => ({ key, nombre, ancla, campos });

/** Título de sección: etiqueta pequeña + parte oscura + parte con brillo turquesa. */
const TITULO = [T('etiqueta', 'Etiqueta (pequeña, arriba)'), T('claro', 'Título — parte oscura'), T('acento', 'Título — parte turquesa')];
const BANNER = sec('banner', 'Banner de la página', [T('miga', 'Miga de pan'), T('titulo', 'Título — parte blanca'), T('acento', 'Título — parte turquesa'), TA('texto', 'Texto'), IMG('foto', 'Foto de fondo')]);

const base = (pagina: string, titulo: string, previewPath: string, secciones: Seccion[]): CmsConfig => ({
  pagina,
  titulo: `Kelqa · ${titulo}`,
  subtitulo: 'Edita los textos e imágenes de kelqa.com. Los cambios se publican al guardar.',
  previewPath,
  conVisible: false,
  secciones,
});

const INICIO = base('inicio', 'Inicio', '/', [
  sec('hero', 'Banner principal', [
    T('etiqueta', 'Etiqueta (insignia)'), T('claro', 'Título — parte blanca'), T('acento', 'Título — parte con brillo'), TA('texto', 'Texto'),
    T('boton', 'Texto del botón (abre WhatsApp)'), IMG('imagen', 'Foto de fondo'),
    { key: 'puntos', label: 'Puntos bajo los botones (uno por línea)', tipo: 'lista-texto' },
  ]),
  sec('accesos', 'Recuadro de líneas (título)', [T('titulo', 'Título')]),
  sec('nosotros', 'Quiénes somos', [
    ...TITULO, TA('texto', 'Texto'), TA('texto2', 'Segundo párrafo'), IMG('imagen', 'Foto'), T('destacado', 'Frase del recuadro oscuro'),
    { key: 'valores', label: 'Valores (uno por línea)', tipo: 'lista-texto' }, TA('mision', 'Misión (resumen)'), TA('vision', 'Visión (resumen)'),
  ], 'nosotros'),
  sec('lineas', 'Líneas (título)', TITULO, 'lineas'),
  sec('porque', '¿Por qué Kelqa?', [
    ...TITULO, TA('intro', 'Introducción'), IMG('imagen', 'Foto'),
    {
      key: 'items', label: 'Razones', tipo: 'lista-objetos', itemLabel: 'Razón', tituloDe: 'titulo', fijo: true,
      ayuda: 'Son cuatro tarjetas con ícono fijo; aquí se editan su título y texto.',
      campos: [{ key: 'titulo', label: 'Título', tipo: 'text' }, { key: 'texto', label: 'Texto', tipo: 'textarea' }],
    },
  ]),
  sec('canales', 'Venta directa y licitaciones', [...TITULO, TA('texto', 'Texto'), T('boton', 'Texto del botón (abre WhatsApp)'), IMG('imagen', 'Foto')]),
  sec('testimonios', 'Testimonios', [
    ...TITULO,
    {
      key: 'items', label: 'Testimonios', tipo: 'lista-objetos', itemLabel: 'Testimonio', tituloDe: 'empresa',
      campos: [{ key: 'texto', label: 'Testimonio', tipo: 'textarea' }, { key: 'autor', label: 'Cargo / autor', tipo: 'text' }, { key: 'empresa', label: 'Empresa', tipo: 'text' }],
    },
  ]),
]);

const NOSOTROS = base('nosotros', 'Nosotros', '/nosotros', [
  BANNER,
  sec('quienes', 'Quiénes somos', [
    ...TITULO, TA('texto', 'Párrafo 1'), TA('texto2', 'Párrafo 2'), TA('texto3', 'Párrafo 3'), IMG('imagen', 'Foto'),
    T('destacado', 'Recuadro oscuro — frase'), T('destacado2', 'Recuadro oscuro — detalle'),
  ]),
  sec('mision', 'Misión', [TA('texto', 'Texto')]),
  sec('vision', 'Visión', [TA('texto', 'Texto')]),
  sec('valores', 'Valores', [
    ...TITULO,
    {
      key: 'items', label: 'Valores', tipo: 'lista-objetos', itemLabel: 'Valor', tituloDe: 'nombre', fijo: true,
      ayuda: 'Son cuatro tarjetas con ícono fijo; aquí se editan su nombre y definición.',
      campos: [{ key: 'nombre', label: 'Nombre', tipo: 'text' }, { key: 'texto', label: 'Definición', tipo: 'textarea' }],
    },
  ]),
  sec('propuesta', '¿Por qué escoger Kelqa?', [...TITULO, { key: 'items', label: 'Párrafos (uno por línea)', tipo: 'lista-texto' }]),
]);

const CONTACTO = base('contacto', 'Contacto', '/contacto', [
  BANNER,
  sec('canales', 'Canales', [...TITULO, T('aviso', 'Recuadro oscuro — frase en negrita'), TA('avisoTexto', 'Recuadro oscuro — texto')]),
  sec('formulario', 'Formulario', [T('titulo', 'Título')]),
  sec('preguntas', 'Preguntas frecuentes', [
    ...TITULO,
    {
      key: 'items', label: 'Preguntas', tipo: 'lista-objetos', itemLabel: 'Pregunta', tituloDe: 'p',
      campos: [{ key: 'p', label: 'Pregunta', tipo: 'text' }, { key: 'r', label: 'Respuesta', tipo: 'textarea' }],
    },
  ]),
]);

/** Una línea: textos, fotos y productos. El identificador (y la URL /lineas/…) es fijo. */
const camposLinea = (): CampoDe[] => [
  T('nombre', 'Nombre', 'Ej.: Línea de Pinturas. La última palabra va resaltada en el título de la página.'),
  T('corto', 'Nombre corto', 'Para migas de pan y menús.'),
  T('lema', 'Lema'),
  TA('texto', 'Descripción'),
  IMG('foto', 'Foto principal'),
  {
    key: 'galeria', label: 'Galería de fotos', tipo: 'lista-objetos', itemLabel: 'Foto', tituloDe: 'alt',
    ayuda: 'Las dos primeras fotos también aparecen junto a la introducción de la línea.',
    campos: [{ key: 'src', label: 'Foto', tipo: 'imagen' }, { key: 'alt', label: 'Descripción de la foto', tipo: 'text' }],
  },
  {
    key: 'productos', label: 'Productos', tipo: 'lista-objetos', itemLabel: 'Producto', tituloDe: 'nombre',
    campos: [
      { key: 'nombre', label: 'Nombre', tipo: 'text' }, { key: 'img', label: 'Foto del producto', tipo: 'imagen' },
      { key: 'detalle', label: 'Resumen (una frase)', tipo: 'text' }, { key: 'descripcion', label: 'Descripción', tipo: 'textarea' },
    ],
  },
];
const LINEAS = base('lineas', 'Líneas de producto', '/lineas/pinturas', [
  sec('pinturas', 'Línea de Pinturas', camposLinea()),
  sec('mobiliario', 'Línea de Mobiliario', camposLinea()),
  sec('construccion', 'Construcción y Emergencia', camposLinea()),
]);

const AJUSTES = base('ajustes', 'Ajustes del sitio', '/contacto', [
  sec('contacto', 'Datos de contacto (toda la web)', [
    T('telefono', 'Teléfono', 'Como se muestra. Ej.: +51 933 819 389'),
    T('whatsapp', 'WhatsApp', 'Número con código de país y solo dígitos. Ej.: 51933819389. Lo usan todos los botones de WhatsApp.'),
    T('correo', 'Correo'),
    T('redes', 'Usuario en redes sociales', 'Ej.: @Kelqa'),
  ]),
  sec('pie', 'Pie de página', [TA('frase', 'Frase bajo el logo')]),
  sec('clientes', 'Clientes', [T('titulo', 'Texto sobre los logos de clientes')]),
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
export const KelqaLineasCms = () => <SoloKelqa config={LINEAS} />;
export const KelqaContactoCms = () => <SoloKelqa config={CONTACTO} />;
export const KelqaAjustesCms = () => <SoloKelqa config={AJUSTES} />;
