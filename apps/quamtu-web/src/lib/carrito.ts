// Carrito local (localStorage). Cuando exista la API de pedidos se envía desde /carrito.
export const CARRITO_KEY = 'quamtu-carrito';

export type ItemCarrito = { tipo: 'build' | 'pieza'; ids: string[]; total: number };

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

export const agregarAlCarrito = (item: ItemCarrito) => guardarCarrito([...leerCarrito(), item]);
