/*
 * Base de conocimiento del asistente virtual (solo servidor). Reúne lo que muestran las páginas de la web y lo que
 * vive en la base de datos vía la API (productos, servicios, blog, proyectos, envíos, contenido editable).
 *
 * Búsqueda por pregunta (RAG liviano): Groq (plan gratis) corta a 8000 tokens por minuto sumando todo, así que NO se
 * manda todo. Cada mensaje lleva un núcleo fijo corto (empresa, contacto, índice de servicios y mapa de la web) y solo
 * las 3 secciones que más coinciden con la pregunta (palabras clave sin tildes, singular/plural), más hasta 8
 * productos relevantes. Un saludo o una pregunta ajena viaja solo con el núcleo.
 *
 * Caché: 5 min, se sirve vencida mientras se renueva en segundo plano y nunca se arman dos a la vez (antes, con la
 * caché vencida, cada mensaje simultáneo disparaba ~15 consultas a la API en paralelo).
 *
 * Proyectos y clientes: solo los que NO estén marcados como ejemplo en el dashboard.
 */
import {
  BUSINESS_PATHS,
  NOSOTROS_PILARES,
  PARTNER_BRANDS,
  PARTNER_STEPS,
  WHATSAPP_AREAS,
} from './content';
import { FAQ_COMUNES } from './serviciosDetalle';
import { getCatalogo, categoriasDe } from './catalogo';
import { getServicios, type ServicioPublico } from './servicios';
import { getClientes, getProyectos } from './referencias';
import { PERU_DEPARTMENTS } from './peruDepartments';
import { getCotizadorContenido } from './cotizadorContenido';
import { getArticulos } from './blog';
import { getLegalDocs } from './legal';
import { getSitio, type Sitio } from './sitio';
import { getPagina } from './paginasContenido';
import type { CatalogProduct } from './catalog';
import { COMPLIANCE } from './compliance';
import { getHomeContenido } from './homeContenido';
import { getProveedor } from './proveedorLibro';

const CACHE_MS = 5 * 60_000;
const TIEMPO_MAX_MS = 8000;
const MAX_PRODUCTOS = 8;
const MAX_ARTICULOS = 6;
const MAX_PROYECTOS = 10;
const MAX_SECCIONES = 3;
const MAX_CARACTERES_SECCIONES = 4000;

const lista = (items: readonly string[]) => items.join('; ');

/** Sección del conocimiento: se manda solo si sus palabras clave coinciden con la pregunta. */
type Seccion = { id: string; claves: string[]; texto: string };

const normalizar = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9ñ.#-]+/g, ' ').trim();
const VACIAS = new Set(['de', 'la', 'el', 'los', 'las', 'un', 'una', 'para', 'con', 'que', 'por', 'en', 'y', 'o', 'me', 'mi', 'tienen', 'tienes', 'hay', 'quiero', 'precio', 'cuanto', 'cuesta', 'necesito', 'busco', 'del', 'al', 'su', 'sus', 'es']);

/** Productos ordenados por cuánto coinciden con la pregunta (los que no coinciden, fuera). */
export function productosRelevantes(pregunta: string, products: readonly CatalogProduct[]): CatalogProduct[] {
  const terminos = [...new Set(normalizar(pregunta).split(' ').filter((t) => t.length > 1 && !VACIAS.has(t)))];
  if (terminos.length === 0) return [];
  const puntuados = products.map((p) => {
    const nombre = normalizar(p.name);
    const otros = normalizar(`${p.brand} ${p.category}`);
    const sku = normalizar(p.sku);
    let puntos = 0;
    for (const t of terminos) {
      if (sku === t) puntos += 10;
      else if (nombre.split(' ').includes(t)) puntos += 3;
      else if (nombre.includes(t)) puntos += 1.5;
      if (otros.includes(t) || otros.includes(t.replace(/s$/, ''))) puntos += 2;
    }
    return { p, puntos };
  });
  return puntuados.filter((x) => x.puntos > 0).sort((a, b) => b.puntos - a.puntos).map((x) => x.p);
}

const filaProducto = (p: CatalogProduct) => {
  const antes = p.priceBefore ? ` (antes USD ${p.priceBefore})` : '';
  const mayor = p.priceMayor ? ` | mayorista USD ${p.priceMayor} desde 6 u.` : '';
  const stock = p.stock === undefined ? '' : p.stock > 0 ? ' | con stock' : ' | sin stock (a pedido)';
  return `- ${p.name.slice(0, 90)} | ${p.brand} | SKU ${p.sku} | USD ${p.price}${antes}${mayor}${stock} | ${p.category}`;
};

/** Raíces de palabra para comparar sin tildes y sin importar singular/plural ("laptops" ~ "laptop", "envíos" ~ "envio"). */
const raiz = (t: string) => (t.length > 4 ? t.replace(/(es|s)$/, '') : t);
const terminosDe = (texto: string) => [...new Set(normalizar(texto).split(' ').filter((t) => t.length > 2 && !VACIAS.has(t)).map(raiz))];

/** Puntaje de una sección: claves de una palabra por raíz/prefijo (4+ letras); las de varias palabras, como frase (valen 2). */
function puntaje(seccion: Seccion, terminos: string[], frase: string): number {
  let puntos = 0;
  for (const c of seccion.claves) {
    const k = normalizar(c);
    if (k.includes(' ')) {
      if (frase.includes(k)) puntos += 2;
      continue;
    }
    const r = raiz(k);
    if (terminos.some((t) => t === r || (t.length >= 4 && r.length >= 4 && (t.startsWith(r) || r.startsWith(t))))) puntos += 1;
  }
  return puntos;
}

const filaCategoria = (products: readonly CatalogProduct[]) =>
  categoriasDe([...products]).map((c) => {
    const de = products.filter((p) => p.category === c.slug);
    const precios = de.map((p) => p.price);
    return `${c.title} (tienda:${c.slug}, ${de.length} productos, USD ${Math.min(...precios)}–${Math.max(...precios)})`;
  });

function nucleo(sitio: Sitio, horario: string, servicios: ServicioPublico[], products: readonly CatalogProduct[]): string {
  const c = sitio.contact;
  return `EMPRESA: FP Tecnologi & System (FPTecnologi), distribuidor autorizado de equipos TI y proveedor de servicios TI para empresas e instituciones del Perú. Líneas: ${BUSINESS_PATHS.map((b) => b.title).join(', ')}.
CONTACTO: ${c.address}. Ventas ${c.phoneVentas}; ventas web ${c.phoneVentasWeb}; correo ${c.email}; WhatsApp +${sitio.whatsapp} (áreas: ${WHATSAPP_AREAS.map((a) => a.label).join(', ')}). Horario: ${horario}.
SERVICIOS (se cotizan por proyecto): ${servicios.map((s) => `${s.title} (servicio:${s.slug})`).join('; ')}.
TIENDA (precios USD sin IGV; +18 % IGV): ${filaCategoria(products).join('; ')}.
PÁGINAS: tienda, servicios, cotizador, alquiler de equipos, FP Education, marcas, nosotros, proyectos, blog, catálogos PDF, tickets de soporte, Mi cuenta, socios/partners, compliance, contacto, devoluciones y libro de reclamaciones.`;
}

async function armarSecciones(sitio: Sitio, servicios: ServicioPublico[]): Promise<Seccion[]> {
  const [home, prov, cotizador, alquiler, education, compliance, catalogos, envios, blog, referencias, legal] = await Promise.all([
    getHomeContenido(),
    getProveedor(),
    getCotizadorContenido(),
    getPagina('alquiler'),
    getPagina('education'),
    getPagina('compliance'),
    getPagina('catalogos'),
    seccionEnvios(),
    seccionBlog(),
    seccionReferencias(),
    getLegalDocs(),
  ]);
  const items = (xs: { title: string; text: string }[]) => xs.map((x) => `${x.title}: ${x.text}`).join(' ');
  const fiscal = [prov.razonSocial && `razón social ${prov.razonSocial}`, prov.ruc && `RUC ${prov.ruc}`, prov.direccion && `dirección fiscal ${prov.direccion}`].filter(Boolean).join(', ');
  const seccionesCompliance = compliance.contenido.texto
    ? compliance.contenido.texto.split(/^##\s+/m).slice(1).map((b) => b.split('\n')[0]!.trim()).filter(Boolean)
    : COMPLIANCE.map((c) => c.titulo);
  const devoluciones = legal.find((d) => d.slug === 'devoluciones');

  const out: Seccion[] = [
    {
      id: 'nosotros',
      claves: ['nosotros', 'empresa', 'quienes son', 'quienes somos', 'somos', 'mision', 'vision', 'valores', 'experiencia', 'años', 'confiable', 'elegir', 'diferencia', 'ruc', 'razon social', 'fiscal', 'factura'],
      texto: `NOSOTROS (/nosotros): ${home.nosotros.descripcion}
${NOSOTROS_PILARES.map((p) => `${p.titulo}: ${p.texto}`).join(' ')}
Por qué elegirnos: ${home.porque.items.map((i) => i.title).join(', ')}.${sitio.stats.length ? ` Cifras: ${sitio.stats.map((x) => `${x.value}${x.suffix} ${x.label}`).join('; ')}.` : ''}
Datos fiscales: ${fiscal || 'los confirma un asesor (no los inventes)'}.`,
    },
    ...servicios.map((x) => {
      const d = x.detalle;
      return {
        id: `servicio:${x.slug}`,
        claves: [...x.title.split(/\s+/), ...x.slug.split('-'), ...(d?.sectores ?? []).flatMap((t) => t.split(/\s+/)), 'servicio'],
        texto: `SERVICIO ${x.title} (servicio:${x.slug}): ${(d?.intro ?? x.description).slice(0, 260)}${x.precioDesde ? ` Desde USD ${x.precioDesde}.` : ''}${d?.incluye.length ? ` Incluye: ${lista(d.incluye.slice(0, 5))}.` : ''}${d?.sectores.length ? ` Sectores: ${lista(d.sectores.slice(0, 5))}.` : ''}`,
      };
    }),
    {
      id: 'servicios',
      claves: ['servicios', 'servicio', 'instalacion', 'implementacion', 'proyecto', 'visita', 'soporte tecnico', 'mantenimiento', 'garantia'],
      texto: `SERVICIOS EN GENERAL: se cotizan por proyecto. Proceso: diagnóstico/visita, propuesta a medida, implementación con especialistas propios y soporte técnico local.
P: ${FAQ_COMUNES.visita.p} R: ${FAQ_COMUNES.visita.r}
P: ${FAQ_COMUNES.soporte.p} R: ${FAQ_COMUNES.soporte.r}`,
    },
    {
      id: 'compra',
      claves: ['comprar', 'compra', 'pago', 'pagar', 'yape', 'plin', 'transferencia', 'tarjeta', 'efectivo', 'boleta', 'factura', 'comprobante', 'carrito', 'pedido', 'igv', 'soles', 'dolares', 'moneda', 'stock', 'disponible', 'mayorista', 'presupuesto', 'por mayor', 'unidades', 'cantidad'],
      texto: `COMPRA EN LA TIENDA: carrito → "Finalizar compra" (datos, boleta con DNI o factura con RUC, entrega y pago). Pagos: transferencia, Yape / Plin o efectivo en tienda (sin tarjeta en línea); el pedido se confirma por WhatsApp y se sigue en Mi cuenta. Precios en USD sin IGV; la web los muestra también en soles. Mayorista: desde 6 u. por producto aplica precio mayorista y se pide presupuesto formal con PDF (presupuesto). El stock exacto y el precio final los confirma un asesor.`,
    },
    { id: 'envios', claves: ['envio', 'envios', 'enviar', 'delivery', 'despacho', 'shalom', 'agencia', 'provincia', 'domicilio', 'recojo', 'recoger', 'llega', 'demora', 'tarifa', 'departamento', 'lima', 'arequipa', 'cusco', 'trujillo', 'piura'], texto: envios },
    {
      id: 'marcas',
      claves: ['marcas', 'marca', 'partner', 'partners', 'socio', 'socios', 'distribuidor', 'revendedor', 'integrador', 'dell', 'hp', 'lenovo', 'lg', 'asus', 'samsung', 'epson', 'intranet'],
      texto: `MARCAS distribuidas (marcas, marca:<nombre>): ${PARTNER_BRANDS.map((b) => b.name).join(', ')}.
PARTNERS/SOCIOS (socios): ${PARTNER_STEPS.map((x) => `${x.title}: ${x.text}`).join(' ')} Al aprobarlos acceden a la intranet de socios con material, soporte y precios para socios.`,
    },
    {
      id: 'cotizador',
      claves: ['cotizar', 'cotizacion', 'cotizador', 'proforma', 'propuesta', 'precio', 'presupuesto'],
      texto: `COTIZADOR (cotizar): ${cotizador.hero.descripcion} 3 pasos: ${cotizador.pasos.items.map((x) => x.title).join(' · ')}. Se puede cotizar: ${cotizador.intereses.items.map((x) => x.title).join(', ')}. ${cotizador.faq.items.slice(0, 3).map((f) => `P: ${f.title} R: ${f.text}`).join(' ')}`,
    },
    {
      id: 'alquiler',
      claves: ['alquiler', 'alquilar', 'renta', 'rentar', 'arrendar', 'temporal', 'evento', 'capacitacion', 'prestamo'],
      texto: `ALQUILER DE EQUIPOS (alquiler): ${alquiler.hero.descripcion} Beneficios: ${alquiler.beneficios.items.map((x) => x.title).join(', ')}. Equipos: ${alquiler.equipos.items.map((x) => x.title).join(', ')}. Pasos: ${items(alquiler.pasos.items)} Sin tarifas publicadas: se cotiza por cantidad, modelo y tiempo.`,
    },
    {
      id: 'educacion',
      claves: ['educacion', 'education', 'colegio', 'escuela', 'universidad', 'aula', 'docente', 'institucion', 'alumno', 'pizarra'],
      texto: `FP EDUCATION (educacion): ${education.hero.descripcion} ${education.tarjetas.items.map((x) => x.title).join('; ')}.`,
    },
    {
      id: 'soporte',
      claves: ['ticket', 'tickets', 'soporte', 'falla', 'problema', 'averia', 'garantia', 'reparar', 'reclamo', 'seguimiento', 'verificar', 'no funciona', 'malogrado', 'devolucion', 'devolver', 'cambio', 'reembolso', 'reclamaciones', 'indecopi', 'queja'],
      texto: `SOPORTE (tickets; seguimiento con el número en seguimiento): para quien compró con nosotros: verificar un producto, reclamo (pedido, garantía o atención) o soporte técnico, con evidencias (fotos, comprobante); el área comercial da seguimiento.
DEVOLUCIONES (devoluciones): ${(devoluciones?.resumen ?? '').slice(0, 200)} ${devoluciones ? devoluciones.secciones.map((x) => `${x.titulo}: ${x.parrafos.join(' ')}`).join(' ').slice(0, 500) : ''}
LIBRO DE RECLAMACIONES (reclamaciones): Ley 29571, consulta por código y documento, respuesta en máximo 15 días hábiles; no impide acudir a Indecopi.`,
    },
    {
      id: 'cuenta',
      claves: ['cuenta', 'mi cuenta', 'mis pedidos', 'estado de mi pedido', 'codigo', 'login', 'ingresar', 'contraseña', 'rastrear', 'tracking'],
      texto: 'MI CUENTA (cuenta): sin contraseña; con el correo usado al comprar o cotizar llega un código de 6 dígitos y ahí se ven pedidos, su estado, seguimiento del envío y cotizaciones.',
    },
    {
      id: 'documentos',
      claves: ['compliance', 'etica', 'anticorrupcion', 'conducta', 'cumplimiento', 'catalogo', 'catalogos', 'brochure', 'pdf', 'folleto', 'blog', 'articulo', 'noticias', 'privacidad', 'terminos', 'condiciones', 'datos personales'],
      texto: `COMPLIANCE (compliance): ${compliance.hero.descripcion} Secciones: ${seccionesCompliance.join(', ')}. Documentos: ${compliance.documentos.items.map((d) => d.titulo).join('; ')}.
CATÁLOGOS PDF (catalogos): ${catalogos.lista.items.map((c) => c.titulo).join(', ')}.
${blog}
LEGALES: ${legal.map((d) => `${d.titulo} ${d.destacado} (/legal/${d.slug})`).join('; ')}.`,
    },
    { id: 'proyectos', claves: ['proyectos', 'proyecto', 'clientes', 'cliente', 'referencias', 'casos', 'experiencia', 'trabajos', 'municipalidad', 'gobierno'], texto: referencias },
  ];
  return out;
}

/** Tienda: hasta 8 productos que coinciden con la pregunta (con precio, mayorista y stock). */
export function seccionTienda(products: readonly CatalogProduct[], pregunta = ''): string {
  const relevantes = productosRelevantes(pregunta, products).slice(0, MAX_PRODUCTOS);
  if (relevantes.length === 0) return '';
  return `PRODUCTOS QUE COINCIDEN (usa "producto:SKU"; si piden algo que no está, ofrece cotizarlo):
${relevantes.map(filaProducto).join('\n')}`;
}

async function seccionBlog(): Promise<string> {
  const arts = (await getArticulos()).slice(0, MAX_ARTICULOS);
  return arts.length ? `BLOG (blog): ${arts.map((a) => a.titulo).join('; ')}.` : 'BLOG (blog): sin artículos publicados por ahora.';
}

type Tarifa = { departamento: string; proveedor: string; costo: number; plazoDias: string | null };

/** Tarifas de envío por departamento (dashboard → Envíos; GET /public/envios/tarifas). */
async function seccionEnvios(): Promise<string> {
  let tarifas: Tarifa[] = [];
  const marca = process.env.HUB_MARCA_ID;
  if (marca) {
    try {
      const res = await fetch(`${process.env.HUB_API_URL ?? 'http://localhost:3001'}/public/envios/tarifas?marcaId=${encodeURIComponent(marca)}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(3000) });
      if (res.ok) tarifas = ((await res.json())?.data ?? []) as Tarifa[];
    } catch {
      tarifas = [];
    }
  }
  const lista = tarifas.slice(0, 25).map((t) => `${t.departamento} USD ${t.costo}${t.plazoDias ? ` (${t.plazoDias})` : ''}`).join('; ');
  return `ENVÍOS: recojo en tienda (Lima) gratis. Envío por Shalom: se recoge en la agencia elegida en el checkout, el costo se suma al total y llega código de seguimiento.${lista ? ` Tarifas: ${lista}.` : ' Tarifas por departamento en el checkout.'} Envío a domicilio: costo a coordinar por WhatsApp.`;
}

/** Solo proyectos y clientes reales (los marcados como ejemplo en el dashboard no se citan). */
async function seccionReferencias(): Promise<string> {
  const [proyectos, sectores] = await Promise.all([getProyectos(), getClientes()]);
  const reales = proyectos.filter((p) => p.ejemplo === false);
  const clientes = sectores.flatMap((s) => s.clients.filter((c) => c.ejemplo === false).map((c) => c.name));
  if (reales.length === 0 && clientes.length === 0) return 'PROYECTOS Y CLIENTES (proyectos): aún no hay casos ni clientes reales confirmados; no cites ninguno y deriva a un asesor.';
  const dept = (id: string) => PERU_DEPARTMENTS.find((d) => d.id === id)?.name ?? id;
  return `PROYECTOS (proyectos): ${reales.length} en total, por ejemplo: ${reales.slice(0, MAX_PROYECTOS).map((p) => `${p.title.slice(0, 70)} — ${p.client}, ${dept(p.department)}${p.year ? ` ${p.year}` : ''}`).join('; ')}.${clientes.length ? ` Clientes: ${clientes.slice(0, 20).join(', ')}.` : ''}`;
}

type Base = { at: number; nucleo: string; secciones: Seccion[]; products: CatalogProduct[]; servicios: ServicioPublico[] };
let cache: Base | null = null;
let armando: Promise<Base> | null = null;

async function armar(): Promise<Base> {
  const [{ products }, servicios, sitio, contactoPag] = await Promise.all([getCatalogo(), getServicios(), getSitio(), getPagina('contacto')]);
  const secciones = await armarSecciones(sitio, servicios);
  return { at: Date.now(), nucleo: nucleo(sitio, contactoPag.visita.horario, servicios, products), secciones, products, servicios };
}

/** Caché con renovación en segundo plano y una sola construcción a la vez. */
async function base(): Promise<Base> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache;
  if (!armando) {
    armando = Promise.race([armar(), new Promise<never>((_, rej) => setTimeout(() => rej(new Error('conocimiento: tiempo agotado')), TIEMPO_MAX_MS))])
      .then((b) => (cache = b))
      .finally(() => { armando = null; });
  }
  if (cache) {
    armando.catch(() => undefined); // se sigue con la versión anterior mientras se renueva
    return cache;
  }
  return armando;
}

/**
 * Conocimiento para una pregunta: núcleo + las secciones que coinciden + productos relevantes; y los productos y
 * servicios reales (para validar `producto:<sku>`/`servicio:<slug>` y las cotizaciones).
 */
export async function getConocimiento(pregunta = ''): Promise<{ text: string; products: CatalogProduct[]; servicios: ServicioPublico[] }> {
  const b = await base();
  const terminos = terminosDe(pregunta);
  const frase = ` ${normalizar(pregunta)} `;
  const elegidas: Seccion[] = [];
  let largo = 0;
  for (const { s } of b.secciones.map((s) => ({ s, p: puntaje(s, terminos, frase) })).filter((x) => x.p > 0).sort((x, y) => y.p - x.p)) {
    if (elegidas.length >= MAX_SECCIONES || largo + s.texto.length > MAX_CARACTERES_SECCIONES) continue;
    elegidas.push(s);
    largo += s.texto.length;
  }
  const text = [b.nucleo, ...elegidas.map((s) => s.texto), seccionTienda(b.products, pregunta)].filter(Boolean).join('\n\n');
  return { text, products: b.products, servicios: b.servicios };
}
