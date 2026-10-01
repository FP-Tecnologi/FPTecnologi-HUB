/*
 * Plantillas de correo transaccional — HTML con estilos inline (tablas, sin
 * CSS externo) porque así es el único modo que se renderiza igual en Gmail,
 * Outlook y clientes móviles. Un solo layout de marca envuelve el contenido
 * de cada correo para que todos se vean consistentes.
 */

const BRAND_COLOR = '#008DC5';
const TEXT_COLOR = '#1F2733';
const MUTED_COLOR = '#5B6B7A';
const CODE_BG = '#EBF6FA';
const CODE_COLOR = '#006086';

function layout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<body style="margin:0;padding:0;background:#F0F3F6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F0F3F6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%;background:#FFFFFF;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:${BRAND_COLOR};padding:20px 32px;">
              <span style="color:#FFFFFF;font-size:18px;font-weight:700;letter-spacing:.02em;">FPTecnologi</span>
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
                Mensaje automático de FPTecnologi. Si no reconoces esta actividad, ignora este correo.
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

function codeBlock(codigo: string): string {
  return `<div style="margin:24px 0;text-align:center;">
    <span style="display:inline-block;background:${CODE_BG};color:${CODE_COLOR};font-size:30px;font-weight:700;letter-spacing:.3em;padding:16px 20px;border-radius:8px;font-family:'Courier New',monospace;">${codigo}</span>
  </div>`;
}

export function otpCodeEmail(codigo: string, minutos: number): { subject: string; html: string } {
  return {
    subject: 'Tu código de verificación',
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Verificación en dos pasos</h1>
      <p style="margin:0;color:${MUTED_COLOR};">Usa este código para completar tu inicio de sesión:</p>
      ${codeBlock(codigo)}
      <p style="margin:0;color:${MUTED_COLOR};">Vence en ${minutos} minutos. Si no fuiste tú, ignora este correo — tu cuenta sigue segura.</p>
    `),
  };
}

export function passwordResetCodeEmail(codigo: string, minutos: number): { subject: string; html: string } {
  return {
    subject: 'Recuperar tu contraseña',
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Recuperar contraseña</h1>
      <p style="margin:0;color:${MUTED_COLOR};">Usa este código para elegir una nueva contraseña:</p>
      ${codeBlock(codigo)}
      <p style="margin:0;color:${MUTED_COLOR};">Vence en ${minutos} minutos. Si no pediste este cambio, ignora este correo — tu contraseña actual sigue siendo válida.</p>
    `),
  };
}

export function welcomeEmail(nombre: string | null): { subject: string; html: string } {
  const saludo = nombre ? `¡Hola, ${nombre}!` : '¡Hola!';
  return {
    subject: 'Bienvenido a FPTecnologi',
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">${saludo}</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Tu cuenta se creó correctamente. Ya puedes iniciar sesión y empezar a usar la plataforma.</p>
      <p style="margin:0;color:${MUTED_COLOR};">Si no creaste esta cuenta, contáctanos respondiendo este correo.</p>
    `),
  };
}

export function passwordChangedEmail(): { subject: string; html: string } {
  return {
    subject: 'Tu contraseña fue actualizada',
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Contraseña actualizada</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Tu contraseña se cambió correctamente. Por seguridad, cerramos todas tus sesiones activas — vuelve a iniciar sesión con la nueva contraseña.</p>
      <p style="margin:0;color:${MUTED_COLOR};">Si no hiciste este cambio, contáctanos de inmediato respondiendo este correo.</p>
    `),
  };
}

export function pedidoConfirmadoEmail(pedidoId: string): { subject: string; html: string } {
  return {
    subject: '¡Gracias por tu pedido!',
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">¡Gracias por tu compra!</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Recibimos tu pedido y ya lo estamos procesando.</p>
      <div style="margin:20px 0;padding:14px 20px;background:${CODE_BG};border-radius:8px;">
        <span style="color:${MUTED_COLOR};font-size:13px;">Número de pedido</span><br/>
        <span style="color:${CODE_COLOR};font-size:16px;font-weight:700;">${pedidoId}</span>
      </div>
      <p style="margin:0;color:${MUTED_COLOR};">Te avisaremos por correo cuando cambie su estado.</p>
    `),
  };
}

// El texto viene de un visitante anónimo: se escapa antes de meterlo al HTML.
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export function chatNuevoEmail(primerMensaje: string, url: string): { subject: string; html: string } {
  return {
    subject: 'Nueva conversación en el chat de la web',
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Alguien está conversando con el asistente</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Un visitante de la web inició una conversación con el asistente virtual. Su primer mensaje:</p>
      <div style="margin:20px 0;padding:14px 20px;background:${CODE_BG};border-radius:8px;color:${TEXT_COLOR};">
        ${escapeHtml(primerMensaje.slice(0, 500))}
      </div>
      <p style="margin:0 0 20px;color:${MUTED_COLOR};">Puedes leer la conversación y retomarla como asesor desde el dashboard.</p>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND_COLOR};color:#FFFFFF;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;">Ver conversación</a>
    `),
  };
}

export function leadNuevoEmail(nombre: string, interes: string, url: string): { subject: string; html: string } {
  return {
    subject: 'Nuevo lead del cotizador',
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Nueva solicitud de cotización</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Alguien llenó el cotizador de la web:</p>
      <div style="margin:20px 0;padding:14px 20px;background:${CODE_BG};border-radius:8px;color:${TEXT_COLOR};">
        <strong>${escapeHtml(nombre.slice(0, 160))}</strong><br />Interés: ${escapeHtml(interes.slice(0, 200))}
      </div>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND_COLOR};color:#FFFFFF;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;">Ver lead</a>
    `),
  };
}

export function contactoNuevoEmail(titulo: string, nombre: string, mensaje: string, url: string): { subject: string; html: string } {
  return {
    subject: titulo,
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">${escapeHtml(titulo)}</h1>
      <div style="margin:20px 0;padding:14px 20px;background:${CODE_BG};border-radius:8px;color:${TEXT_COLOR};">
        <strong>${escapeHtml(nombre.slice(0, 160))}</strong><br />${escapeHtml(mensaje.slice(0, 300))}
      </div>
      <a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND_COLOR};color:#FFFFFF;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;">Ver en el dashboard</a>
    `),
  };
}

export function invitacionEmail(marca: string, rol: string, url: string, dias: number): { subject: string; html: string } {
  return {
    subject: `Te invitaron a ${marca} en FPTecnologi HUB`,
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Te invitaron a unirte al equipo</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Te sumaron a <b>${escapeHtml(marca)}</b> con el rol <b>${escapeHtml(rol)}</b>. Acepta la invitación para crear tu acceso al dashboard.</p>
      <p style="margin:20px 0;"><a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND_COLOR};color:#FFFFFF;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;">Aceptar invitación</a></p>
      <p style="margin:0;color:${MUTED_COLOR};">El enlace vence en ${dias} días.</p>
    `),
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

export function cotizacionServicioEmail(c: CotizacionCorreo): { subject: string; html: string } {
  const filas = [
    c.monto ? `<tr><td style="padding:6px 0;color:${MUTED_COLOR};">Inversión</td><td style="padding:6px 0;text-align:right;font-weight:700;">${escapeHtml(c.monto)}</td></tr>` : '',
    c.validezHasta ? `<tr><td style="padding:6px 0;color:${MUTED_COLOR};">Válida hasta</td><td style="padding:6px 0;text-align:right;">${escapeHtml(c.validezHasta)}</td></tr>` : '',
  ].join('');
  return {
    subject: `Tu cotización ${c.numero} · ${c.servicio}`,
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Tu cotización de ${escapeHtml(c.servicio)}</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};">Hola ${escapeHtml(c.cliente)}, gracias por tu interés. Esta es nuestra propuesta (referencia <b>${escapeHtml(c.numero)}</b>):</p>
      ${c.mensajeExtra ? `<p style="margin:0 0 12px;">${escapeHtml(c.mensajeExtra).replace(/\n/g, '<br>')}</p>` : ''}
      ${c.propuesta ? `<div style="margin:16px 0;padding:14px 20px;background:${CODE_BG};border-radius:8px;color:${TEXT_COLOR};">${escapeHtml(c.propuesta).replace(/\n/g, '<br>')}</div>` : ''}
      ${filas ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;border-top:1px solid #E6EBEF;">${filas}</table>` : ''}
      <p style="margin:0;color:${MUTED_COLOR};">Si quieres avanzar o ajustar algo, responde este correo o escríbenos por WhatsApp y un asesor te atiende.</p>
    `),
  };
}

export function pedidoNuevoEquipoEmail(d: {
  numero: string;
  cliente: string;
  total: string;
  entrega: string;
  items: string[];
  url: string;
}): { subject: string; html: string } {
  return {
    subject: `Nuevo pedido ${d.numero} · ${d.total}`,
    html: layout(`
      <h1 style="margin:0 0 12px;font-size:20px;">Un cliente realizó un pedido</h1>
      <p style="margin:0 0 12px;color:${MUTED_COLOR};"><b>${escapeHtml(d.cliente)}</b> confirmó el pedido <b>${escapeHtml(d.numero)}</b> en la tienda. Falta confirmar el pago y coordinar la entrega.</p>
      <div style="margin:16px 0;padding:14px 20px;background:${CODE_BG};border-radius:8px;color:${TEXT_COLOR};">
        ${d.items.map((i) => `${escapeHtml(i)}<br/>`).join('')}
        <div style="margin-top:10px;font-weight:700;">Total: ${escapeHtml(d.total)}</div>
        <div style="color:${MUTED_COLOR};font-size:13px;">Entrega: ${escapeHtml(d.entrega)}</div>
      </div>
      <a href="${escapeHtml(d.url)}" style="display:inline-block;background:${BRAND_COLOR};color:#FFFFFF;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;">Gestionar pedido</a>
    `),
  };
}
