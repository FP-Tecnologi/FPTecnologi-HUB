/*
 * Modelo de los popups de la web pública: plantillas (qué se anuncia), formatos (cómo se muestra), disparadores,
 * frecuencias y páginas. También las funciones que LIMPIAN el contenido que llega del editor (el JSON se guarda
 * y se pinta en la web, así que se recorta a una lista blanca de claves, largos y enlaces seguros) y deciden si un
 * popup está vigente. Única fuente de verdad: el dashboard pide plantillas y opciones a la API.
 */

export const PLANTILLAS_POPUP = ['aviso', 'promocion', 'descuento', 'evento', 'producto'] as const;
export type PlantillaPopup = (typeof PLANTILLAS_POPUP)[number];

export const FORMATOS_POPUP = ['modal', 'esquina', 'barra'] as const;
export const DISPARADORES = ['carga', 'retraso', 'scroll', 'salida'] as const;
export const FRECUENCIAS = ['siempre', 'sesion', 'una_vez', 'horas', 'dias'] as const;
export const DISPOSITIVOS = ['todos', 'escritorio', 'movil'] as const;
export const ACCIONES = ['ninguna', 'url', 'producto', 'whatsapp'] as const;
export const TEMAS = ['azul', 'oscuro', 'claro', 'acento'] as const;

/** Claves de página que reconoce la web (ver `paginaDe` en web-fptecnologi/src/lib/popups.ts). */
export const PAGINAS_POPUP = [
  ['home', 'Inicio'],
  ['tienda', 'Tienda / catálogo'],
  ['producto', 'Ficha de producto'],
  ['carrito', 'Carrito y checkout'],
  ['servicios', 'Servicios'],
  ['proyectos', 'Proyectos'],
  ['nosotros', 'Nosotros'],
  ['contacto', 'Contacto y cotizador'],
  ['blog', 'Blog'],
  ['otras', 'Otras páginas'],
] as const;
export const CLAVES_PAGINA = [...PAGINAS_POPUP.map(([k]) => k), 'todas'] as string[];

export interface ContenidoPopup {
  etiqueta: string; // sello corto sobre el título: "Oferta por tiempo limitado"
  titulo: string;
  texto: string;
  imagenUrl: string;
  descuento: string; // "-20%" (plantilla descuento)
  codigo: string; // cupón (plantilla descuento)
  fecha: string; // texto libre (plantilla evento)
  lugar: string; // plantilla evento
  botonTexto: string;
  accion: (typeof ACCIONES)[number];
  url: string; // acción "url": https://… o /ruta
  whatsappTexto: string; // acción "whatsapp"
  cerrarTexto: string; // enlace secundario: "No, gracias" (vacío = solo la X)
  tema: (typeof TEMAS)[number];
}

export interface PlantillaDef {
  id: PlantillaPopup;
  nombre: string;
  descripcion: string;
  usa: ('imagen' | 'descuento' | 'codigo' | 'fechaLugar' | 'producto')[];
  formato: (typeof FORMATOS_POPUP)[number];
  contenido: ContenidoPopup;
}

const base: ContenidoPopup = {
  etiqueta: '',
  titulo: '',
  texto: '',
  imagenUrl: '',
  descuento: '',
  codigo: '',
  fecha: '',
  lugar: '',
  botonTexto: 'Ver más',
  accion: 'ninguna',
  url: '',
  whatsappTexto: '',
  cerrarTexto: 'No, gracias',
  tema: 'azul',
};

export const PLANTILLAS: PlantillaDef[] = [
  {
    id: 'aviso',
    nombre: 'Aviso',
    descripcion: 'Un mensaje corto: horarios, feriados, mantenimiento, comunicados.',
    usa: [],
    formato: 'modal',
    contenido: { ...base, etiqueta: 'Aviso', titulo: 'Aviso importante', texto: '', botonTexto: 'Entendido', cerrarTexto: '' },
  },
  {
    id: 'promocion',
    nombre: 'Promoción',
    descripcion: 'Campaña de temporada u oferta con imagen y botón a una página.',
    usa: ['imagen'],
    formato: 'modal',
    contenido: { ...base, etiqueta: 'Promoción', titulo: 'Equipa tu empresa con tecnología', texto: 'Aprovecha nuestras ofertas por tiempo limitado.', botonTexto: 'Ver ofertas', accion: 'url', url: '/tienda' },
  },
  {
    id: 'descuento',
    nombre: 'Descuento con cupón',
    descripcion: 'Porcentaje o monto de descuento con código para copiar.',
    usa: ['imagen', 'descuento', 'codigo'],
    formato: 'modal',
    contenido: { ...base, etiqueta: 'Descuento exclusivo', titulo: 'Ahorra en tu primera compra', texto: 'Usa este código al finalizar tu pedido.', descuento: '-10%', codigo: 'BIENVENIDO10', botonTexto: 'Ir a la tienda', accion: 'url', url: '/tienda', tema: 'acento' },
  },
  {
    id: 'evento',
    nombre: 'Evento',
    descripcion: 'Webinar, feria o lanzamiento con fecha, lugar y registro.',
    usa: ['imagen', 'fechaLugar'],
    formato: 'modal',
    contenido: { ...base, etiqueta: 'Evento', titulo: 'Te invitamos a nuestro evento', texto: '', fecha: '', lugar: '', botonTexto: 'Quiero participar', accion: 'url', url: '/contacto', tema: 'oscuro' },
  },
  {
    id: 'producto',
    nombre: 'Producto destacado',
    descripcion: 'Muestra un producto de la tienda (foto y precio) y lleva directo a su ficha.',
    usa: ['producto'],
    formato: 'modal',
    contenido: { ...base, etiqueta: 'Producto destacado', titulo: '', texto: '', botonTexto: 'Ver producto', accion: 'producto' },
  },
];

export const plantillaPorId = (id: string) => PLANTILLAS.find((p) => p.id === id);

const MAX = { etiqueta: 40, titulo: 90, texto: 400, descuento: 16, codigo: 32, fecha: 80, lugar: 120, botonTexto: 30, url: 500, whatsappTexto: 300, cerrarTexto: 30 };

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const opcion = <T extends string>(v: unknown, lista: readonly T[], def: T): T => (typeof v === 'string' && (lista as readonly string[]).includes(v) ? (v as T) : def);

/** Solo https://, http:// o rutas internas (/algo). Bloquea javascript:, data: y rutas "//host". */
export function enlaceSeguro(v: unknown): string {
  const s = str(v, MAX.url);
  if (/^https?:\/\/[^\s]+$/i.test(s)) return s;
  if (/^\/(?!\/)[^\s]*$/.test(s)) return s;
  return '';
}

/** Recorta lo que llega del editor a la forma exacta de ContenidoPopup (nunca se guarda una clave desconocida). */
export function limpiarContenido(raw: unknown, plantilla: PlantillaPopup): ContenidoPopup {
  const c = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const def = plantillaPorId(plantilla)?.contenido ?? base;
  return {
    etiqueta: str(c.etiqueta, MAX.etiqueta),
    titulo: str(c.titulo, MAX.titulo),
    texto: str(c.texto, MAX.texto),
    imagenUrl: enlaceSeguro(c.imagenUrl),
    descuento: str(c.descuento, MAX.descuento),
    codigo: str(c.codigo, MAX.codigo),
    fecha: str(c.fecha, MAX.fecha),
    lugar: str(c.lugar, MAX.lugar),
    botonTexto: str(c.botonTexto, MAX.botonTexto) || def.botonTexto,
    accion: opcion(c.accion, ACCIONES, 'ninguna'),
    url: enlaceSeguro(c.url),
    whatsappTexto: str(c.whatsappTexto, MAX.whatsappTexto),
    cerrarTexto: str(c.cerrarTexto, MAX.cerrarTexto),
    tema: opcion(c.tema, TEMAS, def.tema),
  };
}

export function limpiarPaginas(v: unknown): string[] {
  const lista = Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && CLAVES_PAGINA.includes(x)) : [];
  const unicas = [...new Set(lista)];
  return unicas.includes('todas') ? ['todas'] : unicas;
}

/** ¿Está dentro de su ventana de fechas? (inicio/fin vacíos = sin límite). */
export function vigente(p: { inicio: Date | null; fin: Date | null }, ahora = new Date()): boolean {
  return (!p.inicio || p.inicio <= ahora) && (!p.fin || p.fin >= ahora);
}

export type SituacionPopup = 'borrador' | 'pausado' | 'programado' | 'en_curso' | 'finalizado';

/** Lo que ve el equipo en el listado: combina el estado manual con las fechas. */
export function situacion(p: { estado: string; inicio: Date | null; fin: Date | null }, ahora = new Date()): SituacionPopup {
  if (p.estado === 'BORRADOR') return 'borrador';
  if (p.estado === 'PAUSADO') return 'pausado';
  if (p.inicio && p.inicio > ahora) return 'programado';
  if (p.fin && p.fin < ahora) return 'finalizado';
  return 'en_curso';
}

/** Motivo por el que un popup todavía no se puede activar (null = listo). */
export function faltaParaActivar(p: { plantilla: string; contenido: ContenidoPopup; productoId: string | null; paginas: string[] }): string | null {
  if (p.paginas.length === 0) return 'Elige al menos una página donde se mostrará.';
  if (p.plantilla === 'producto' || p.contenido.accion === 'producto') {
    if (!p.productoId) return 'Elige el producto al que redirige.';
  }
  if (p.plantilla !== 'producto' && !p.contenido.titulo) return 'El título es obligatorio.';
  if (p.contenido.accion === 'url' && !p.contenido.url) return 'Escribe la dirección (https://… o /ruta) del botón.';
  return null;
}
