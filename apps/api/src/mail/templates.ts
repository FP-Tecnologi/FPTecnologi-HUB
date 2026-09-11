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
