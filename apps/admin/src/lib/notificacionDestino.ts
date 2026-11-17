/*
 * A qué módulo lleva una notificación al hacer clic. La tabla Notificacion no guarda destino, así que se deduce
 * del tipo y del título con que la API las crea (pedidos, cotizaciones, contactos, tickets, etc.).
 * ponytail: sin ?id= (abre el módulo, no la fila). Para abrir la fila exacta, añadir columna `enlace` y rellenarla
 * en cada notificacion.createMany de la API; este mapeo queda como respaldo para las notificaciones antiguas.
 */
const POR_TITULO: [RegExp, string][] = [
  [/lead del cotizador/i, '/cotizador/leads'],
  [/presupuesto mayorista/i, '/ecommerce/presupuestos'],
  [/solicitud de cotizaci/i, '/soluciones/cotizaciones'],
  [/hoja de reclamaci/i, '/libro-reclamaciones'],
  [/landing/i, '/campanas/landings'],
  [/solicitud de socio/i, '/web/recursos'],
  [/ticket/i, '/web/tickets'],
  [/BBVA/i, '/web/bbva'],
  [/reclamo|contacto/i, '/web/contactos'],
];

const POR_TIPO: Record<string, string> = {
  PEDIDO: '/ecommerce/pedidos',
  CHAT: '/chat/conversaciones',
  COTIZACION: '/soluciones/cotizaciones',
};

export function destinoNotificacion(n: { tipo: string; titulo: string }): string {
  return POR_TITULO.find(([re]) => re.test(n.titulo))?.[1] ?? POR_TIPO[n.tipo] ?? '/notificaciones';
}
