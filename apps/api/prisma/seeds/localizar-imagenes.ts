/**
 * Copia a NUESTRO servidor las imágenes que en la base de datos apuntan a otras webs (WordPress viejo, webs de marcas,
 * bancos de imágenes…) y cambia la URL por la propia (`<PUBLIC_API_URL>/uploads/externas/<hash>.<ext>`).
 * Así, si esa web borra la imagen o se cae, la nuestra no se ve rota. Desde ahora la API hace lo mismo sola al
 * guardar (src/prisma/imagenes-externas.extension.ts); este script es para lo que ya estaba guardado.
 *
 * Recorre TODAS las columnas de texto, arreglos de texto y JSON de todas las tablas (productos, categorías, blog,
 * servicios, proyectos, clientes, marcas, CMS, landings, popups, tarjetas…).
 *
 * IMPORTANTE: córrelo EN EL SERVIDOR DE LA API (cPanel → terminal, carpeta de la API), porque las imágenes se guardan en
 * su UPLOADS_DIR, con el mismo .env (DATABASE_URL, PUBLIC_API_URL, UPLOADS_DIR). Hazlo mientras el WordPress viejo siga
 * en línea: lo que ya no exista no se puede descargar (queda listado al final).
 *
 *   npx tsx prisma/seeds/localizar-imagenes.ts            # SIMULA: lista qué URLs encontró y dónde
 *   npx tsx prisma/seeds/localizar-imagenes.ts --aplicar  # descarga y actualiza la base
 * Se puede correr varias veces: lo ya copiado no se vuelve a descargar ni a cambiar.
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../../src/generated/prisma/client.js';

for (const line of readFileSync('./.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const { esImagenExterna, localizarImagen } = await import('../../src/uploads/imagenes-externas.js');

const aplicar = process.argv.includes('--aplicar');
const URL_EN_TEXTO = /https?:\/\/[^\s"'<>\\),]+/g;
const prisma = new PrismaClient();

type Col = { table_name: string; column_name: string; data_type: string };
type Fila = { k: string } & Record<string, unknown>;

/** URLs de imágenes externas dentro de un valor de la base (texto, arreglo o JSON). */
const urlsDe = (v: unknown) => [...new Set((JSON.stringify(v ?? '').replace(/\\\//g, '/').match(URL_EN_TEXTO) ?? []).filter(esImagenExterna))];

/** Reemplaza las URLs en el valor (respetando su tipo). */
function reemplazar(v: unknown, mapa: Map<string, string>): unknown {
  if (typeof v === 'string') return mapa.get(v) ?? [...mapa].reduce((t, [de, a]) => t.split(de).join(a), v);
  if (Array.isArray(v)) return v.map((x) => reemplazar(x, mapa));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, reemplazar(x, mapa)]));
  return v;
}

async function main() {
  console.log(`Modo: ${aplicar ? 'APLICAR (descarga y actualiza)' : 'SIMULACIÓN (no cambia nada)'} · destino ${process.env.PUBLIC_API_URL ?? '(PUBLIC_API_URL sin definir)'}\n`);
  if (aplicar && !process.env.PUBLIC_API_URL) throw new Error('Define PUBLIC_API_URL en .env (la URL pública de esta API) antes de aplicar.');

  const cols = await prisma.$queryRawUnsafe<Col[]>(`
    SELECT table_name, column_name, data_type FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name <> '_prisma_migrations'
      AND (data_type IN ('text', 'character varying', 'json', 'jsonb') OR (data_type = 'ARRAY' AND udt_name IN ('_text', '_varchar')))`);

  // Por tabla: una lectura con todas sus columnas candidatas y, al aplicar, un solo UPDATE por fila (ctid cambia al actualizar).
  const porTabla = new Map<string, Col[]>();
  for (const c of cols) porTabla.set(c.table_name, [...(porTabla.get(c.table_name) ?? []), c]);
  const encontrados: { tabla: string; cols: Col[]; filas: Fila[]; urls: string[] }[] = [];
  for (const [tabla, cs] of porTabla) {
    const filas = await prisma.$queryRawUnsafe<Fila[]>(
      `SELECT ctid::text AS k, ${cs.map((c) => `"${c.column_name}"`).join(', ')} FROM "${tabla}" WHERE to_jsonb("${tabla}")::text ~ 'https?://'`,
    );
    const conUrls = filas.filter((f) => cs.some((c) => urlsDe(f[c.column_name]).length > 0));
    if (!conUrls.length) continue;
    const usadas = cs.filter((c) => conUrls.some((f) => urlsDe(f[c.column_name]).length > 0));
    encontrados.push({ tabla, cols: usadas, filas: conUrls, urls: [...new Set(conUrls.flatMap((f) => usadas.flatMap((c) => urlsDe(f[c.column_name]))))] });
  }

  const todas = [...new Set(encontrados.flatMap((e) => e.urls))];
  if (todas.length === 0) {
    console.log('No hay imágenes de webs externas en la base: todo se sirve desde nuestro servidor.');
    return;
  }
  for (const e of encontrados) console.log(`  ${`${e.tabla} (${e.cols.map((c) => c.column_name).join(', ')})`.padEnd(48)} ${e.filas.length} fila(s), ${e.urls.length} imagen(es)`);
  const hosts = new Map<string, number>();
  for (const u of todas) hosts.set(new URL(u).hostname, (hosts.get(new URL(u).hostname) ?? 0) + 1);
  console.log(`\n${todas.length} imagen(es) externa(s) distinta(s), de: ${[...hosts].map(([h, n]) => `${h} (${n})`).join(', ')}`);

  if (!aplicar) {
    console.log('\nSimulación: no se descargó ni cambió nada. Para aplicar: npx tsx prisma/seeds/localizar-imagenes.ts --aplicar');
    return;
  }

  // Descarga (4 a la vez) y arma el mapa URL externa → URL propia.
  const mapa = new Map<string, string>();
  const fallidas: string[] = [];
  for (let i = 0; i < todas.length; i += 4) {
    await Promise.all(todas.slice(i, i + 4).map(async (u) => {
      const propia = await localizarImagen(u);
      if (propia === u) fallidas.push(u);
      else mapa.set(u, propia);
    }));
    process.stdout.write(`\rDescargadas ${Math.min(i + 4, todas.length)}/${todas.length}`);
  }
  console.log('\n');

  const tipoDe = (c: Col) => (c.data_type === 'ARRAY' ? 'text[]' : c.data_type === 'json' || c.data_type === 'jsonb' ? c.data_type : 'text');
  let cambiadas = 0;
  await prisma.$transaction(async (tx) => {
    for (const { tabla, cols: cs, filas } of encontrados) {
      for (const f of filas) {
        const cambios = cs
          .map((c) => ({ c, nuevo: reemplazar(f[c.column_name], mapa) }))
          .filter(({ c, nuevo }) => JSON.stringify(nuevo) !== JSON.stringify(f[c.column_name]));
        if (!cambios.length) continue;
        const valores = cambios.map(({ c, nuevo }) => (tipoDe(c) === 'json' || tipoDe(c) === 'jsonb' ? JSON.stringify(nuevo) : nuevo));
        const set = cambios.map(({ c }, i) => `"${c.column_name}" = $${i + 1}::${tipoDe(c)}`).join(', ');
        await tx.$executeRawUnsafe(`UPDATE "${tabla}" SET ${set} WHERE ctid = $${cambios.length + 1}::tid`, ...valores, f.k);
        cambiadas++;
      }
    }
  }, { timeout: 120_000 });
  console.log(`Listo: ${mapa.size} imagen(es) copiadas a nuestro servidor, ${cambiadas} fila(s) actualizadas.`);
  if (fallidas.length) {
    console.log(`\n${fallidas.length} no se pudieron descargar (la web de origen ya no las tiene o no son imágenes). Quedaron con su URL; súbelas a mano desde el dashboard:`);
    for (const u of fallidas) console.log(`  - ${u}`);
  }
}

main().finally(() => prisma.$disconnect());
