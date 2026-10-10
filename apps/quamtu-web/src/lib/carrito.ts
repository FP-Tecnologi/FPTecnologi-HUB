// Carrito local (localStorage). Cuando exista la API de pedidos se envía desde /carrito.
import { porId } from './piezas';
import { waUrl } from './contacto';

export const CARRITO_KEY = 'quamtu-carrito';

export type ItemCarrito = {
  tipo: 'build' | 'pieza';
  ids: string[];
  total: number; // precio de una unidad
  cantidad?: number; // solo piezas sueltas
  modo?: 'pc' | 'repuestos'; // solo builds: PC armada por Quamtu o componentes sueltos
};

export const subtotal = (i: ItemCarrito) => i.total * (i.cantidad ?? 1);
export const totalCarrito = (items: ItemCarrito[]) => items.reduce((a, i) => a + subtotal(i), 0);
export const unidades = (items: ItemCarrito[]) => items.reduce((a, i) => a + (i.cantidad ?? 1), 0);

export function leerCarrito(): ItemCarrito[] {
  try {
    return JSON.parse(localStorage.getItem(CARRITO_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function guardarCarrito(items: ItemCarrito[]) {
  try {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('quamtu-carrito'));
  } catch {
    /* sin almacenamiento: no hay carrito */
  }
}

// Añade y abre la vista previa del carrito (cabecera). Una pieza repetida suma cantidad.
export function agregarAlCarrito(item: ItemCarrito) {
  const items = leerCarrito();
  const igual = item.tipo === 'pieza' ? items.find((i) => i.tipo === 'pieza' && i.ids[0] === item.ids[0]) : undefined;
  if (igual) igual.cantidad = (igual.cantidad ?? 1) + 1;
  else items.push({ ...item, cantidad: item.tipo === 'pieza' ? 1 : undefined });
  guardarCarrito(items);
  window.dispatchEvent(new Event('quamtu-carrito-abrir'));
}

const soles = (n: number) => `S/ ${n.toLocaleString('es-PE')}`;

// Texto del pedido/cotización para WhatsApp.
export function mensajeWhatsApp(items: ItemCarrito[], intro = 'Hola Quamtu, quiero comprar lo siguiente:') {
  const bloques = items.map((it) => {
    const lineas = it.ids.map((id) => porId(id)).filter(Boolean).map((o) => `• ${o!.nombre} — ${soles(o!.precio)}`);
    const titulo = it.tipo === 'build' ? (it.modo === 'repuestos' ? 'Componentes seleccionados' : 'PC armada a medida') : `Componente x${it.cantidad ?? 1}`;
    return `*${titulo}*\n${lineas.join('\n')}`;
  });
  return `${intro}\n\n${bloques.join('\n\n')}\n\n*Total referencial: ${soles(totalCarrito(items))}*`;
}

export const whatsappCarrito = (items: ItemCarrito[], intro?: string) => waUrl(mensajeWhatsApp(items, intro));
