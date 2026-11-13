/*
 * Plantillas de correo transaccional — HTML con estilos inline (tablas, sin
 * CSS externo) porque así es el único modo que se renderiza igual en Gmail,
 * Outlook y clientes móviles. Un solo layout de marca envuelve el contenido
 * de cada correo para que todos se vean consistentes.
 */

const BRAND_COLOR = '#008DC5';
const TEXT_COLOR = '#1F2733';
const MUTED_COLOR = '#5B6B7A';

/** Marca que firma el correo (nombre, color y logo de la cabecera). Sin ella, FPTecnologi. */
export interface MarcaCorreo { nombre: string; color?: string | null; logo?: string | null; email?: string | null }

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function rgb(hex: string): [number, number, number] {
  let h = hex.slice(1);
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const aHex = (c: number[]) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
/** Mezcla `hex` con `con` (0 = hex, 1 = con). */
const mezclar = (hex: string, con: [number, number, number], t: number) => aHex(rgb(hex).map((v, i) => v * (1 - t) + con[i] * t));

/** Colores del correo derivados del color de la marca: botón/cabecera, fondo suave de los recuadros y texto de los códigos. */
export function tema(marca?: MarcaCorreo | null) {
  const color = marca?.color && HEX.test(marca.color) ? marca.color : BRAND_COLOR;
  const [r, g, b] = rgb(color);
  // Texto de la cabecera/botón: blanco salvo que el color de marca sea muy claro (plata, amarillo…).
  const claro = (0.299 * r + 0.587 * g + 0.114 * b) > 170;
  return {
    color,
    sobre: claro ? '#1F2733' : '#FFFFFF',
    suave: mezclar(color, [255, 255, 255], 0.9),
    fuerte: mezclar(color, [0, 0, 0], 0.35),
    nombre: marca?.nombre?.trim() || 'FPTecnologi',
  };
}

/** Asunto personalizado: lleva el nombre de la marca (sin repetirlo si el texto ya lo trae). */
export function asunto(texto: string, marca?: MarcaCorreo | null): string {
  const { nombre } = tema(marca);
  if (texto.toLowerCase().includes(nombre.toLowerCase())) return texto;
  return `${texto} · ${nombre}`;
}

function boton(url: string, texto: string, marca?: MarcaCorreo | null, extra = ''): string {
  const t = tema(marca);
  return `<a href="${escapeHtml(url)}" style="display:inline-block;${extra}background:${t.color};color:${t.sobre};text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;">${escapeHtml(texto)}</a>`;
}

function layout(bodyHtml: string, marca?: MarcaCorreo): string {
  const t = tema(marca);
  const color = t.color;
  const nombre = escapeHtml(t.nombre);
  const logo = marca?.logo && /^https?:\/\//i.test(marca.logo)
    ? `<img src="${escapeHtml(marca.logo)}" alt="${nombre}" height="32" style="display:block;border:0;max-height:32px;width:auto;" />`
    : `<span style="color:${t.sobre};font-size:18px;font-weight:700;letter-spacing:.02em;">${nombre}</span>`;
  const contacto = marca?.email ? ` · <a href="mailto:${escapeHtml(marca.email)}" style="color:${MUTED_COLOR};">${escapeHtml(marca.email)}</a>` : '';
  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#F0F3F6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0F3F6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:${color};padding:20px 32px;border-bottom:4px solid ${t.fuerte};">
              ${logo}
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:${TEXT_COLOR};font-size:15px;line-height:1.6;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#F8FAFB;border-top:1px solid #E6EBEF;">
              <p style="margin:0;font-size:12px;color:${MUTED_COLOR};">
                Mensaje automático de ${nombre}. Si no reconoces esta actividad, ignora este correo.${contacto}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function codeBlock(codigo: string, marca?: MarcaCorreo): string {
  const t = tema(marca);
  return `<div style="margin:24px 0;text-align:center;">
    <span style="display:inline-block;background:${t.suave};color:${t.fuerte};font-size:30px;font-weight:700;letter-spacing:.3em;padding:16px 20px;border-radius:8px;font-family:'Courier New',monospace;">${codigo}</span>
  </div>`;
}

export function otpCodeEmail(codigo: string, minutos: number, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto('Tu código de verificación', marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Verificación en dos pasos</h1>
      <p style="margin:0;color:${MUTED_COLOR};">Usa este código para completar tu inicio de sesión:</p>
      ${codeBlock(codigo, marca)}
      <p style="margin:0;color:${MUTED_COLOR};">Vence en ${minutos} minutos. Si no fuiste tú, ignora este correo — tu cuenta sigue segura.</p>
    `, marca),
  };
}

export function passwordResetCodeEmail(codigo: string, minutos: number, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto('Recuperar tu contraseña', marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Recuperar contraseña</h1>
      <p style="margin:0;color:${MUTED_COLOR};">Usa este código para elegir una nueva contraseña:</p>
      ${codeBlock(codigo, marca)}
      <p style="margin:0;color:${MUTED_COLOR};">Vence en ${minutos} minutos. Si no pediste este cambio, ignora este correo — tu contraseña actual sigue siendo válida.</p>
    `, marca),
  };
}

export function welcomeEmail(nombre: string | null, marca?: MarcaCorreo): { subject: string; html: string } {
  const saludo = nombre ? `¡Hola, ${nombre}!` : '¡Hola!';
  return {
    subject: asunto(`Bienvenido a ${tema(marca).nombre}`, marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">${saludo}</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Tu cuenta se creó correctamente. Ya puedes iniciar sesión y empezar a usar la plataforma.</p>
      <p style="margin:0;color:${MUTED_COLOR};">Si no creaste esta cuenta, contáctanos respondiendo este correo.</p>
    `, marca),
  };
}

export function passwordChangedEmail(marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto('Tu contraseña fue actualizada', marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Contraseña actualizada</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Tu contraseña se cambió correctamente. Por seguridad, cerramos todas tus sesiones activas — vuelve a iniciar sesión con la nueva contraseña.</p>
      <p style="margin:0;color:${MUTED_COLOR};">Si no hiciste este cambio, contáctanos de inmediato respondiendo este correo.</p>
    `, marca),
  };
}

export function pedidoConfirmadoEmail(pedidoId: string, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto('¡Gracias por tu pedido!', marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">¡Gracias por tu compra!</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Recibimos tu pedido y ya lo estamos procesando.</p>
      <div style="margin:20px 0;padding:14px 20px;background:${tema(marca).suave};border-radius:8px;">
        <span style="color:${MUTED_COLOR};font-size:13px;">Número de pedido</span><br/>
        <span style="color:${tema(marca).fuerte};font-size:16px;font-weight:700;">${pedidoId}</span>
      </div>
      <p style="margin:0;color:${MUTED_COLOR};">Te avisaremos por correo cuando cambie su estado.</p>
    `, marca),
  };
}

// El texto viene de un visitante anónimo: se escapa antes de meterlo al HTML.
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export function chatNuevoEmail(primerMensaje: string, url: string, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto('Nueva conversación en el chat de la web', marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Alguien está conversando con el asistente</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Un visitante de la web inició una conversación con el asistente virtual. Su primer mensaje:</p>
      <div style="margin:20px 0;padding:14px 20px;background:${tema(marca).suave};border-radius:8px;color:${TEXT_COLOR};">
        ${escapeHtml(primerMensaje.slice(0, 500))}
      </div>
      <p style="margin:0 0 20px;color:${MUTED_COLOR};">Puedes leer la conversación y retomarla como asesor desde el dashboard.</p>
      ${boton(url, 'Ver conversación', marca)}
    `, marca),
  };
}

export function leadNuevoEmail(nombre: string, interes: string, url: string, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto('Nuevo lead del cotizador', marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Nueva solicitud de cotización</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Alguien llenó el cotizador de la web:</p>
      <div style="margin:20px 0;padding:14px 20px;background:${tema(marca).suave};border-radius:8px;color:${TEXT_COLOR};">
        <strong>${escapeHtml(nombre.slice(0, 160))}</strong><br />Interés: ${escapeHtml(interes.slice(0, 200))}
      </div>
      ${boton(url, 'Ver lead', marca)}
    `, marca),
  };
}

export function contactoNuevoEmail(titulo: string, nombre: string, mensaje: string, url: string, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto(titulo, marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">${escapeHtml(titulo)}</h1>
      <div style="margin:20px 0;padding:14px 20px;background:${tema(marca).suave};border-radius:8px;color:${TEXT_COLOR};">
        <strong>${escapeHtml(nombre.slice(0, 160))}</strong><br />${escapeHtml(mensaje.slice(0, 300))}
      </div>
      ${boton(url, 'Ver en el dashboard', marca)}
    `, marca),
  };
}

export function invitacionEmail(nombreMarca: string, rol: string, url: string, dias: number, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto(`Te invitaron a ${nombreMarca}`, marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Te invitaron a unirte al equipo</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Te sumaron a <b>${escapeHtml(nombreMarca)}</b> con el rol <b>${escapeHtml(rol)}</b>. Acepta la invitación para crear tu acceso al dashboard.</p>
      <p style="margin:20px 0;">${boton(url, 'Aceptar invitación', marca)}</p>
      <p style="margin:0;color:${MUTED_COLOR};">El enlace vence en ${dias} días.</p>
    `, marca),
  };
}

export interface CotizacionCorreo {
  numero: string;
  cliente: string;
  servicio: string;
  propuesta: string | null;
  monto: string | null; // ya formateado: "USD 1,200.00"
  validezHasta: string | null; // ya formateada
  mensajeExtra?: string | null;
}

export function cotizacionServicioEmail(c: CotizacionCorreo, marca?: MarcaCorreo): { subject: string; html: string } {
  const filas = [
    c.monto ? `<tr><td style="padding:6px 0;color:${MUTED_COLOR};">Inversión</td><td style="padding:6px 0;text-align:right;font-weight:700;">${escapeHtml(c.monto)}</td></tr>` : '',
    c.validezHasta ? `<tr><td style="padding:6px 0;color:${MUTED_COLOR};">Válida hasta</td><td style="padding:6px 0;text-align:right;">${escapeHtml(c.validezHasta)}</td></tr>` : '',
  ].join('');
  return {
    subject: asunto(`Tu cotización ${c.numero} · ${c.servicio}`, marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Tu cotización de ${escapeHtml(c.servicio)}</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Hola ${escapeHtml(c.cliente)}, gracias por tu interés. Esta es nuestra propuesta (referencia <b>${escapeHtml(c.numero)}</b>):</p>
      ${c.mensajeExtra ? `<p style="margin:0 0 12px;">${escapeHtml(c.mensajeExtra).replace(/\n/g, '<br>')}</p>` : ''}
      ${c.propuesta ? `<div style="margin:16px 0;padding:14px 20px;background:${tema(marca).suave};border-radius:8px;color:${TEXT_COLOR};">${escapeHtml(c.propuesta).replace(/\n/g, '<br>')}</div>` : ''}
      ${filas ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;border-top:1px solid #E6EBEF;">${filas}</table>` : ''}
      <p style="margin:0;color:${MUTED_COLOR};">Si quieres avanzar o ajustar algo, responde este correo o escríbenos por WhatsApp y un asesor te atiende.</p>
    `, marca),
  };
}

export function presupuestoClienteEmail(d: { numero: string; cliente: string; total: string; validezHasta: string; url: string }, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto(`Tu presupuesto ${d.numero}`, marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Tu presupuesto ${escapeHtml(d.numero)}</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Hola ${escapeHtml(d.cliente)}, preparamos tu presupuesto con precios de mayorista. Un asesor se comunicará contigo para confirmarlo.</p>
      <div style="margin:16px 0;padding:14px 20px;background:${tema(marca).suave};border-radius:8px;color:${TEXT_COLOR};">
        <div style="font-weight:700;">Total: ${escapeHtml(d.total)}</div>
        <div style="color:${MUTED_COLOR};font-size:13px;">Válido hasta ${escapeHtml(d.validezHasta)}</div>
      </div>
      ${boton(d.url, 'Ver presupuesto', marca)}
      <p style="margin:16px 0 0;color:${MUTED_COLOR};font-size:13px;">Desde esa página puedes imprimirlo o guardarlo como PDF.</p>
    `, marca),
  };
}

export function pedidoNuevoEquipoEmail(d: {
  numero: string;
  cliente: string;
  total: string;
  entrega: string;
  items: string[];
  url: string;
}, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto(`Nuevo pedido ${d.numero} · ${d.total}`, marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Un cliente realizó un pedido</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};"><b>${escapeHtml(d.cliente)}</b> confirmó el pedido <b>${escapeHtml(d.numero)}</b> en la tienda. Falta confirmar el pago y coordinar la entrega.</p>
      <div style="margin:16px 0;padding:14px 20px;background:${tema(marca).suave};border-radius:8px;color:${TEXT_COLOR};">
        ${d.items.map((i) => `${escapeHtml(i)}<br/>`).join('')}
        <div style="margin-top:10px;font-weight:700;">Total: ${escapeHtml(d.total)}</div>
        <div style="color:${MUTED_COLOR};font-size:13px;">Entrega: ${escapeHtml(d.entrega)}</div>
      </div>
      ${boton(d.url, 'Gestionar pedido', marca)}
    `, marca),
  };
}

export function codigoCuentaEmail(codigo: string, minutos: number, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto('Tu código para ver tus pedidos', marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Accede a tu cuenta</h1>
      <p style="margin:0;color:${MUTED_COLOR};">Usa este código para ver tus pedidos y cotizaciones en ${escapeHtml(tema(marca).nombre)}:</p>
      ${codeBlock(codigo, marca)}
      <p style="margin:0;color:${MUTED_COLOR};">Vence en ${minutos} minutos. Si no lo pediste tú, ignora este correo: nadie puede entrar sin el código.</p>
    `, marca),
  };
}

/** Aviso genérico (tickets, socios…): título, párrafos de texto y un botón opcional. Todo se escapa. */
export function avisoEmail(d: { asunto: string; titulo: string; parrafos: string[]; boton?: { texto: string; url: string }; marca?: MarcaCorreo }): { subject: string; html: string } {
  return {
    subject: asunto(d.asunto, d.marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">${escapeHtml(d.titulo)}</h1>
      ${d.parrafos.map((p) => `<p style="margin:0 0 12px;color:${MUTED_COLOR};white-space:pre-wrap;">${escapeHtml(p.slice(0, 2000))}</p>`).join('')}
      ${d.boton ? boton(d.boton.url, d.boton.texto, d.marca, 'margin-top:8px;') : ''}
    `, d.marca),
  };
}

// ---------------------------------------------------------------------------
// Libro de reclamaciones
// ---------------------------------------------------------------------------

export interface HojaCorreo {
  codigo: string;
  fecha: Date;
  fechaLimite: Date;
  proveedor: { razonSocial: string | null; ruc: string | null; nombreComercial: string; direccion: string | null };
  consumidor: { nombres: string; apellidos: string; tipoDocumento: string; nroDocumento: string; domicilio: string; telefono: string; email: string };
  menorEdad: boolean;
  representante?: { nombres: string; tipoDocumento: string; nroDocumento: string };
  bien: { tipo: string; monto: string | null; moneda: string; descripcion: string; nroPedido: string | null };
  tipo: 'RECLAMO' | 'QUEJA';
  detalle: string;
  pedido: string;
  medioRespuesta: string;
}

const fechaCorta = (d: Date) => d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Lima' });

function filas(pares: Array<[string, string | null | undefined]>): string {
  return pares
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:${MUTED_COLOR};vertical-align:top;">${escapeHtml(k)}</td><td style="padding:4px 0;">${escapeHtml(String(v))}</td></tr>`)
    .join('');
}

const ETIQUETAS: Record<string, string> = {
  CORREO: 'Correo electrónico', CARTA: 'Carta al domicilio', RECLAMO: 'Reclamo', QUEJA: 'Queja', PRODUCTO: 'Producto', SERVICIO: 'Servicio',
};
const etiqueta = (v: string) => ETIQUETAS[v] ?? v;
const dosDecimales = (m: string) => (Number.isFinite(Number(m)) ? Number(m).toFixed(2) : m);

function cuerpoHoja(h: HojaCorreo): string {
  const p = h.proveedor;
  const c = h.consumidor;
  const monto = h.bien.monto ? `${h.bien.moneda} ${dosDecimales(h.bien.monto)}` : null;
  return `
      <table style="border-collapse:collapse;font-size:14px;color:${TEXT_COLOR};">${filas([
        ['Código', h.codigo],
        ['Fecha', fechaCorta(h.fecha)],
        ['Proveedor', p.razonSocial ?? p.nombreComercial],
        ['RUC', p.ruc],
        ['Dirección', p.direccion],
        ['Consumidor', `${c.nombres} ${c.apellidos}`],
        [c.tipoDocumento, c.nroDocumento],
        ['Domicilio', c.domicilio],
        ['Teléfono', c.telefono],
        ['Correo', c.email],
        ['Representante', h.menorEdad && h.representante ? `${h.representante.nombres} (${h.representante.tipoDocumento} ${h.representante.nroDocumento})` : null],
        ['Bien contratado', etiqueta(h.bien.tipo)],
        ['Monto reclamado', monto],
        ['Descripción', h.bien.descripcion],
        ['N.º de pedido', h.bien.nroPedido],
        ['Tipo', etiqueta(h.tipo)],
        ['Detalle', h.detalle],
        ['Pedido del consumidor', h.pedido],
        ['Medio de respuesta', etiqueta(h.medioRespuesta)],
      ])}</table>`;
}

export function hojaConsumidorEmail(h: HojaCorreo, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto(`Tu hoja de reclamación ${h.codigo}`, marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Recibimos tu hoja de reclamación</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Esta es la copia de tu hoja de reclamación. Presentar un reclamo no impide acudir a Indecopi.</p>
      <p style="margin:0 0 12px;">Te responderemos a más tardar el <strong>${escapeHtml(fechaCorta(h.fechaLimite))}</strong> (15 días hábiles). Con el código <strong>${escapeHtml(h.codigo)}</strong> y tu documento puedes consultar el estado en la web.</p>
      <div style="margin:20px 0;padding:14px 20px;background:${tema(marca).suave};border-radius:8px;">${cuerpoHoja(h)}</div>
    `, marca),
  };
}

export function hojaEquipoEmail(h: HojaCorreo, url: string, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto(`Nueva hoja de reclamación ${h.codigo}`, marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Nueva hoja de reclamación</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Plazo de respuesta: ${escapeHtml(fechaCorta(h.fechaLimite))} (15 días hábiles).</p>
      <div style="margin:20px 0;padding:14px 20px;background:${tema(marca).suave};border-radius:8px;">${cuerpoHoja(h)}</div>
      ${boton(url, 'Ver en el dashboard', marca)}
    `, marca),
  };
}

export function respuestaReclamoEmail(d: {
  codigo: string;
  tipo: string;
  respuesta: string;
  proveedor: { razonSocial: string | null; nombreComercial: string };
}, marca?: MarcaCorreo): { subject: string; html: string } {
  return {
    subject: asunto(`Respuesta a tu ${d.tipo === 'QUEJA' ? 'queja' : 'reclamo'} ${d.codigo}`, marca),
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Respuesta a tu hoja ${escapeHtml(d.codigo)}</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">${escapeHtml(d.proveedor.razonSocial ?? d.proveedor.nombreComercial)} respondió a tu ${d.tipo === 'QUEJA' ? 'queja' : 'reclamo'}:</p>
      <div style="margin:20px 0;padding:14px 20px;background:${tema(marca).suave};border-radius:8px;color:${TEXT_COLOR};white-space:pre-wrap;">${escapeHtml(d.respuesta)}</div>
      <p style="margin:0;color:${MUTED_COLOR};">Si no estás conforme, puedes acudir a Indecopi.</p>
    `, marca),
  };
}
