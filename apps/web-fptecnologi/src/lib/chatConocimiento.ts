/*
 * Base de conocimiento del asistente virtual (solo servidor). Reúne en un
 * texto lo mismo que muestran las páginas de la web (empresa, nosotros,
 * servicios con su detalle, tienda, marcas, partners, cotizador, blog y
 * textos legales) más lo que vive en la base de datos vía la API: productos
 * (precio, marca, categoría), servicios cargados en el dashboard y artículos
 * del blog. Se cachea 60 s para no pegarle a la API en cada mensaje.
 *
 * Productos: no se manda todo el catálogo. Se puntúa cada producto contra la
 * pregunta (nombre, marca, SKU, categoría; sin tildes) y van con detalle los más
 * relevantes; el resto, resumido por categoría (cantidad y rango de precios).
 *
 * Proyectos y clientes: solo los que NO estén marcados como ejemplo en el
 * dashboard; si no hay ninguno real, se le indica que no cite casos.
 */
import {
  BUSINESS_PATHS,
  CONTACT_INFO,
  NOSOTROS_PILARES,
  PARTNER_BRANDS,
  PARTNER_STEPS,
  WHATSAPP_AREAS,
  WHY_CHOOSE_US,
} from './content';
import { FAQ_COMUNES } from './serviciosDetalle';
import { getCatalogo, categoriasDe } from './catalogo';
import { getServicios, type ServicioPublico } from './servicios';
import { getClientes, getProyectos } from './referencias';
import { PERU_DEPARTMENTS } from './peruDepartments';
import { montoSoles } from './projects';
import { getCotizadorContenido } from './cotizadorContenido';
import { getArticulos } from './blog';
import { getLegalDocs, type LegalDoc } from './legal';
import { getSitio, type Sitio } from './sitio';
import { getPagina } from './paginasContenido';
import type { CatalogProduct } from './catalog';
import { COMPLIANCE } from './compliance';
import { getHomeContenido } from './homeContenido';
import { getProveedor } from './proveedorLibro';

const CACHE_MS = 60_000;
const MAX_PRODUCTOS = 30;
const MAX_ARTICULOS = 8;

const lista = (items: readonly string[]) => items.join('; ');

function seccionEmpresa(sitio: Sitio, horario: string): string {
  const CONTACT_INFO = sitio.contact;
  return `EMPRESA Y CONTACTO
FP Tecnologi & System (FPTecnologi): distribuidor autorizado de equipamiento TI y proveedor de servicios TI para empresas e instituciones del Perú.
Dirección: ${CONTACT_INFO.address}. Teléfono ventas: ${CONTACT_INFO.phoneVentas}. Ventas web: ${CONTACT_INFO.phoneVentasWeb}. Correo: ${CONTACT_INFO.email}.
Horario: ${horario}.
WhatsApp de asesores (áreas: ${WHATSAPP_AREAS.map((a) => a.label).join(', ')}): +${sitio.whatsapp}.
Redes: ${sitio.social.map((r) => r.label).join(', ')}.
Líneas de negocio:
${BUSINESS_PATHS.map((b) => `- ${b.title}: ${b.text}`).join('\n')}`;
}

function seccionNosotros(): string {
  return `NOSOTROS (página /nosotros)
Distribución autorizada de las principales marcas, stock local listo para despachar y un equipo técnico que arma cada propuesta a medida. Dos líneas: tienda B2B y servicios TI por proyecto (diseño, instalación y soporte con especialistas propios).
${NOSOTROS_PILARES.map((p) => `- ${p.titulo}: ${p.texto}`).join('\n')}
Por qué elegirnos:
${WHY_CHOOSE_US.map((w) => `- ${w.title}: ${w.text}`).join('\n')}`;
}

function seccionServicios(servicios: ServicioPublico[]): string {
  const comunes = new Set([FAQ_COMUNES.visita.p, FAQ_COMUNES.soporte.p]);
  const detalle = servicios.map((s) => {
    const d = s.detalle;
    const propias = d?.faqs.filter((f) => !comunes.has(f.p)) ?? [];
    return [
      `- ${s.title} (página /servicios/${s.slug}): ${d?.intro ?? s.description}${s.precioDesde ? ` Desde USD ${s.precioDesde}.` : ''}`,
      d && d.incluye.length > 0 && `  Incluye: ${lista(d.incluye)}.`,
      d && `  Beneficios: ${lista(d.beneficios.map((b) => b.titulo))}. Sectores: ${lista(d.sectores)}.`,
      ...propias.map((f) => `  P: ${f.p} R: ${f.r}`),
    ]
      .filter(Boolean)
      .join('\n');
  });
  return `SERVICIOS TI (página /servicios; todos se cotizan por proyecto: botón Cotizar o cotizador)
${detalle.join('\n')}
Preguntas comunes de todos los servicios:
P: ${FAQ_COMUNES.visita.p} R: ${FAQ_COMUNES.visita.r}
P: ${FAQ_COMUNES.soporte.p} R: ${FAQ_COMUNES.soporte.r}
Proceso: levantamiento de información, propuesta a medida, instalación y soporte técnico local.`;
}

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

/** Tienda: reglas fijas + los productos más relevantes para la pregunta + resumen del resto por categoría. */
export function seccionTienda(products: readonly CatalogProduct[], pregunta = ''): string {
  const categorias = categoriasDe([...products]);
  const relevantes = productosRelevantes(pregunta, products);
  const lista = (relevantes.length > 0 ? relevantes : products).slice(0, MAX_PRODUCTOS);
  const resumen = categorias.map((c) => {
    const de = products.filter((p) => p.category === c.slug);
    const precios = de.map((p) => p.price);
    const marcas = [...new Set(de.map((p) => p.brand))].join(', ');
    return `- ${c.title} (/tienda/${c.slug}): ${de.length} productos, USD ${Math.min(...precios)}–${Math.max(...precios)}, marcas ${marcas}`;
  });
  const marcas = [...new Set(products.map((p) => p.brand))].sort().join(', ');
  return `TIENDA B2B (páginas /tienda, /producto/<slug>, /marcas, /carrito, /finalizar-compra)
Catálogo: ${products.length} productos. Marcas con productos hoy: ${marcas}.
Por categoría:
${resumen.join('\n')}
Precios en USD sin IGV (se suma IGV 18 %); la web permite ver los precios en soles (PEN) con el interruptor de moneda.
Cómo comprar: agregar al carrito → "Finalizar compra" con datos del comprador, comprobante (boleta con DNI o factura con RUC y razón social), entrega y forma de pago. Al terminar, el pedido se confirma por WhatsApp con un asesor y se puede seguir en Mi cuenta (/cuenta).
Formas de pago: transferencia bancaria, Yape / Plin o efectivo en tienda (no hay pago con tarjeta en línea). El comprobante se emite al confirmar el pago.
Compra mayorista: desde 6 unidades por producto se aplica el precio mayorista (si el producto lo tiene) y se pide un presupuesto formal (/presupuesto) con PDF; un asesor lo confirma.
Cambios y devoluciones: ver /legal/devoluciones. No tengo stock en tiempo real exacto: el stock y el precio final los confirma un asesor.
${relevantes.length > 0 ? `Productos que coinciden con la consulta (${relevantes.length}; se muestran ${lista.length}):` : `Algunos productos (no hubo coincidencia directa con la consulta; si buscan algo concreto que no está, ofrece cotizarlo):`}
${lista.map(filaProducto).join('\n')}`;
}

function seccionMarcasYPartners(): string {
  return `MARCAS Y PARTNERS
Marcas distribuidas (página /marcas): ${PARTNER_BRANDS.map((b) => b.name).join(', ')}.
Programa de Partners (integradores y revendedores, con precios y beneficios especiales): ${PARTNER_STEPS.map((p) => `${p.title}: ${p.text}`).join(' ')}`;
}

async function seccionCotizador(): Promise<string> {
  const c = await getCotizadorContenido();
  return `COTIZADOR (página /cotizador)
${c.hero.descripcion} Formulario en 3 pasos: ${c.pasos.items.map((p) => p.title).join(' · ')}.
Se puede cotizar: ${c.intereses.items.map((i) => i.title).join(', ')}.
Cómo funciona: ${c.proceso.items.map((p) => `${p.title}: ${p.text}`).join(' ')}
Preguntas frecuentes: ${c.faq.items.map((f) => `P: ${f.title} R: ${f.text}`).join(' ')}`;
}

async function seccionBlog(): Promise<string> {
  const arts = (await getArticulos()).slice(0, MAX_ARTICULOS);
  if (arts.length === 0) return 'BLOG (página /blog): sin artículos publicados por ahora.';
  return `BLOG (página /blog, artículos recientes)
${arts.map((a) => `- ${a.titulo} (/blog/${a.slug}) [${a.categoria}]: ${a.resumen}`).join('\n')}`;
}

function seccionLegal(legal: LegalDoc[]): string {
  const docs = legal.map((d) => {
    const cuerpo =
      d.slug === 'devoluciones'
        ? ` Contenido: ${d.secciones.map((s) => `${s.titulo}: ${s.parrafos.join(' ')}`).join(' ').slice(0, 1800)}`
        : ` Secciones: ${d.secciones.map((s) => s.titulo).join(', ')}.`;
    return `- ${d.titulo} ${d.destacado} (/legal/${d.slug}): ${d.resumen}${cuerpo}`;
  });
  return `TEXTOS LEGALES (informativos; para el detalle oficial, enviar a la página)
${docs.join('\n')}
- Libro de reclamaciones virtual (/libro-de-reclamaciones): formulario conforme a la Ley N.° 29571 y su reglamento, con consulta de estado por código y documento; responden en un máximo de 15 días hábiles (no calendario). Presentar un reclamo no impide acudir a Indecopi.`;
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
  const lista = tarifas.slice(0, 30).map((t) => `${t.departamento}: USD ${t.costo}${t.plazoDias ? `, llega en ${t.plazoDias}` : ''}`).join('; ');
  return `ENTREGAS Y ENVÍOS
- Recojo en tienda (oficina de Lima): gratis.
- Envío por ${tarifas[0]?.proveedor === 'SHALOM' || !tarifas.length ? 'Shalom' : tarifas[0]!.proveedor} a provincias: se recoge en la agencia elegida en el checkout (se puede buscar la más cercana con la ubicación); el costo se suma al total y se envía código de seguimiento.${lista ? ` Tarifas por departamento (USD): ${lista}.` : ' Las tarifas por departamento se ven en el checkout.'}
- Envío a domicilio: costo a coordinar por WhatsApp según el distrito.`;
}

/** Textos del inicio editables en el dashboard (presentación y "por qué elegirnos") + datos fiscales. */
async function seccionPresentacion(): Promise<string> {
  const [home, prov] = await Promise.all([getHomeContenido(), getProveedor()]);
  const fiscal = [prov.razonSocial && `Razón social: ${prov.razonSocial}`, prov.ruc && `RUC: ${prov.ruc}`, prov.direccion && `Dirección fiscal: ${prov.direccion}`].filter(Boolean).join('. ');
  return `PRESENTACIÓN (página de inicio)
${home.nosotros.descripcion}
Por qué elegirnos: ${home.porque.items.map((i) => `${i.title}: ${i.text}`).join(' ')}
${fiscal ? `Datos fiscales: ${fiscal}.` : 'Razón social y RUC: los confirma un asesor (no los inventes).'}`;
}

async function seccionesPaginasNuevas(sitio: Sitio): Promise<string> {
  const [alquiler, education, compliance, catalogos] = await Promise.all([getPagina('alquiler'), getPagina('education'), getPagina('compliance'), getPagina('catalogos')]);
  const items = (xs: { title: string; text: string }[]) => xs.map((x) => `${x.title}: ${x.text}`).join(' ');
  const secciones = compliance.contenido.texto
    ? compliance.contenido.texto.split(/^##\s+/m).slice(1).map((b) => b.split('\n')[0]!.trim()).filter(Boolean)
    : COMPLIANCE.map((c) => c.titulo);
  return `ALQUILER DE EQUIPOS (página /alquiler-equipos)
${alquiler.hero.descripcion}
Beneficios: ${items(alquiler.beneficios.items)}
Equipos que se alquilan: ${items(alquiler.equipos.items)}
Cómo funciona: ${items(alquiler.pasos.items)} El precio del alquiler se cotiza según cantidad, modelo y tiempo (no hay tarifas publicadas): ofrece el cotizador o WhatsApp.

FP EDUCATION (página /educacion): ${education.hero.descripcion}
${items(education.tarjetas.items)} ${education.accion.texto}

COMPLIANCE (página /compliance): ${compliance.hero.descripcion} Secciones: ${secciones.join(', ')}. Documentos descargables: ${compliance.documentos.items.map((d) => d.titulo).join('; ')}.

CATÁLOGOS EN PDF (página /catalogos): ${catalogos.lista.items.map((c) => c.titulo).join(', ')}. Se ven como folleto o se descargan.

SOPORTE POR TICKETS (página /tickets; seguimiento en /tickets/seguimiento con el número de ticket)
Para clientes que compraron con nosotros: verificar un producto, registrar un reclamo (pedido, garantía o atención) o pedir soporte técnico. Se dejan los datos, el pedido o producto, la descripción y evidencias (fotos, comprobante); el área comercial contacta para el seguimiento. Para un reclamo formal ante Indecopi existe además el libro de reclamaciones.

MI CUENTA (página /cuenta): sin contraseña, con el correo usado al comprar o cotizar llega un código de 6 dígitos; ahí se ven los pedidos, su estado y las cotizaciones.

SOCIOS / PARTNERS (registro en /socios/registro): empresas integradoras o revendedoras se registran; al aprobarlas acceden a la intranet de socios con material de marcas, soporte y precios para socios.
${sitio.stats.length ? `\nCIFRAS DE LA EMPRESA: ${sitio.stats.map((s) => `${s.value}${s.suffix} ${s.label}`).join('; ')}.` : ''}`;
}

const MAPA_WEB = `MAPA DE LA WEB
Inicio (/), Servicios (/servicios y /servicios/<servicio>), Tienda (/tienda, /tienda/<categoría>, /producto/<producto>), Marcas (/marcas), Nosotros (/nosotros), Proyectos (/proyectos), Blog (/blog), Cotizador (/cotizador), Contacto (/contacto), Alquiler de equipos (/alquiler-equipos), FP Education (/educacion), Compliance (/compliance), Catálogos PDF (/catalogos), Tickets de soporte (/tickets), Mi cuenta (/cuenta), Socios (/socios/registro), Carrito y compra (/carrito, /finalizar-compra), Presupuesto mayorista (/presupuesto), textos legales y libro de reclamaciones (/libro-de-reclamaciones).`;


/** Solo proyectos y clientes reales (los marcados como ejemplo en el dashboard no se citan). */
async function seccionReferencias(): Promise<string> {
  const [proyectos, sectores] = await Promise.all([getProyectos(), getClientes()]);
  const reales = proyectos.filter((p) => p.ejemplo === false);
  const clientes = sectores.flatMap((s) => s.clients.filter((c) => c.ejemplo === false).map((c) => c.name));
  if (reales.length === 0 && clientes.length === 0) {
    return 'PROYECTOS Y CLIENTES (páginas /proyectos y /nosotros)\nLa web aún no tiene casos de éxito ni clientes reales confirmados; no cites proyectos ni clientes concretos y, si piden referencias, deriva a un asesor.';
  }
  const dept = (id: string) => PERU_DEPARTMENTS.find((d) => d.id === id)?.name ?? id;
  return `PROYECTOS Y CLIENTES (página /proyectos)
${reales.map((p) => `- ${p.title} — ${p.client}, ${dept(p.department)}${p.year ? `, ${p.year}` : ''}${p.monto ? `, monto bruto ${montoSoles(p.monto)}` : ''}: ${p.description} Alcance: ${lista(p.scope)}.`).join('\n')}${clientes.length ? `\nClientes: ${clientes.join(', ')}.` : ''}`;
}

type Base = { at: number; text: string; products: CatalogProduct[]; servicios: ServicioPublico[] };
let cache: Base | null = null;

async function base(): Promise<Base> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache;
  const [{ products }, servicios, cotizador, blog, referencias, sitio, contactoPag, legal] = await Promise.all([
    getCatalogo(),
    getServicios(),
    seccionCotizador(),
    seccionBlog(),
    seccionReferencias(),
    getSitio(),
    getPagina('contacto'),
    getLegalDocs(),
  ]);
  const text = [
    seccionEmpresa(sitio, contactoPag.visita.horario),
    await seccionPresentacion(),
    seccionNosotros(),
    seccionServicios(servicios),
    '{{TIENDA}}',
    await seccionEnvios(),
    seccionMarcasYPartners(),
    cotizador,
    await seccionesPaginasNuevas(sitio),
    blog,
    referencias,
    seccionLegal(legal),
    MAPA_WEB,
  ].join('\n\n');
  cache = { at: Date.now(), text, products, servicios };
  return cache;
}

/**
 * Conocimiento para una pregunta: el texto base (cacheado) con la sección de tienda armada para esa pregunta, más
 * los productos y servicios reales (para validar los enlaces `producto:<sku>`/`servicio:<slug>` y las cotizaciones).
 */
export async function getConocimiento(pregunta = ''): Promise<{ text: string; products: CatalogProduct[]; servicios: ServicioPublico[] }> {
  const b = await base();
  return { text: b.text.replace('{{TIENDA}}', () => seccionTienda(b.products, pregunta)), products: b.products, servicios: b.servicios };
}
