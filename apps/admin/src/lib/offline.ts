/*
 * Modo offline del dashboard (Fase 2): almacén local en IndexedDB.
 *   - `lecturas`: última respuesta GET de las rutas offline, para mostrarla sin internet.
 *   - `cola`: escrituras (POST/PATCH/PUT/DELETE) hechas sin conexión; se reenvían en orden al volver la red.
 * Todo vive solo en este navegador y se borra al cerrar sesión. Nunca lanza: si IndexedDB no existe, no hay offline.
 */

/** Solo estas rutas funcionan sin internet. El resto (pedidos, pagos, mailing…) depende de datos en vivo. */
const PREFIJOS_OFFLINE = ['/crm/'];

export const rutaOffline = (path: string) => PREFIJOS_OFFLINE.some((p) => path.startsWith(p));

export interface CambioPendiente {
  id?: number;
  clave: string; // Idempotency-Key
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  marcaId: string | null;
  creado: number;
  error?: string; // el servidor lo rechazó: no se reintenta, el usuario decide
}

interface Lectura { clave: string; data: unknown; ts: number }

const DB = 'ax-offline';
let dbPromise: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('sin IndexedDB'));
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const rq = indexedDB.open(DB, 1);
      rq.onupgradeneeded = () => {
        rq.result.createObjectStore('lecturas', { keyPath: 'clave' });
        rq.result.createObjectStore('cola', { keyPath: 'id', autoIncrement: true });
      };
      rq.onsuccess = () => resolve(rq.result);
      rq.onerror = () => { dbPromise = null; reject(rq.error); };
    });
  }
  return dbPromise;
}

async function tx<T>(store: 'lecturas' | 'cola', modo: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const rq = f(db.transaction(store, modo).objectStore(store));
    rq.onsuccess = () => resolve(rq.result);
    rq.onerror = () => reject(rq.error);
  });
}

const aviso = () => { if (typeof window !== 'undefined') window.dispatchEvent(new Event('ax:cola')); };

/* ───── lecturas ───── */
const claveLectura = (marcaId: string | null, path: string) => `${marcaId ?? '-'}|${path}`;

export async function guardarLectura(marcaId: string | null, path: string, data: unknown): Promise<void> {
  try { await tx('lecturas', 'readwrite', (s) => s.put({ clave: claveLectura(marcaId, path), data, ts: Date.now() } satisfies Lectura)); } catch { /* sin offline */ }
}

export async function leerLectura<T>(marcaId: string | null, path: string): Promise<{ data: T; ts: number } | null> {
  try {
    const l = await tx<Lectura | undefined>('lecturas', 'readonly', (s) => s.get(claveLectura(marcaId, path)));
    return l ? { data: l.data as T, ts: l.ts } : null;
  } catch { return null; }
}

/* ───── cola ───── */
export async function encolar(c: Omit<CambioPendiente, 'id' | 'creado'>): Promise<void> {
  await tx('cola', 'readwrite', (s) => s.add({ ...c, creado: Date.now() }));
  aviso();
}

export async function listarCola(): Promise<CambioPendiente[]> {
  try {
    const todos = await tx<CambioPendiente[]>('cola', 'readonly', (s) => s.getAll());
    return todos.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  } catch { return []; }
}

export async function quitarDeCola(id: number): Promise<void> {
  try { await tx('cola', 'readwrite', (s) => s.delete(id)); } catch { /* ya no está */ }
  aviso();
}

export async function marcarError(c: CambioPendiente, error: string): Promise<void> {
  try { await tx('cola', 'readwrite', (s) => s.put({ ...c, error })); } catch { /* ignorar */ }
  aviso();
}

/** Cierre de sesión: no deja datos del usuario en el dispositivo. */
export async function borrarTodoOffline(): Promise<void> {
  try {
    await tx('lecturas', 'readwrite', (s) => s.clear());
    await tx('cola', 'readwrite', (s) => s.clear());
  } catch { /* nada que borrar */ }
  aviso();
}

/* ───── sincronización ───── */
export type Enviar = (c: CambioPendiente) => Promise<void>;

let sincronizando = false;

/**
 * Reenvía la cola en orden. Se detiene si vuelve a fallar la red (sigue pendiente); un rechazo del servidor
 * (4xx) se marca con su motivo y se sigue con el resto.
 */
export async function sincronizar(enviar: Enviar, esRed: (e: unknown) => boolean, estado: (e: unknown) => number): Promise<void> {
  if (sincronizando) return;
  sincronizando = true;
  aviso();
  try {
    for (const c of await listarCola()) {
      if (c.error || c.id === undefined) continue;
      try {
        await enviar(c);
        await quitarDeCola(c.id);
      } catch (e) {
        if (esRed(e)) break;
        const st = estado(e);
        if (st === 401 || st >= 500) break; // sesión vencida o servidor caído: se reintenta luego
        await marcarError(c, e instanceof Error ? e.message : 'Rechazado por el servidor.');
      }
    }
  } finally {
    sincronizando = false;
    aviso();
  }
}

export const estaSincronizando = () => sincronizando;
