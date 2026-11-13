'use client';
/*
 * Carrito de la tienda: vive en el navegador (localStorage), sin cuenta ni pago. Sirve para armar la lista de equipos que se
 * envía en una sola solicitud de cotización (/cotizar?carrito=1). Los precios son referenciales (USD sin IGV).
 */
import { useSyncExternalStore } from 'react';

export type ItemCarrito = { sku: string; slug: string; nombre: string; imagen: string; precio: number; cantidad: number };

const CLAVE = 'fimav-carrito';
const MAX_CANTIDAD = 999;
const VACIO: ItemCarrito[] = [];
let cache: { raw: string | null; items: ItemCarrito[] } = { raw: null, items: VACIO };
const oyentes = new Set<() => void>();

function leer(): ItemCarrito[] {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (raw === cache.raw) return cache.items;
    const lista = raw ? (JSON.parse(raw) as ItemCarrito[]) : VACIO;
    const items = Array.isArray(lista)
      ? lista.filter((i) => i && typeof i.sku === 'string' && Number.isFinite(i.cantidad) && i.cantidad > 0)
      : VACIO;
    cache = { raw, items: items.length ? items : VACIO };
    return cache.items;
  } catch {
    return VACIO;
  }
}

function guardar(items: ItemCarrito[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(items));
  } catch {
    /* modo privado o sin espacio: el carrito simplemente no persiste */
  }
  oyentes.forEach((f) => f());
}

export const agregar = (it: Omit<ItemCarrito, 'cantidad'>, cantidad = 1) => {
  const items = leer();
  const hay = items.find((i) => i.sku === it.sku);
  guardar(hay ? items.map((i) => (i.sku === it.sku ? { ...i, cantidad: Math.min(MAX_CANTIDAD, i.cantidad + cantidad) } : i)) : [...items, { ...it, cantidad: Math.min(MAX_CANTIDAD, cantidad) }]);
};
export const cambiarCantidad = (sku: string, cantidad: number) =>
  guardar(leer().map((i) => (i.sku === sku ? { ...i, cantidad: Math.min(MAX_CANTIDAD, Math.max(1, Math.floor(cantidad) || 1)) } : i)));
export const quitar = (sku: string) => guardar(leer().filter((i) => i.sku !== sku));
export const vaciar = () => guardar(VACIO);

function suscribir(f: () => void) {
  oyentes.add(f);
  const alOtraPestana = (e: StorageEvent) => e.key === CLAVE && f();
  window.addEventListener('storage', alOtraPestana);
  return () => { oyentes.delete(f); window.removeEventListener('storage', alOtraPestana); };
}

/** Items del carrito (vacío en el servidor y en la primera pintura, para no desajustar la hidratación). */
export const useCarrito = () => useSyncExternalStore(suscribir, leer, () => VACIO);

export const totalUnidades = (items: ItemCarrito[]) => items.reduce((n, i) => n + i.cantidad, 0);
export const totalPrecio = (items: ItemCarrito[]) => items.reduce((n, i) => n + i.precio * i.cantidad, 0);

/** Texto del carrito para el mensaje de la cotización (cabe en el límite de 1000 caracteres del formulario). */
export function resumenCarrito(items: ItemCarrito[]): string {
  const lineas = items.map((i) => `${i.cantidad} x ${i.nombre.slice(0, 60)} (${i.sku})`);
  let texto = 'Quiero cotizar:\n';
  for (let n = 0; n < lineas.length; n++) {
    if ((texto + lineas[n]).length > 930) return `${texto}y ${lineas.length - n} equipo(s) más del carrito.`;
    texto += `${lineas[n]}\n`;
  }
  return texto.trim();
}
