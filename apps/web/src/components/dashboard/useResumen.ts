'use client';
/*
 * FPTecnologi-HUB — datos del dashboard. Pide a los endpoints reales de cada
 * módulo (por marca) y los junta; un endpoint que falla (403 por rol, módulo
 * sin datos) queda en `null` y su card muestra estado vacío. Sin cifras
 * inventadas: todo se agrupa en el cliente.
 */
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export interface PedidoRow { estado: string; total: string | number; moneda?: string; createdAt: string; items?: { cantidad: number; producto?: { nombre?: string } | null; nombre?: string }[] }
export interface LeadRow { estado: string; createdAt: string }
export interface CotizacionRow { estado: string; createdAt: string }
export interface ChatRow { estado: string; createdAt: string }
export interface BlogRow { estado: string; createdAt: string }
export interface ProductoRow { id: string; nombre: string; stock: number; activo: boolean }
export interface SuscriptorRow { createdAt: string }
export interface NotifRow { id: string; titulo?: string; mensaje?: string; tipo?: string; leida?: boolean; createdAt: string }

export interface Resumen {
  pedidos: PedidoRow[] | null;
  leads: LeadRow[] | null;
  cotizaciones: CotizacionRow[] | null;
  chat: ChatRow[] | null;
  blog: BlogRow[] | null;
  productos: ProductoRow[] | null;
  boletin: SuscriptorRow[] | null;
  equipo: unknown[] | null;
  notificaciones: NotifRow[] | null;
}

const VACIO: Resumen = { pedidos: null, leads: null, cotizaciones: null, chat: null, blog: null, productos: null, boletin: null, equipo: null, notificaciones: null };

/** Une las listas de varias marcas; si todas fallaron (null) devuelve null. */
function unir<T>(listas: (T[] | null)[]): T[] | null {
  const ok = listas.filter((l): l is T[] => Array.isArray(l));
  return ok.length ? ok.flat() : null;
}

export function useResumen(marcaIds: string[]) {
  const [datos, setDatos] = useState<Resumen>(VACIO);
  const [cargando, setCargando] = useState(true);
  const clave = marcaIds.join(',');

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    async function cargar() {
      const get = <T,>(path: string, marcaId: string) => api.get<T[]>(path, { marcaId }).catch(() => null);
      const porMarca = await Promise.all(
        marcaIds.map(async (id) => {
          const [pedidos, leads, cotizaciones, chat, blog, productos, boletin, equipo] = await Promise.all([
            get<PedidoRow>('/pedidos', id),
            get<LeadRow>('/cotizador/leads', id),
            get<CotizacionRow>('/cotizaciones', id),
            get<ChatRow>('/chat/conversaciones', id),
            get<BlogRow>('/blog', id),
            get<ProductoRow>('/productos', id),
            get<SuscriptorRow>('/boletin/suscriptores', id),
            get<unknown>(`/marcas/${id}/equipo`, id),
          ]);
          return { pedidos, leads, cotizaciones, chat, blog, productos, boletin, equipo };
        }),
      );
      const notificaciones = await api.get<NotifRow[]>('/notificaciones').catch(() => null);
      if (!vivo) return;
      setDatos({
        pedidos: unir(porMarca.map((m) => m.pedidos)),
        leads: unir(porMarca.map((m) => m.leads)),
        cotizaciones: unir(porMarca.map((m) => m.cotizaciones)),
        chat: unir(porMarca.map((m) => m.chat)),
        blog: unir(porMarca.map((m) => m.blog)),
        productos: unir(porMarca.map((m) => m.productos)),
        boletin: unir(porMarca.map((m) => m.boletin)),
        equipo: unir(porMarca.map((m) => m.equipo)),
        notificaciones,
      });
      setCargando(false);
    }
    cargar();
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  return { datos, cargando };
}

/* ───────── helpers de agrupación ───────── */

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/** Últimos `n` meses (el actual al final): clave 'YYYY-MM' + etiqueta corta. */
export function ultimosMeses(n = 6) {
  const hoy = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - (n - 1 - i), 1);
    return { key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: MESES[d.getMonth()] };
  });
}

const claveMes = (iso: string) => iso.slice(0, 7);

export function contarPorMes(filas: { createdAt: string }[] | null, meses: { key: string }[]): number[] {
  return meses.map((m) => (filas ?? []).filter((f) => claveMes(f.createdAt) === m.key).length);
}

export function sumarPorMes(filas: PedidoRow[] | null, meses: { key: string }[]): number[] {
  return meses.map((m) =>
    (filas ?? [])
      .filter((f) => claveMes(f.createdAt) === m.key && f.estado !== 'CANCELADO')
      .reduce((s, f) => s + Number(f.total || 0), 0),
  );
}

export function contarPorEstado(filas: { estado: string }[] | null, estados: string[]): number[] {
  return estados.map((e) => (filas ?? []).filter((f) => f.estado === e).length);
}

/** Variación % del último mes contra el anterior; null si no hay base. */
export function variacion(serie: number[]): number | null {
  const [prev, act] = [serie[serie.length - 2], serie[serie.length - 1]];
  if (!prev) return null;
  return ((act - prev) / prev) * 100;
}
