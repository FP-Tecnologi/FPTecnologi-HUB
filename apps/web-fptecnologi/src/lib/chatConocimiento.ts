/*
 * Base de conocimiento del asistente virtual (solo servidor). Reúne en un
 * texto lo mismo que muestran las páginas de la web (empresa, nosotros,
 * servicios con su detalle, tienda, marcas, partners, cotizador, blog y
 * textos legales) más lo que vive en la base de datos vía la API: productos
 * (precio, marca, categoría), servicios cargados en el dashboard y artículos
 * del blog. Se cachea 60 s para no pegarle a la API en cada mensaje.
 *
 * Los PROYECTOS y CLIENTES de la web son datos de ejemplo (ver projects.ts y
 * clients.ts): no se le pasan al asistente como reales.
 */
import {
  BUSINESS_PATHS,
  CONTACT_INFO,
  NOSOTROS_PILARES,
  PARTNER_BRANDS,
  PARTNER_STEPS,
  SOCIAL_LINKS,
  SOLUTIONS,
  WHATSAPP_AREAS,
  WHY_CHOOSE_US,
} from './content';
import { FAQ_COMUNES, SERVICIOS_DETALLE } from './serviciosDetalle';
import { getCatalogo, getServiciosApi, categoriasDe } from './catalogo';
import { getCotizadorContenido } from './cotizadorContenido';
import { getArticulos } from './blog';
import { LEGAL_DOCS } from './legal';
import type { CatalogProduct } from './catalog';

const CACHE_MS = 60_000;
const MAX_PRODUCTOS = 80;
const MAX_ARTICULOS = 8;

const lista = (items: readonly string[]) => items.join('; ');

function seccionEmpresa(): string {
  return `EMPRESA Y CONTACTO
FP Tecnologi & System (FPTecnologi): distribuidor autorizado de equipamiento TI y proveedor de servicios TI para empresas e instituciones del Perú.
Dirección: ${CONTACT_INFO.address}. Teléfono ventas: ${CONTACT_INFO.phoneVentas}. Ventas web: ${CONTACT_INFO.phoneVentasWeb}. Correo: ${CONTACT_INFO.email}.
Horario: lunes a viernes de 9:00 a 18:00.
WhatsApp de asesores (áreas: ${WHATSAPP_AREAS.map((a) => a.label).join(', ')}): +${WHATSAPP_AREAS[0].number}.
Redes: ${SOCIAL_LINKS.map((r) => r.label).join(', ')}.
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

type ServicioBD = { nombre: string; descripcion: string | null; precioDesde: string | number | null };

function seccionServicios(extra: ServicioBD[]): string {
  const detalle = SOLUTIONS.map((s) => {
    const d = SERVICIOS_DETALLE[s.slug];
    const propias = d?.faqs.filter((f) => f !== FAQ_COMUNES.visita && f !== FAQ_COMUNES.soporte) ?? [];
    return [
      `- ${s.title} (página /servicios/${s.slug}): ${d?.intro ?? s.description}`,
      d && `  Incluye: ${lista(d.incluye)}.`,
      d && `  Beneficios: ${lista(d.beneficios.map((b) => b.titulo))}. Sectores: ${lista(d.sectores)}.`,
      ...propias.map((f) => `  P: ${f.p} R: ${f.r}`),
    ]
      .filter(Boolean)
      .join('\n');
  });
  const conocidos = new Set(SOLUTIONS.map((s) => s.title.toLowerCase()));
  const adicionales = extra
    .filter((s) => !conocidos.has(s.nombre.toLowerCase()))
    .map((s) => `- ${s.nombre}${s.descripcion ? `: ${s.descripcion}` : ''}${s.precioDesde ? ` (desde USD ${Number(s.precioDesde)})` : ''}`);
  return `SERVICIOS TI (página /servicios; todos se cotizan por proyecto: botón Cotizar o cotizador)
${detalle.join('\n')}${adicionales.length ? `\nOtros servicios cargados en el sistema:\n${adicionales.join('\n')}` : ''}
Preguntas comunes de todos los servicios:
P: ${FAQ_COMUNES.visita.p} R: ${FAQ_COMUNES.visita.r}
P: ${FAQ_COMUNES.soporte.p} R: ${FAQ_COMUNES.soporte.r}
Proceso: levantamiento de información, propuesta a medida, instalación y soporte técnico local.`;
}

function seccionTienda(products: CatalogProduct[]): string {
  const categorias = categoriasDe(products)
    .map((c) => `${c.title} (/tienda/${c.slug})`)
    .join(', ');
  const filas = products.slice(0, MAX_PRODUCTOS).map((p) => {
    const antes = p.priceBefore ? ` (antes USD ${p.priceBefore})` : '';
    return `- ${p.name.slice(0, 90)} | ${p.brand} | SKU ${p.sku} | USD ${p.price}${antes} | ${p.category}`;
  });
  const marcas = [...new Set(products.map((p) => p.brand))].sort().join(', ');
  return `TIENDA B2B (páginas /tienda, /producto/<slug>, /marcas, /carrito, /checkout)
Categorías: ${categorias}. Marcas con productos hoy: ${marcas}.
Precios en USD sin IGV (se suma IGV 18 %); la web permite ver los precios en soles (PEN) con el interruptor de moneda.
Cómo comprar: agregar al carrito → "Finalizar compra" con datos del comprador, comprobante (boleta o factura con DNI/RUC), entrega (recojo en tienda o envío a domicilio) y forma de pago. El costo de envío NO está en el total: se coordina por WhatsApp con un asesor; el pago también se confirma por WhatsApp. También se puede cotizar un pedido grande desde el carrito.
Cambios y devoluciones: ver /legal/devoluciones. No tengo stock en tiempo real: el stock y el precio final los confirma un asesor.
Productos (datos de la tienda en este momento):
${filas.join('\n')}`;
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

function seccionLegal(): string {
  const docs = LEGAL_DOCS.map((d) => {
    const cuerpo =
      d.slug === 'devoluciones'
        ? ` Contenido: ${d.secciones.map((s) => `${s.titulo}: ${s.parrafos.join(' ')}`).join(' ').slice(0, 1800)}`
        : ` Secciones: ${d.secciones.map((s) => s.titulo).join(', ')}.`;
    return `- ${d.titulo} ${d.destacado} (/legal/${d.slug}): ${d.resumen}${cuerpo}`;
  });
  return `TEXTOS LEGALES (informativos; para el detalle oficial, enviar a la página)
${docs.join('\n')}
- Libro de reclamaciones virtual (/libro-de-reclamaciones): formulario conforme a la Ley N.° 29571; responden en un máximo de 15 días hábiles.`;
}

const PAGINAS = `MAPA DE LA WEB
Inicio (/), Servicios (/servicios y /servicios/<servicio>), Tienda (/tienda, /tienda/<categoría>, /producto/<producto>), Marcas (/marcas), Nosotros (/nosotros), Proyectos (/proyectos), Blog (/blog), Cotizador (/cotizador), Contacto (/contacto), Carrito y compra (/carrito, /checkout), textos legales y libro de reclamaciones.
Proyectos y clientes: la web aún no tiene casos de éxito ni clientes reales cargados; no cites proyectos ni clientes concretos, y si piden referencias, deriva a un asesor.`;

let cache: { at: number; text: string; products: CatalogProduct[] } | null = null;

/** Texto completo de conocimiento + los productos (para validar los enlaces `producto:<slug>`). */
export async function getConocimiento(): Promise<{ text: string; products: CatalogProduct[] }> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache;
  const [{ products }, serviciosBd, cotizador, blog] = await Promise.all([
    getCatalogo(),
    getServiciosApi(),
    seccionCotizador(),
    seccionBlog(),
  ]);
  const text = [
    seccionEmpresa(),
    seccionNosotros(),
    seccionServicios(serviciosBd),
    seccionTienda(products),
    seccionMarcasYPartners(),
    cotizador,
    blog,
    seccionLegal(),
    PAGINAS,
  ].join('\n\n');
  cache = { at: Date.now(), text, products };
  return cache;
}
