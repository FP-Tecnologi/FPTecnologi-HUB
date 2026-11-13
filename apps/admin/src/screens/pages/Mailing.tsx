'use client';
/*
 * FPTecnologi-HUB — Mailing (versión visual). Se arma un correo con bloques a partir de una plantilla, se ve en
 * vivo (escritorio / móvil), se copia o descarga el HTML, se duplica y se simula el envío a una lista.
 * Los mailings se guardan solo en este navegador (localStorage); todavía NO se envía ningún correo: falta
 * conectar un servicio de envío masivo (ver docs/PENDIENTES.md).
 */
import { useEffect, useMemo, useState } from 'react';
import { PageHead } from '../../components/shell/PageHead';
import { useAuth } from '../../context/AuthContext';
import { CampoImagen } from '../../components/ui/CampoImagen';
import { api } from '../../lib/api';
import { Select } from '../../components/ui/Select';

type Bloque =
  | { id: string; tipo: 'hero'; titulo: string; texto: string; imagen: string }
  | { id: string; tipo: 'texto'; titulo: string; texto: string }
  | { id: string; tipo: 'imagen'; imagen: string; alt: string }
  | { id: string; tipo: 'boton'; texto: string; url: string }
  | { id: string; tipo: 'productos'; titulo: string; items: { nombre: string; precio: string; url: string; imagen: string }[] }
  | { id: string; tipo: 'separador' }
  | { id: string; tipo: 'columnas'; titulo: string; texto: string; imagen: string; derecha: boolean }
  | { id: string; tipo: 'cifras'; items: { valor: string; etiqueta: string }[] }
  | { id: string; tipo: 'cita'; texto: string; autor: string }
  | { id: string; tipo: 'cupon'; titulo: string; codigo: string; detalle: string }
  | { id: string; tipo: 'lista'; titulo: string; items: string };

// html: mailing completo (de la biblioteca mailing-fp); sus [marcadores] se llenan con `valores`. Sin html: se arma con bloques.
interface Mailing { tema?: string; id: string; nombre: string; asunto: string; preheader: string; bloques: Bloque[]; actualizado: string; html?: string; valores?: Record<string, string> }
type Area = 'ventas' | 'marketing' | 'general';
interface ItemBiblioteca { area?: Area; grupo: string; nombre: string; archivo: string; valores?: Record<string, string> }
const AREA_NOMBRE: Record<Area, string> = { ventas: 'Ventas', marketing: 'Marketing', general: 'General' };

/** Áreas de la biblioteca que ve cada rol: ventas/comercial → Ventas; marketing y admin → todas; todos ven las plantillas generales. */
function areasDeRoles(roles: string[], global: boolean): Area[] {
  const r = roles.map((x) => x.toLowerCase());
  if (global || r.includes('admin') || r.includes('marketing')) return ['ventas', 'marketing', 'general'];
  const a: Area[] = [];
  if (r.includes('ventas') || r.includes('comercial')) a.push('ventas');
  return [...a, 'general'];
}

const WEB = process.env.NEXT_PUBLIC_WEB_PUBLICA_URL ?? 'http://localhost:3002';
const KEY = 'fpt:mailings';
const uid = () => Math.random().toString(36).slice(2, 9);
const ETIQUETA: Record<Bloque['tipo'], string> = { hero: 'Portada', texto: 'Texto', imagen: 'Imagen', boton: 'Botón', productos: 'Productos', separador: 'Separador', columnas: 'Imagen + texto', cifras: 'Cifras', cita: 'Testimonio', cupon: 'Cupón', lista: 'Lista' };

/** Temas visuales del correo (colores y forma). Se eligen por mailing. */
interface Tema { nombre: string; primario: string; cabecera: string; fondo: string; titulo: string; texto: string; suave: string; radio: number; cabeceraTexto: string }
const TEMAS: Record<string, Tema> = {
  fp: { nombre: 'FPTecnologi (azul)', primario: '#008DC5', cabecera: '#008DC5', cabeceraTexto: '#ffffff', fondo: '#F0F3F6', titulo: '#0B2A3D', texto: '#1F2733', suave: '#EBF6FA', radio: 12 },
  oscuro: { nombre: 'Oscuro elegante', primario: '#0284C7', cabecera: '#0B1220', cabeceraTexto: '#ffffff', fondo: '#111827', titulo: '#0B1220', texto: '#1F2733', suave: '#E8F4FB', radio: 6 },
  calido: { nombre: 'Cálido (naranja)', primario: '#EA580C', cabecera: '#7C2D12', cabeceraTexto: '#ffffff', fondo: '#FFF7ED', titulo: '#7C2D12', texto: '#3B2A20', suave: '#FFEDD5', radio: 16 },
  verde: { nombre: 'Verde fresco', primario: '#16A34A', cabecera: '#14532D', cabeceraTexto: '#ffffff', fondo: '#F0FDF4', titulo: '#14532D', texto: '#1F2D24', suave: '#DCFCE7', radio: 12 },
  minimal: { nombre: 'Minimalista (blanco y negro)', primario: '#111827', cabecera: '#ffffff', cabeceraTexto: '#111827', fondo: '#FFFFFF', titulo: '#111827', texto: '#374151', suave: '#F3F4F6', radio: 0 },
  vino: { nombre: 'Vino y dorado', primario: '#B45309', cabecera: '#4C0519', cabeceraTexto: '#FDE68A', fondo: '#FDF2F8', titulo: '#4C0519', texto: '#3F2A33', suave: '#FEF3C7', radio: 8 },
};

const nuevoBloque = (tipo: Bloque['tipo']): Bloque => {
  const id = uid();
  switch (tipo) {
    case 'hero': return { id, tipo, titulo: 'Título principal', texto: 'Una frase corta que explique la oferta.', imagen: `${WEB}/images/modelo9/hero-office.jpg` };
    case 'texto': return { id, tipo, titulo: 'Subtítulo', texto: 'Escribe aquí el contenido del correo.' };
    case 'imagen': return { id, tipo, imagen: `${WEB}/images/modelo9/hero-office.jpg`, alt: 'Imagen' };
    case 'boton': return { id, tipo, texto: 'Cotiza ahora', url: `${WEB}/cotizador` };
    case 'productos': return { id, tipo, titulo: 'Productos destacados', items: [1, 2, 3].map((n) => ({ nombre: `Producto ${n}`, precio: 'US$ 0.00', url: `${WEB}/tienda`, imagen: '' })) };
    case 'columnas': return { id, tipo, titulo: 'Un beneficio clave', texto: 'Explica en pocas líneas por qué esto le sirve al cliente.', imagen: `${WEB}/images/modelo9/hero-office.jpg`, derecha: false };
    case 'cifras': return { id, tipo, items: [{ valor: '+500', etiqueta: 'clientes' }, { valor: '15 años', etiqueta: 'de experiencia' }, { valor: '24/7', etiqueta: 'soporte' }] };
    case 'cita': return { id, tipo, texto: 'Excelente servicio, nos ayudaron a migrar toda la infraestructura sin parar la operación.', autor: 'Nombre, Empresa' };
    case 'cupon': return { id, tipo, titulo: '15% de descuento', codigo: 'FP15', detalle: 'Válido hasta fin de mes en toda la tienda.' };
    case 'lista': return { id, tipo, titulo: 'Qué incluye', items: 'Instalación y configuración\nSoporte técnico incluido\nGarantía de 12 meses' };
    default: return { id, tipo: 'separador' };
  }
};

const PLANTILLAS: { nombre: string; descripcion: string; asunto: string; tema?: string; bloques: () => Bloque[] }[] = [
  {
    nombre: 'Promoción de productos', descripcion: 'Portada + 3 productos + botón a la tienda', asunto: 'Ofertas de la semana en FPTecnologi',
    bloques: () => [nuevoBloque('hero'), nuevoBloque('productos'), { ...(nuevoBloque('boton') as Extract<Bloque, { tipo: 'boton' }>), texto: 'Ver la tienda', url: `${WEB}/tienda` }],
  },
  {
    nombre: 'Novedades del blog', descripcion: 'Portada + texto + botón al blog', asunto: 'Nuevo en nuestro blog',
    bloques: () => [nuevoBloque('hero'), nuevoBloque('texto'), { ...(nuevoBloque('boton') as Extract<Bloque, { tipo: 'boton' }>), texto: 'Leer el artículo', url: `${WEB}/blog` }],
  },
  {
    nombre: 'Servicio y cotización', descripcion: 'Texto del servicio + botón al cotizador', asunto: 'Cotiza tu proyecto de TI',
    bloques: () => [{ ...(nuevoBloque('hero') as Extract<Bloque, { tipo: 'hero' }>), titulo: 'Soluciones TI a medida' }, nuevoBloque('texto'), nuevoBloque('boton')],
  },
  { nombre: 'Bienvenida', descripcion: 'Mensaje breve para nuevos suscriptores', asunto: '¡Bienvenido a FPTecnologi!', bloques: () => [{ ...(nuevoBloque('texto') as Extract<Bloque, { tipo: 'texto' }>), titulo: '¡Gracias por suscribirte!', texto: 'Te contaremos primero de promociones, lanzamientos y consejos de tecnología para tu empresa.' }, nuevoBloque('boton')] },
  { nombre: 'Lanzamiento de producto', descripcion: 'Portada, imagen + texto, lista y botón', asunto: 'Ya llegó: conoce lo nuevo', tema: 'oscuro', bloques: () => [{ ...(nuevoBloque('hero') as Extract<Bloque, { tipo: 'hero' }>), titulo: 'Presentamos lo nuevo' }, nuevoBloque('columnas'), nuevoBloque('lista'), nuevoBloque('boton')] },
  { nombre: 'Descuento con cupón', descripcion: 'Oferta con cupón destacado y productos', asunto: 'Un descuento solo para ti', tema: 'calido', bloques: () => [{ ...(nuevoBloque('hero') as Extract<Bloque, { tipo: 'hero' }>), titulo: 'Tu descuento te espera' }, nuevoBloque('cupon'), nuevoBloque('productos'), nuevoBloque('boton')] },
  { nombre: 'Confianza y resultados', descripcion: 'Cifras, testimonio y botón de contacto', asunto: 'Por qué confían en FPTecnologi', tema: 'verde', bloques: () => [nuevoBloque('texto'), nuevoBloque('cifras'), nuevoBloque('cita'), nuevoBloque('boton')] },
  { nombre: 'Boletín minimalista', descripcion: 'Texto limpio, separadores y lista', asunto: 'Novedades del mes', tema: 'minimal', bloques: () => [nuevoBloque('texto'), nuevoBloque('separador'), nuevoBloque('lista'), nuevoBloque('separador'), nuevoBloque('boton')] },
  { nombre: 'Invitación a evento', descripcion: 'Portada elegante, detalles y confirmación', asunto: 'Estás invitado', tema: 'vino', bloques: () => [{ ...(nuevoBloque('hero') as Extract<Bloque, { tipo: 'hero' }>), titulo: 'Te invitamos a nuestro evento' }, { ...(nuevoBloque('lista') as Extract<Bloque, { tipo: 'lista' }>), titulo: 'Detalles', items: 'Fecha: por definir\nHora: por definir\nLugar: por definir' }, { ...(nuevoBloque('boton') as Extract<Bloque, { tipo: 'boton' }>), texto: 'Confirmar asistencia' }] },
  { nombre: 'En blanco', descripcion: 'Empieza desde cero', asunto: '', bloques: () => [nuevoBloque('texto')] },
];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const seguro = (u: string) => (/^(https?:\/\/|mailto:|tel:)/i.test(u.trim()) ? esc(u.trim()) : '#');
const parrafos = (t: string) => esc(t).split(/\n+/).map((p) => `<p style="margin:0 0 12px;">${p}</p>`).join('');

function bloqueHtml(b: Bloque, t: Tema): string {
  const R = t.radio;
  switch (b.tipo) {
    case 'hero':
      return `${b.imagen ? `<tr><td><img src="${seguro(b.imagen)}" alt="" width="600" style="display:block;width:100%;height:auto;border:0;"></td></tr>` : ''}<tr><td style="padding:28px 32px 8px;"><h1 style="margin:0 0 10px;font-size:26px;line-height:1.25;color:${t.titulo};">${esc(b.titulo)}</h1><div style="color:#5B6B7A;font-size:16px;line-height:1.6;">${parrafos(b.texto)}</div></td></tr>`;
    case 'texto':
      return `<tr><td style="padding:20px 32px 4px;"><h2 style="margin:0 0 8px;font-size:19px;color:${t.titulo};">${esc(b.titulo)}</h2><div style="color:${t.texto};font-size:15px;line-height:1.6;">${parrafos(b.texto)}</div></td></tr>`;
    case 'imagen':
      return `<tr><td style="padding:12px 32px;"><img src="${seguro(b.imagen)}" alt="${esc(b.alt)}" width="536" style="display:block;width:100%;height:auto;border:0;border-radius:${R}px;"></td></tr>`;
    case 'boton':
      return `<tr><td align="center" style="padding:20px 32px;"><a href="${seguro(b.url)}" style="display:inline-block;background:${t.primario};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:${Math.min(R, 8)}px;">${esc(b.texto)}</a></td></tr>`;
    case 'productos':
      return `<tr><td style="padding:20px 32px 4px;"><h2 style="margin:0 0 12px;font-size:19px;color:${t.titulo};">${esc(b.titulo)}</h2><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${b.items.map((i) => `<td width="33%" valign="top" style="padding:0 6px;text-align:center;">${i.imagen ? `<img src="${seguro(i.imagen)}" alt="" width="150" style="display:block;width:100%;height:auto;border:0;border-radius:${R}px;margin-bottom:8px;">` : `<div style="height:110px;background:${t.suave};border-radius:${R}px;margin-bottom:8px;"></div>`}<a href="${seguro(i.url)}" style="color:${t.titulo};font-size:13px;font-weight:700;text-decoration:none;">${esc(i.nombre)}</a><div style="color:${t.primario};font-size:13px;margin-top:4px;">${esc(i.precio)}</div></td>`).join('')}</tr></table></td></tr>`;
    case 'columnas': {
      const img = `<td width="45%" valign="middle" style="padding:0 ${b.derecha ? '0 0 16px' : '16px 0 0'};">${b.imagen ? `<img src="${seguro(b.imagen)}" alt="" width="230" style="display:block;width:100%;height:auto;border:0;border-radius:${R}px;">` : `<div style="height:150px;background:${t.suave};border-radius:${R}px;"></div>`}</td>`;
      const txt = `<td width="55%" valign="middle"><h2 style="margin:0 0 8px;font-size:19px;color:${t.titulo};">${esc(b.titulo)}</h2><div style="color:${t.texto};font-size:15px;line-height:1.6;">${parrafos(b.texto)}</div></td>`;
      return `<tr><td style="padding:20px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${b.derecha ? txt + img : img + txt}</tr></table></td></tr>`;
    }
    case 'cifras':
      return `<tr><td style="padding:20px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${t.suave};border-radius:${R}px;"><tr>${b.items.map((i) => `<td align="center" style="padding:18px 8px;"><div style="font-size:26px;font-weight:700;color:${t.primario};">${esc(i.valor)}</div><div style="font-size:13px;color:${t.texto};margin-top:4px;">${esc(i.etiqueta)}</div></td>`).join('')}</tr></table></td></tr>`;
    case 'cita':
      return `<tr><td style="padding:20px 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-left:4px solid ${t.primario};padding:6px 0 6px 16px;"><div style="font-size:17px;line-height:1.55;font-style:italic;color:${t.titulo};">&ldquo;${esc(b.texto)}&rdquo;</div><div style="font-size:13px;color:#5B6B7A;margin-top:8px;">— ${esc(b.autor)}</div></td></tr></table></td></tr>`;
    case 'cupon':
      return `<tr><td align="center" style="padding:20px 32px;"><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border:2px dashed ${t.primario};border-radius:${R}px;background:${t.suave};"><tr><td align="center" style="padding:20px;"><div style="font-size:20px;font-weight:700;color:${t.titulo};">${esc(b.titulo)}</div><div style="display:inline-block;margin:10px 0;padding:8px 20px;background:#ffffff;border-radius:${Math.min(R, 8)}px;font-size:22px;letter-spacing:.12em;font-weight:700;color:${t.primario};">${esc(b.codigo)}</div><div style="font-size:13px;color:${t.texto};">${esc(b.detalle)}</div></td></tr></table></td></tr>`;
    case 'lista':
      return `<tr><td style="padding:20px 32px 4px;"><h2 style="margin:0 0 8px;font-size:19px;color:${t.titulo};">${esc(b.titulo)}</h2><table role="presentation" cellpadding="0" cellspacing="0" width="100%">${b.items.split(/\n+/).filter(Boolean).map((l) => `<tr><td width="22" valign="top" style="color:${t.primario};font-size:16px;line-height:1.6;">&#10003;</td><td style="color:${t.texto};font-size:15px;line-height:1.6;padding-bottom:4px;">${esc(l)}</td></tr>`).join('')}</table></td></tr>`;
    default:
      return `<tr><td style="padding:12px 32px;"><div style="border-top:1px solid #E6EBEF;"></div></td></tr>`;
  }
}

function renderHtml(m: Mailing): string {
  const t = TEMAS[m.tema ?? 'fp'] ?? TEMAS.fp;
  return `<!DOCTYPE html><html lang="es"><body style="margin:0;padding:0;background:${t.fondo};font-family:Arial,Helvetica,sans-serif;">
<span style="display:none;max-height:0;overflow:hidden;">${esc(m.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${t.fondo};padding:24px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:${t.radio}px;overflow:hidden;">
<tr><td style="background:${t.cabecera};padding:18px 32px;${t.cabecera === '#ffffff' ? 'border-bottom:2px solid #111827;' : ''}"><span style="color:${t.cabeceraTexto};font-size:18px;font-weight:700;letter-spacing:.02em;">FPTecnologi</span></td></tr>
${m.bloques.map((b) => bloqueHtml(b, t)).join('\n')}
<tr><td style="padding:20px 32px;background:#F8FAFB;border-top:1px solid #E6EBEF;"><p style="margin:0;font-size:12px;color:#5B6B7A;">FPTecnologi &amp; System · Jr. Huaraz 1841, Breña — Lima, Perú.<br>Recibes este correo porque te suscribiste en nuestra web. <a href="#" style="color:#5B6B7A;">Cancelar suscripción</a></p></td></tr>
</table></td></tr></table></body></html>`;
}

/** Textos [entre corchetes] por reemplazar; ignora los condicionales de Outlook ([if mso], [endif]). */
const esImagen = (c: string) => /^IMAGEN_[A-Z0-9_]+$/.test(c);
const etiquetaImagen = (c: string) => `Imagen: ${c.replace(/^IMAGEN_/, '').replace(/_/g, ' ').toLowerCase()}`;

function marcadores(html: string): string[] {
  const limpio = html.replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, '').replace(/\[(if|endif)[^\]]*\]/gi, '');
  return [...new Set([...limpio.matchAll(/\[([^[\]<>\n]{2,60})\]/g)].map((m) => m[1]).filter((t) => t !== 'Asunto'))];
}
function htmlFinal(m: Mailing): string {
  let h = (m.html ?? '').split('[Asunto]').join(esc(m.asunto || '[Asunto]'));
  // Imágenes opcionales: el bloque entre <!--IMG:X--> y <!--/IMG:X--> solo sale si X tiene una imagen.
  for (const n of new Set([...h.matchAll(/<!--IMG:([A-Z0-9_]+)-->/g)].map((x) => x[1]))) {
    const url = (m.valores?.[n] ?? '').trim();
    h = h.replace(new RegExp(`<!--IMG:${n}-->([^]*?)<!--/IMG:${n}-->`, 'g'), url ? '$1' : '');
  }
  for (const [k, v] of Object.entries(m.valores ?? {})) if (v.trim()) h = h.split(`[${k}]`).join(esc(v.trim()));
  return h;
}

interface Aprobacion { id: string; nombre: string; asunto: string; audiencia: string | null; estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'; nota: string | null; solicitadoPor: string; revisadoPor: string | null; createdAt: string }

/** Copia el correo como contenido con formato: al pegarlo en Outlook (o Gmail) conserva el diseño. */
async function copiarRico(html: string, asunto: string): Promise<boolean> {
  const cuerpo = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
  const doc = `<html><body>${cuerpo}</body></html>`;
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([doc], { type: 'text/html' }), 'text/plain': new Blob([asunto], { type: 'text/plain' }) })]);
    return true;
  } catch { return false; }
}
const abrirOutlook = (asunto: string) => window.open(`https://outlook.office.com/mail/deeplink/compose?subject=${encodeURIComponent(asunto)}`, '_blank', 'noopener');

const cargar = (): Mailing[] => { try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; } };
const guardar = (l: Mailing[]) => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch { /* sin almacenamiento */ } };

export function MailingEditor() {
  const { activeMarcaId, marcas } = useAuth();
  const misAreas = useMemo(
    () => areasDeRoles(marcas.filter((x) => x.marcaId === activeMarcaId).map((x) => x.rol.nombre), !activeMarcaId),
    [marcas, activeMarcaId],
  );
  const [areaVista, setAreaVista] = useState<Area | 'todas'>('todas');
  const [lista, setLista] = useState<Mailing[]>([]);
  const [actualId, setActualId] = useState<string | null>(null);
  const [movil, setMovil] = useState(false);
  const [aviso, setAviso] = useState('');
  const [envio, setEnvio] = useState(false);
  const [audiencia, setAudiencia] = useState('suscriptores');
  const [conteo, setConteo] = useState<number | null>(null);
  const [pegados, setPegados] = useState('');
  const esAdmin = useMemo(() => !activeMarcaId || marcas.some((x) => x.marcaId === activeMarcaId && x.rol.nombre.toLowerCase() === 'admin'), [marcas, activeMarcaId]);
  const [aprobs, setAprobs] = useState<Aprobacion[]>([]);
  const [verAprobs, setVerAprobs] = useState(false);
  const [notaRev, setNotaRev] = useState<Record<string, string>>({});
  const [vistaAprob, setVistaAprob] = useState<{ id: string; html: string } | null>(null);
  const cargarAprobs = () => { if (activeMarcaId) api.get<Aprobacion[]>('/mailing/aprobaciones').then(setAprobs).catch(() => setAprobs([])); };
  useEffect(cargarAprobs, [activeMarcaId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const l = cargar(); setLista(l); setActualId(l[0]?.id ?? null); }, []);
  useEffect(() => {
    if (!activeMarcaId) return;
    api.get<unknown[]>('/boletin/suscriptores').then((r) => setConteo(r.length)).catch(() => setConteo(null));
  }, [activeMarcaId]);

  const m = lista.find((x) => x.id === actualId) ?? null;
  const html = useMemo(() => (!m ? '' : m.html !== undefined ? htmlFinal(m) : renderHtml(m)), [m]);
  const campos = useMemo(() => (m?.html ? marcadores(m.html) : []), [m?.html]);
  const [biblioteca, setBiblioteca] = useState<ItemBiblioteca[] | null>(null);
  const [verBiblioteca, setVerBiblioteca] = useState(false);
  // Por defecto, la biblioteca abre en el área del usuario (ventas → ventas); marketing y admin ven todas.
  useEffect(() => setAreaVista(misAreas.length === 2 ? misAreas[0] : 'todas'), [misAreas]);
  const [verCodigo, setVerCodigo] = useState(false);
  const emails = useMemo(() => [...new Set(pegados.split(/[\s,;]+/).filter((e) => /^\S+@\S+\.\S+$/.test(e)))], [pegados]);

  const nota = (t: string) => { setAviso(t); setTimeout(() => setAviso(''), 3500); };
  const guardarLista = (l: Mailing[]) => { setLista(l); guardar(l); };
  const cambiar = (patch: Partial<Mailing>) => m && guardarLista(lista.map((x) => (x.id === m.id ? { ...x, ...patch, actualizado: new Date().toISOString() } : x)));
  const cambiarBloque = (id: string, patch: Record<string, unknown>) => m && cambiar({ bloques: m.bloques.map((b) => (b.id === id ? ({ ...b, ...patch } as Bloque) : b)) });

  async function abrirBiblioteca() {
    setVerBiblioteca((v) => !v);
    if (biblioteca) return;
    try { setBiblioteca(await (await fetch('/mailing-fp/catalogo.json')).json()); } catch { nota('No se pudo cargar la biblioteca'); }
  }
  async function importar(it: ItemBiblioteca) {
    try {
      const h = await (await fetch(`/mailing-fp/${it.archivo}`)).text();
      const asunto = (h.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '').replace(/\s*\|\s*FP Tecnologi.*$/i, '').trim();
      const n: Mailing = { id: uid(), nombre: it.nombre, asunto: asunto.startsWith('[') ? '' : asunto, preheader: '', bloques: [], html: h, valores: { ...(it.valores ?? {}) }, actualizado: new Date().toISOString() };
      guardarLista([n, ...lista]);
      setActualId(n.id);
      setVerBiblioteca(false);
    } catch { nota('No se pudo abrir la plantilla'); }
  }
  function crear(p: (typeof PLANTILLAS)[number]) {
    const n: Mailing = { id: uid(), tema: p.tema ?? 'fp', nombre: p.nombre, asunto: p.asunto, preheader: '', bloques: p.bloques(), actualizado: new Date().toISOString() };
    guardarLista([n, ...lista]);
    setActualId(n.id);
  }
  const duplicar = () => { if (!m) return; const n = { ...m, id: uid(), nombre: `${m.nombre} (copia)`, bloques: m.bloques.map((b) => ({ ...b, id: uid() })) as Bloque[] }; guardarLista([n, ...lista]); setActualId(n.id); };
  const eliminar = () => { if (!m || !window.confirm(`¿Eliminar «${m.nombre}»?`)) return; const l = lista.filter((x) => x.id !== m.id); guardarLista(l); setActualId(l[0]?.id ?? null); };
  const mover = (i: number, d: number) => { if (!m) return; const b = [...m.bloques]; const j = i + d; if (j < 0 || j >= b.length) return; [b[i], b[j]] = [b[j], b[i]]; cambiar({ bloques: b }); };
  const copiarHtml = async () => { try { await navigator.clipboard.writeText(html); nota('HTML copiado'); } catch { nota('No se pudo copiar'); } };
  /** Copia el correo como contenido con formato (no como código): al pegarlo en Outlook (o Gmail) conserva el diseño. */
  const copiarOutlook = async () => {
    if (!m) return;
    nota(await copiarRico(html, m.asunto) ? 'Copiado con formato: pega con Ctrl+V en un correo nuevo de Outlook' : 'Tu navegador no permite copiar con formato; usa «Copiar HTML» o «Descargar HTML»');
  };
  const enviarPorOutlook = async () => {
    if (!m) return;
    const ok = await copiarRico(html, m.asunto);
    abrirOutlook(m.asunto);
    nota(ok ? 'Se abrió Outlook: pega el correo copiado (Ctrl+V) en el cuerpo y envíalo' : 'Se abrió Outlook; usa «Copiar HTML» o «Descargar HTML» para el cuerpo');
  };
  /** Aprobado: copia el correo con formato y abre Outlook con el asunto puesto. */
  async function enviarAprobado(id: string, asunto: string) {
    try {
      const d = await api.get<{ html: string }>(`/mailing/aprobaciones/${id}`);
      const ok = await copiarRico(d.html, asunto);
      abrirOutlook(asunto);
      nota(ok ? 'Se abrió Outlook: pega el correo copiado (Ctrl+V) en el cuerpo y envíalo' : 'Se abrió Outlook; no se pudo copiar con formato');
    } catch { nota('No se pudo abrir el correo aprobado'); }
  }
  async function abrirEnEditor(id: string) {
    try {
      const d = await api.get<{ html: string; nombre: string; asunto: string; preheader: string | null }>(`/mailing/aprobaciones/${id}`);
      const n: Mailing = { id: uid(), nombre: `${d.nombre} (aprobado)`, asunto: d.asunto, preheader: d.preheader ?? '', bloques: [], html: d.html, valores: {}, actualizado: new Date().toISOString() };
      guardarLista([n, ...lista]);
      setActualId(n.id);
      nota('Cargado en el editor');
    } catch { nota('No se pudo abrir'); }
  }
  async function aAprobacion() {
    if (!m) return;
    if (!m.asunto.trim()) return nota('Escribe el asunto antes de enviarlo a aprobación');
    try {
      await api.post('/mailing/aprobaciones', { nombre: m.nombre, asunto: m.asunto, preheader: m.preheader, html, audiencia: audiencia === 'suscriptores' ? `Suscriptores del boletín${conteo !== null ? ` (${conteo})` : ''}` : `Lista pegada (${emails.length})` });
      setEnvio(false);
      setVerAprobs(true);
      cargarAprobs();
      nota('Enviado a aprobación del administrador');
    } catch { nota('No se pudo enviar a aprobación'); }
  }
  async function revisar(id: string, accion: 'aprobar' | 'rechazar') {
    try { await api.patch(`/mailing/aprobaciones/${id}/${accion}`, { nota: notaRev[id] ?? '' }); cargarAprobs(); nota(accion === 'aprobar' ? 'Mailing aprobado' : 'Mailing rechazado'); } catch { nota('No se pudo guardar la revisión'); }
  }
  async function verAprob(id: string) {
    try { const d = await api.get<{ html: string }>(`/mailing/aprobaciones/${id}`); setVistaAprob({ id, html: d.html }); } catch { nota('No se pudo abrir'); }
  }
  const descargar = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' })); a.download = `${m?.nombre ?? 'mailing'}.html`; a.click(); URL.revokeObjectURL(a.href); };

  const destinatarios = audiencia === 'suscriptores' ? (conteo ?? 0) : emails.length;
  const campo = (id: string, label: string, valor: string, onChange: (v: string) => void, area = false) => (
    <div className="ax-field" key={id}>
      <label className="ax-label" htmlFor={id}>{label}</label>
      {area ? <textarea id={id} className="ax-textarea" rows={3} value={valor} onChange={(e) => onChange(e.target.value)} /> : <input id={id} className="ax-input" value={valor} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );

  return (
    <>
      <PageHead title="Mailing" subtitle="Arma correos a partir de plantillas. Los comerciales los mandan a revisión; el administrador los aprueba y se envían copiándolos a Outlook." />

      <section className="ax-card" style={{ padding: 'var(--ax-space-4)', marginBlockEnd: 'var(--ax-space-4)' }}>
        <strong style={{ color: 'var(--ax-text-strong)' }}>Nuevo mailing desde plantilla</strong>
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)', marginBlockStart: 'var(--ax-space-3)', alignItems: 'stretch' }}>
          {PLANTILLAS.map((p) => (
            <button key={p.nombre} type="button" className="ax-card" onClick={() => crear(p)} style={{ padding: 'var(--ax-space-3)', textAlign: 'left', cursor: 'pointer', minWidth: 190, flex: '1 1 190px' }}>
              <div style={{ fontWeight: 'var(--ax-weight-medium)', color: 'var(--ax-text-strong)' }}>{p.nombre}</div>
              <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{p.descripcion}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="ax-card" style={{ padding: 'var(--ax-space-4)', marginBlockEnd: 'var(--ax-space-4)' }}>
        <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
          <div>
            <strong style={{ color: 'var(--ax-text-strong)' }}>Biblioteca mailing-fp</strong>
            <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Plantillas base y campañas ya diseñadas (responsivas, probadas en Gmail y Outlook). Se copian aquí para editarlas.</div>
          </div>
          <button type="button" className="ax-btn ax-btn--ghost" onClick={abrirBiblioteca}>{verBiblioteca ? 'Ocultar' : 'Ver biblioteca'}</button>
        </div>
        {verBiblioteca && (biblioteca ?? []).length > 0 && (() => {
          const visibles = biblioteca!.filter((b) => misAreas.includes(b.area ?? 'general') && (areaVista === 'todas' || (b.area ?? 'general') === areaVista || (b.area ?? 'general') === 'general'));
          return (
            <>
              {misAreas.length > 2 && (
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginBlockStart: 'var(--ax-space-3)', flexWrap: 'wrap' }} role="group" aria-label="Área">
                  {(['todas', ...misAreas.filter((a) => a !== 'general')] as const).map((a) => (
                    <button key={a} type="button" className={`ax-btn ax-btn--sm ${areaVista === a ? 'ax-btn--secondary' : 'ax-btn--ghost'}`} onClick={() => setAreaVista(a)}>{a === 'todas' ? 'Todas las áreas' : AREA_NOMBRE[a]}</button>
                  ))}
                </div>
              )}
              {[...new Set(visibles.map((b) => b.grupo))].map((g) => (
                <div key={g} style={{ marginBlockStart: 'var(--ax-space-3)' }}>
                  <div style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)', marginBlockEnd: 6 }}>{g} <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>· {AREA_NOMBRE[visibles.find((b) => b.grupo === g)?.area ?? 'general']}</span></div>
                  <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                    {visibles.filter((b) => b.grupo === g).map((b) => (
                      <button key={b.archivo} type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => importar(b)}>{b.nombre}</button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          );
        })()}
      </section>

      {lista.length === 0 && <p style={{ color: 'var(--ax-text-muted)' }}>Aún no tienes mailings. Elige una plantilla para empezar.</p>}

      {m && (
        <>
          <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', marginBlockEnd: 'var(--ax-space-3)', flexWrap: 'wrap' }}>
            <Select className="ax-select" aria-label="Mailing" value={m.id} onChange={(e) => setActualId(e.target.value)}>
              {lista.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
            </Select>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={duplicar}>Duplicar</button>
            <button type="button" className="ax-btn ax-btn--secondary" onClick={copiarOutlook}>Copiar para Outlook</button>
            {esAdmin && <button type="button" className="ax-btn ax-btn--secondary" onClick={enviarPorOutlook}>Copiar y abrir Outlook</button>}
            <button type="button" className="ax-btn ax-btn--ghost" onClick={copiarHtml}>Copiar HTML</button>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={descargar}>Descargar HTML</button>
            <button type="button" className="ax-btn ax-btn--ghost" onClick={eliminar}>Eliminar</button>
            <button type="button" className="ax-btn ax-btn--primary" onClick={() => setEnvio(true)}><span className="ax-btn__label">{esAdmin ? 'Enviar…' : 'Enviar a aprobación…'}</span></button>
            {aviso && <span role="status" style={{ color: 'var(--ax-text-muted)' }}>{aviso}</span>}
          </div>

          <div style={{ display: 'flex', gap: 'var(--ax-space-4)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <section className="ax-card" style={{ padding: 'var(--ax-space-4)', flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              {campo('ml-nombre', 'Nombre interno', m.nombre, (v) => cambiar({ nombre: v }))}
              {campo('ml-asunto', 'Asunto del correo', m.asunto, (v) => cambiar({ asunto: v }))}
              {campo('ml-pre', 'Texto de vista previa (preheader)', m.preheader, (v) => cambiar({ preheader: v }))}
              {m.html === undefined && (
                <div className="ax-field">
                  <label className="ax-label" htmlFor="ml-tema">Diseño (colores y estilo)</label>
                  <Select id="ml-tema" className="ax-select" value={m.tema ?? 'fp'} onChange={(e) => cambiar({ tema: e.target.value })}>
                    {Object.entries(TEMAS).map(([k, t]) => <option key={k} value={k}>{t.nombre}</option>)}
                  </Select>
                </div>
              )}
              {m.html !== undefined && (
                <>
                  <strong style={{ color: 'var(--ax-text-strong)' }}>Textos por completar</strong>
                  {campos.length === 0 && <p style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>No quedan [marcadores] por reemplazar. Para cambiar otros textos o imágenes edita el HTML.</p>}
                  {campos.map((c, k) => (esImagen(c) ? (
                    <div key={c} className="ax-field">
                      <label className="ax-label" htmlFor={`ml-v${k}`}>{etiquetaImagen(c)}</label>
                      <CampoImagen id={`ml-v${k}`} value={m.valores?.[c] ?? ''} onChange={(u) => cambiar({ valores: { ...m.valores, [c]: u } })} />
                      <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Opcional. Sin imagen, ese espacio no aparece en el correo. Medida recomendada de la portada: 1280 × 640 px.</span>
                    </div>
                  ) : campo(`ml-v${k}`, c, m.valores?.[c] ?? '', (v) => cambiar({ valores: { ...m.valores, [c]: v } }))))}
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => setVerCodigo((v) => !v)}>{verCodigo ? 'Ocultar HTML' : 'Editar HTML'}</button>
                  {verCodigo && <textarea aria-label="Código HTML" className="ax-textarea" rows={16} spellCheck={false} style={{ fontFamily: 'var(--ax-font-mono)', fontSize: 12 }} value={m.html} onChange={(e) => cambiar({ html: e.target.value })} />}
                </>
              )}
              {m.html === undefined && <strong style={{ color: 'var(--ax-text-strong)' }}>Contenido</strong>}
              {m.html === undefined && m.bloques.map((b, i) => (
                <div key={b.id} className="ax-card" style={{ padding: 'var(--ax-space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
                  <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
                    <span className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">{ETIQUETA[b.tipo]}</span>
                    <span className="ax-cluster" style={{ gap: 2 }}>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label="Subir" onClick={() => mover(i, -1)}>↑</button>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" aria-label="Bajar" onClick={() => mover(i, 1)}>↓</button>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => cambiar({ bloques: m.bloques.filter((x) => x.id !== b.id) })}>Quitar</button>
                    </span>
                  </div>
                  {b.tipo === 'hero' && <>{campo(`${b.id}t`, 'Título', b.titulo, (v) => cambiarBloque(b.id, { titulo: v }))}{campo(`${b.id}x`, 'Texto', b.texto, (v) => cambiarBloque(b.id, { texto: v }), true)}<div className="ax-field"><span className="ax-label">Imagen</span><CampoImagen value={b.imagen} onChange={(u) => cambiarBloque(b.id, { imagen: u })} /></div></>}
                  {b.tipo === 'texto' && <>{campo(`${b.id}t`, 'Título', b.titulo, (v) => cambiarBloque(b.id, { titulo: v }))}{campo(`${b.id}x`, 'Texto', b.texto, (v) => cambiarBloque(b.id, { texto: v }), true)}</>}
                  {b.tipo === 'imagen' && <><div className="ax-field"><span className="ax-label">Imagen</span><CampoImagen value={b.imagen} onChange={(u) => cambiarBloque(b.id, { imagen: u })} /></div>{campo(`${b.id}a`, 'Texto alternativo', b.alt, (v) => cambiarBloque(b.id, { alt: v }))}</>}
                  {b.tipo === 'boton' && <>{campo(`${b.id}t`, 'Texto del botón', b.texto, (v) => cambiarBloque(b.id, { texto: v }))}{campo(`${b.id}u`, 'Enlace', b.url, (v) => cambiarBloque(b.id, { url: v }))}</>}
                  {b.tipo === 'columnas' && <>{campo(`${b.id}t`, 'Título', b.titulo, (v) => cambiarBloque(b.id, { titulo: v }))}{campo(`${b.id}x`, 'Texto', b.texto, (v) => cambiarBloque(b.id, { texto: v }), true)}<div className="ax-field"><span className="ax-label">Imagen</span><CampoImagen value={b.imagen} onChange={(u) => cambiarBloque(b.id, { imagen: u })} /></div><label className="ax-cluster" style={{ gap: 8 }}><input type="checkbox" checked={b.derecha} onChange={(e) => cambiarBloque(b.id, { derecha: e.target.checked })} /> Imagen a la derecha</label></>}
                  {b.tipo === 'cifras' && b.items.map((it, k) => (
                    <div key={k} className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
                      <input className="ax-input ax-input--sm" style={{ flex: '1 1 90px' }} aria-label={`Valor ${k + 1}`} value={it.valor} onChange={(e) => cambiarBloque(b.id, { items: b.items.map((x, j) => (j === k ? { ...x, valor: e.target.value } : x)) })} />
                      <input className="ax-input ax-input--sm" style={{ flex: '2 1 140px' }} aria-label={`Etiqueta ${k + 1}`} value={it.etiqueta} onChange={(e) => cambiarBloque(b.id, { items: b.items.map((x, j) => (j === k ? { ...x, etiqueta: e.target.value } : x)) })} />
                    </div>
                  ))}
                  {b.tipo === 'cita' && <>{campo(`${b.id}x`, 'Testimonio', b.texto, (v) => cambiarBloque(b.id, { texto: v }), true)}{campo(`${b.id}a`, 'Autor', b.autor, (v) => cambiarBloque(b.id, { autor: v }))}</>}
                  {b.tipo === 'cupon' && <>{campo(`${b.id}t`, 'Título', b.titulo, (v) => cambiarBloque(b.id, { titulo: v }))}{campo(`${b.id}c`, 'Código', b.codigo, (v) => cambiarBloque(b.id, { codigo: v }))}{campo(`${b.id}d`, 'Detalle', b.detalle, (v) => cambiarBloque(b.id, { detalle: v }))}</>}
                  {b.tipo === 'lista' && <>{campo(`${b.id}t`, 'Título', b.titulo, (v) => cambiarBloque(b.id, { titulo: v }))}{campo(`${b.id}x`, 'Elementos (uno por línea)', b.items, (v) => cambiarBloque(b.id, { items: v }), true)}</>}
                  {b.tipo === 'productos' && (
                    <>
                      {campo(`${b.id}t`, 'Título de la sección', b.titulo, (v) => cambiarBloque(b.id, { titulo: v }))}
                      {b.items.map((it, k) => (
                        <div key={k} className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
                          {(['nombre', 'precio', 'url', 'imagen'] as const).map((f) => (
                            <input key={f} className="ax-input ax-input--sm" style={{ flex: '1 1 110px' }} placeholder={f} aria-label={`${f} del producto ${k + 1}`} value={it[f]} onChange={(e) => cambiarBloque(b.id, { items: b.items.map((x, j) => (j === k ? { ...x, [f]: e.target.value } : x)) })} />
                          ))}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
              {m.html === undefined && <div className="ax-cluster" style={{ gap: 'var(--ax-space-1)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Agregar:</span>
                {(Object.keys(ETIQUETA) as Bloque['tipo'][]).map((t) => (
                  <button key={t} type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => cambiar({ bloques: [...m.bloques, nuevoBloque(t)] })}>{ETIQUETA[t]}</button>
                ))}
              </div>}
            </section>

            <section className="ax-card" style={{ padding: 'var(--ax-space-3)', flex: '1 1 420px', position: 'sticky', top: 'var(--ax-space-4)' }}>
              <div className="ax-cluster" style={{ justifyContent: 'space-between', marginBlockEnd: 'var(--ax-space-2)' }}>
                <strong style={{ color: 'var(--ax-text-strong)' }}>Vista previa</strong>
                <span className="ax-cluster" style={{ gap: 2 }}>
                  <button type="button" className={`ax-btn ax-btn--sm ${!movil ? 'ax-btn--primary' : 'ax-btn--ghost'}`} onClick={() => setMovil(false)}>Escritorio</button>
                  <button type="button" className={`ax-btn ax-btn--sm ${movil ? 'ax-btn--primary' : 'ax-btn--ghost'}`} onClick={() => setMovil(true)}>Móvil</button>
                </span>
              </div>
              <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', marginBlockEnd: 6 }}>Asunto: <strong>{m.asunto || '(sin asunto)'}</strong></div>
              {/* sandbox sin permisos: el HTML del correo no puede ejecutar nada en el dashboard */}
              <iframe title="Vista previa del correo" srcDoc={html} sandbox="" style={{ width: movil ? 375 : '100%', maxWidth: '100%', height: 640, border: '1px solid var(--ax-border)', borderRadius: 10, display: 'block', margin: '0 auto', background: '#fff' }} />
            </section>
          </div>
        </>
      )}

      <section className="ax-card" style={{ padding: 'var(--ax-space-4)', marginBlockStart: 'var(--ax-space-4)' }}>
        <div className="ax-cluster" style={{ justifyContent: 'space-between' }}>
          <div>
            <strong style={{ color: 'var(--ax-text-strong)' }}>Aprobaciones{aprobs.filter((a) => a.estado === 'PENDIENTE').length > 0 ? ` (${aprobs.filter((a) => a.estado === 'PENDIENTE').length} pendientes)` : ''}</strong>
            <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>{esAdmin ? 'Revisa y aprueba los mailings que manda el equipo.' : 'Estado de los mailings que mandaste al administrador.'}</div>
          </div>
          <button type="button" className="ax-btn ax-btn--ghost" onClick={() => { setVerAprobs((v) => !v); cargarAprobs(); }}>{verAprobs ? 'Ocultar' : 'Ver aprobaciones'}</button>
        </div>
        {verAprobs && (aprobs.length === 0 ? <p style={{ color: 'var(--ax-text-muted)', marginBlockStart: 'var(--ax-space-3)' }}>No hay mailings enviados a aprobación.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)', marginBlockStart: 'var(--ax-space-3)' }}>
            {aprobs.map((a) => (
              <div key={a.id} className="ax-card" style={{ padding: 'var(--ax-space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-2)' }}>
                <div className="ax-cluster" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <span><strong>{a.nombre}</strong> <span style={{ color: 'var(--ax-text-subtle)', fontSize: 'var(--ax-text-xs)' }}>· {a.asunto} · {a.audiencia ?? ''} · {a.solicitadoPor} · {new Date(a.createdAt).toLocaleString('es-PE')}</span></span>
                  <span className={`ax-badge ax-badge--soft ax-badge--pill ax-badge--${a.estado === 'APROBADO' ? 'success' : a.estado === 'RECHAZADO' ? 'danger' : 'warning'}`}>{a.estado === 'APROBADO' ? 'Aprobado' : a.estado === 'RECHAZADO' ? 'Rechazado' : 'Pendiente'}</span>
                </div>
                {a.nota && <div style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Nota de {a.revisadoPor}: {a.nota}</div>}
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'wrap' }}>
                  <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => (vistaAprob?.id === a.id ? setVistaAprob(null) : verAprob(a.id))}>{vistaAprob?.id === a.id ? 'Cerrar vista' : 'Ver correo'}</button>
                  {a.estado === 'APROBADO' && (
                    <>
                      <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" onClick={() => enviarAprobado(a.id, a.asunto)}>Copiar y abrir Outlook</button>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrirEnEditor(a.id)}>Abrir en el editor</button>
                    </>
                  )}
                  {esAdmin && a.estado === 'PENDIENTE' && (
                    <>
                      <input className="ax-input ax-input--sm" style={{ flex: '1 1 200px' }} placeholder="Nota (opcional)" aria-label="Nota de revisión" value={notaRev[a.id] ?? ''} onChange={(e) => setNotaRev({ ...notaRev, [a.id]: e.target.value })} />
                      <button type="button" className="ax-btn ax-btn--primary ax-btn--sm" onClick={() => revisar(a.id, 'aprobar')}>Aprobar</button>
                      <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" style={{ color: 'var(--ax-danger-500)' }} onClick={() => revisar(a.id, 'rechazar')}>Rechazar</button>
                    </>
                  )}
                </div>
                {vistaAprob?.id === a.id && <iframe title="Correo enviado a aprobación" srcDoc={vistaAprob.html} sandbox="" style={{ width: '100%', height: 520, border: '1px solid var(--ax-border)', borderRadius: 10, background: '#fff' }} />}
              </div>
            ))}
          </div>
        ))}
      </section>

      {envio && m && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setEnvio(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)' }} />
          <div role="dialog" aria-modal="true" aria-label="Enviar mailing" className="ax-card" style={{ position: 'relative', maxWidth: 520, width: '100%', padding: 'var(--ax-space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
            <h2 className="ax-card__title">Enviar «{m.nombre}»</h2>
            <div className="ax-field">
              <label className="ax-label" htmlFor="ml-aud">Enviar a</label>
              <Select id="ml-aud" className="ax-select" value={audiencia} onChange={(e) => setAudiencia(e.target.value)}>
                <option value="suscriptores">Suscriptores del boletín{conteo !== null ? ` (${conteo})` : ''}</option>
                <option value="pegados">Lista de correos que pego</option>
              </Select>
            </div>
            {audiencia === 'pegados' && <div className="ax-field"><label className="ax-label" htmlFor="ml-lista">Correos (separados por coma, espacio o línea)</label><textarea id="ml-lista" className="ax-textarea" rows={4} value={pegados} onChange={(e) => setPegados(e.target.value)} /></div>}
            <p style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>Destinatarios: <strong>{destinatarios}</strong>. Al aprobarse, el correo se envía desde Outlook con «Copiar y abrir Outlook».</p>
            <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
              <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEnvio(false)}>Cerrar</button>
              <button type="button" className={`ax-btn ${esAdmin ? 'ax-btn--secondary' : 'ax-btn--primary'}`} disabled={destinatarios === 0 || !m.asunto.trim()} onClick={aAprobacion}><span className="ax-btn__label">Mandar a aprobación</span></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MailingEditor;
