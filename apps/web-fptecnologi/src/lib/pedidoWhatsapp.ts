/*
 * Resumen del último pedido: el checkout lo guarda en sessionStorage al confirmar y la página de
 * "gracias" arma con él el mensaje de WhatsApp con TODOS los datos del pedido para el asesor.
 * Es solo del navegador del comprador (se pierde al cerrar la pestaña); la fuente de verdad es la API.
 */
import { whatsappHref } from '@/lib/chatActions';

const KEY = 'fpt-ultimo-pedido';

export type ResumenPedido = {
  numero: string;
  nombre: string;
  email: string;
  celular: string;
  comprobante: 'Boleta' | 'Factura';
  documento: string;
  razonSocial?: string;
  entrega: string; // "Recojo en tienda", "Envío por Shalom → Agencia…", "Envío a domicilio: dirección, distrito"
  pago: string;
  notas?: string;
  items: { sku: string; nombre: string; qty: number; subtotal: string }[];
  subtotal: string;
  igv: string;
  envio: string;
  total: string;
};

export function guardarResumenPedido(r: ResumenPedido) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(r));
  } catch {
    /* sin sessionStorage: la página de gracias usa el mensaje corto */
  }
}

export function leerResumenPedido(numero: string): ResumenPedido | null {
  try {
    const r = JSON.parse(window.sessionStorage.getItem(KEY) ?? 'null') as ResumenPedido | null;
    return r && r.numero === numero ? r : null;
  } catch {
    return null;
  }
}

/** Enlace de WhatsApp al número de ventas con el pedido completo. */
export function whatsappPedidoHref(r: ResumenPedido) {
  const lineas = [
    `*Nuevo pedido ${r.numero}* (web FPTecnologi)`,
    '',
    `*Cliente:* ${r.nombre}`,
    `*${r.comprobante === 'Factura' ? 'RUC' : 'DNI'}:* ${r.documento}${r.razonSocial ? ` — ${r.razonSocial}` : ''}`,
    `*Correo:* ${r.email}`,
    `*Celular:* ${r.celular}`,
    `*Comprobante:* ${r.comprobante}`,
    `*Entrega:* ${r.entrega}`,
    `*Forma de pago:* ${r.pago}`,
    '',
    '*Productos:*',
    ...r.items.map((i) => `• ${i.qty} × ${i.nombre} (${i.sku}) — ${i.subtotal}`),
    '',
    `Subtotal: ${r.subtotal}`,
    `IGV: ${r.igv}`,
    `Envío: ${r.envio}`,
    `*Total: ${r.total}*`,
    ...(r.notas ? ['', `*Notas:* ${r.notas}`] : []),
    '',
    'Quiero coordinar el pago y la entrega. ¡Gracias!',
  ];
  return whatsappHref(lineas.join('\n'));
}
