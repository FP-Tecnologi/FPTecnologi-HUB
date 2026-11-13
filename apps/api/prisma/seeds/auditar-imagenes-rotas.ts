/**
 * Auditoría de imágenes rotas en la base: recorre TODAS las columnas de texto, arreglos y JSON de todas las tablas,
 * junta cada URL de imagen (ajena o propia) y comprueba si responde. Las que no responden (404, host caído, sitio
 * temporal borrado como *.hostingersite.com…) se listan con tabla, columna y fila.
 *
 *   npx tsx prisma/seeds/auditar-imagenes-rotas.ts                    # solo informa
 *   npx tsx prisma/seeds/auditar-imagenes-rotas.ts --reparar          # las quita de la base (ver abajo)
 *
 * --reparar: en columnas de texto pone NULL; en arreglos (Producto.imagenes) quita la URL rota; en JSON quita el valor
 * (cadena vacía). Así la web usa su imagen por defecto en vez de mostrar un icono roto. Antes de reparar guarda un
 * respaldo en `imagenes-rotas-respaldo.json` (tabla, columna, fila, valor anterior) por si hay que revertir.
 * Si una URL propia (/uploads/…) falla porque el servidor que lo corre no es el de la API, no la toques: verifica a mano.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { PrismaClient } from '../../src/generated/prisma/client.js';

for (const line of readFileSync('./.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const reparar = process.argv.includes('--reparar');
const prisma = new PrismaClient();
const URL_EN_TEXTO = /https?:\/\/[^\s"'<>\\),]+/g;
const ES_IMAGEN = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i;
const HOST_LOCAL = /^(localhost|127\.|0\.0\.0\.0)/i;

type Col = { table_name: string; column_name: string; data_type: string };
type Fila = { id: string } & Record<string, unknown>;

const WEB = (process.env.WEB_AUDITAR ?? 'https://fptecnologi.com').replace(/\/$/, '');
// Solo imágenes de la web pública; /uploads/… relativo es de la API (otro host) y los PDF no son imágenes.
const RELATIVA = /^\/(images|herobanner|wp-content)\/\S+\.(png|jpe?g|gif|webp|avif|svg)$/i;
/** Rutas del tipo /images/x.jpg (valor completo de la celda o de un elemento del arreglo/JSON): se prueban contra la web pública. */
const relativas = (v: unknown, prof = 0): string[] =>
  typeof v === 'string' ? (RELATIVA.test(v) ? [v] : []) : prof > 8 ? [] : Array.isArray(v) ? v.flatMap((x) => relativas(x, prof + 1)) : v && typeof v === 'object' ? Object.values(v).flatMap((x) => relativas(x, prof + 1)) : [];
const urlsDe = (v: unknown) => [
  ...new Set([...(JSON.stringify(v ?? '').replace(/\\\//g, '/').match(URL_EN_TEXTO) ?? []).filter((u) => ES_IMAGEN.test(u)), ...relativas(v)]),
];

const estado = new Map<string, Promise<string | null>>();
/** null = responde; texto = motivo del fallo. */
function revisar(url: string): Promise<string | null> {
  let p = estado.get(url);
  if (!p) {
    p = (async () => {
      let host: string;
      try {
        if (url.startsWith('/')) url = WEB + encodeURI(decodeURI(url));
        host = new URL(url).hostname;
      } catch {
        return 'URL inválida';
      }
      if (HOST_LOCAL.test(host)) return 'apunta a localhost';
      for (const metodo of ['HEAD', 'GET']) {
        try {
          const r = await fetch(url, { method: metodo, redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'FPTecnologi-HUB/1.0 (auditoria de imagenes)' } });
          if (r.ok) return null;
          if (metodo === 'GET') return `HTTP ${r.status}`;
        } catch (e) {
          if (metodo === 'GET') return (e as Error).cause ? String(((e as Error).cause as Error).message ?? e) : (e as Error).message;
        }
      }
      return 'sin respuesta';
    })();
    estado.set(url, p);
  }
  return p;
}

async function enLotes<T>(items: T[], n: number, fn: (x: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += n) await Promise.all(items.slice(i, i + n).map(fn));
}

function quitar(v: unknown, rotas: Set<string>): unknown {
  if (typeof v === 'string') return rotas.has(v) ? null : v;
  if (Array.isArray(v)) return v.map((x) => quitar(x, rotas)).filter((x) => x !== null);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, quitar(x, rotas) ?? '']));
  return v;
}

async function main() {
  const cols = await prisma.$queryRawUnsafe<Col[]>(`
    SELECT c.table_name, c.column_name, c.data_type FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name <> '_prisma_migrations'
      AND (c.data_type IN ('text', 'character varying', 'json', 'jsonb') OR (c.data_type = 'ARRAY' AND c.udt_name IN ('_text', '_varchar')))`);
  const porTabla = new Map<string, Col[]>();
  for (const c of cols) porTabla.set(c.table_name, [...(porTabla.get(c.table_name) ?? []), c]);

  const hallazgos: { tabla: string; col: Col; id: string; valor: unknown; urls: string[] }[] = [];
  for (const [tabla, cs] of porTabla) {
    const tieneId = (await prisma.$queryRawUnsafe<{ n: number }[]>(`SELECT count(*)::int n FROM information_schema.columns WHERE table_schema='public' AND table_name='${tabla}' AND column_name='id'`))[0].n > 0;
    if (!tieneId) continue;
    const filas = await prisma.$queryRawUnsafe<Fila[]>(`SELECT id::text AS id, ${cs.map((c) => `"${c.column_name}"`).join(', ')} FROM "${tabla}" WHERE to_jsonb("${tabla}")::text ~ '(https?://|"/(images|herobanner|wp-content|uploads)/)'`);
    for (const f of filas) for (const col of cs) {
      const urls = urlsDe(f[col.column_name]);
      if (urls.length) hallazgos.push({ tabla, col, id: f.id, valor: f[col.column_name], urls });
    }
  }
  const todas = [...new Set(hallazgos.flatMap((h) => h.urls))];
  console.log(`${todas.length} URL(s) de imagen distintas en ${hallazgos.length} celda(s). Comprobando…`);
  await enLotes(todas, 12, async (u) => void (await revisar(u)));

  const rotas = new Map<string, string>();
  for (const u of todas) {
    const r = await revisar(u);
    if (r) rotas.set(u, r);
  }
  if (!rotas.size) return console.log('Todas las imágenes responden. Nada roto.');

  const respaldo: unknown[] = [];
  for (const h of hallazgos) {
    const malas = h.urls.filter((u) => rotas.has(u));
    if (!malas.length) continue;
    console.log(`\n${h.tabla}.${h.col.column_name} [${h.id}]`);
    for (const u of malas) console.log(`   ✗ ${rotas.get(u)}  ${u}`);
    if (!reparar) continue;
    const set = new Set(malas);
    const nuevo = h.col.data_type === 'text' || h.col.data_type === 'character varying' ? (set.has(h.valor as string) ? null : quitarEnTexto(h.valor as string, set)) : quitar(h.valor, set);
    respaldo.push({ tabla: h.tabla, columna: h.col.column_name, id: h.id, anterior: h.valor });
    if (h.col.data_type === 'ARRAY') await prisma.$executeRawUnsafe(`UPDATE "${h.tabla}" SET "${h.col.column_name}" = $1::text[] WHERE id::text = $2`, nuevo as string[], h.id);
    else if (h.col.data_type.startsWith('json')) await prisma.$executeRawUnsafe(`UPDATE "${h.tabla}" SET "${h.col.column_name}" = $1::jsonb WHERE id::text = $2`, JSON.stringify(nuevo), h.id);
    else await prisma.$executeRawUnsafe(`UPDATE "${h.tabla}" SET "${h.col.column_name}" = $1 WHERE id::text = $2`, nuevo, h.id);
  }
  console.log(`\n${rotas.size} imagen(es) rota(s).`);
  if (reparar) {
    writeFileSync('imagenes-rotas-respaldo.json', JSON.stringify(respaldo, null, 2));
    console.log(`Reparado: ${respaldo.length} celda(s). Respaldo en imagenes-rotas-respaldo.json`);
  } else console.log('Solo informe. Para quitarlas de la base: --reparar');
}

/** Texto libre con la URL dentro (p. ej. HTML de un artículo): se quita solo la URL rota. */
const quitarEnTexto = (t: string, rotas: Set<string>) => [...rotas].reduce((s, u) => s.split(u).join(''), t);

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
