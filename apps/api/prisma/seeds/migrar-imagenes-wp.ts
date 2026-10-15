/**
 * Apunta a las imágenes PROPIAS de la web las URLs que quedaron de WordPress en la base de datos:
 *
 *   https://fptecnologi.com/wp-content/uploads/2025/06/foto.png  →  https://fptecnologi.com/images/productos/2025/06/foto.png
 *
 * Solo toca las URLs de los archivos que existen en apps/web-fptecnologi/public/images/productos (las que se
 * rescataron del respaldo de WordPress); cualquier otra URL se deja igual. Recorre TODAS las columnas de texto,
 * arreglos de texto y JSON de la base, así que cubre productos, categorías, proyectos, contenido del CMS, etc.
 *
 * Uso (desde apps/api, con DATABASE_URL en .env):
 *   npx tsx prisma/seeds/migrar-imagenes-wp.ts            # SIMULA: muestra qué columnas y cuántas filas cambiarían
 *   npx tsx prisma/seeds/migrar-imagenes-wp.ts --aplicar  # aplica los cambios (en una transacción)
 * Se puede correr varias veces: lo ya migrado no vuelve a cambiar.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PrismaClient } from '../../src/generated/prisma/client.js';

for (const line of readFileSync('./.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const DESTINO = 'https://fptecnologi.com/images/productos/';
const CARPETA = '../web-fptecnologi/public/images/productos';
const aplicar = process.argv.includes('--aplicar');

function archivos(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? archivos(p) : [relative(CARPETA, p).split('\\').join('/')];
  });
}
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const rutas = archivos(CARPETA);
if (rutas.length === 0) throw new Error(`No hay imágenes en ${CARPETA}`);
// https://(www.)fptecnologi.com/wp-content/uploads/<ruta>  →  https://fptecnologi.com/images/productos/<ruta>
const PATRON = `https?://(www\\.)?fptecnologi\\.com/wp-content/uploads/(${rutas.map(escapar).join('|')})`;
const REEMPLAZO = `${DESTINO}\\2`;

const prisma = new PrismaClient();

type Col = { table_name: string; column_name: string; data_type: string; udt_name: string };

async function main() {
  console.log(`${rutas.length} imágenes propias · modo: ${aplicar ? 'APLICAR' : 'SIMULACIÓN (no cambia nada)'}\n`);
  const cols = await prisma.$queryRawUnsafe<Col[]>(`
    SELECT table_name, column_name, data_type, udt_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name <> '_prisma_migrations'
      AND (data_type IN ('text', 'character varying', 'json', 'jsonb') OR (data_type = 'ARRAY' AND udt_name IN ('_text', '_varchar')))`);

  // Primero por tabla (una consulta por tabla, no por columna): solo se revisan las columnas de las que tienen coincidencias.
  const conCoincidencias = new Set<string>();
  for (const t of new Set(cols.map((c) => c.table_name))) {
    const [{ n }] = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
      `SELECT count(*)::bigint AS n FROM "${t}" WHERE to_jsonb("${t}")::text ~ $1`, PATRON,
    );
    if (Number(n) > 0) conCoincidencias.add(t);
  }
  console.log(`Tablas con URLs de WordPress: ${[...conCoincidencias].join(', ') || '(ninguna)'}\n`);

  const tareas: { sql: string; etiqueta: string; filas: number }[] = [];
  for (const c of cols.filter((x) => conCoincidencias.has(x.table_name))) {
    const q = `"${c.table_name}"."${c.column_name}"`;
    const esArray = c.data_type === 'ARRAY';
    const comoTexto = esArray ? `array_to_string(${q}, ' ')` : `${q}::text`;
    const [{ n }] = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
      `SELECT count(*)::bigint AS n FROM "${c.table_name}" WHERE ${comoTexto} ~ $1`, PATRON,
    );
    if (Number(n) === 0) continue;
    const esJson = c.data_type === 'json' || c.data_type === 'jsonb';
    const nuevo = esArray
      ? `ARRAY(SELECT regexp_replace(x, $1, $2, 'g') FROM unnest(${q}) AS x)`
      : esJson
        ? `regexp_replace(${q}::text, $1, $2, 'g')::${c.data_type}`
        : `regexp_replace(${q}, $1, $2, 'g')`;
    tareas.push({
      sql: `UPDATE "${c.table_name}" SET "${c.column_name}" = ${nuevo} WHERE ${comoTexto} ~ $1`,
      etiqueta: `${c.table_name}.${c.column_name}`,
      filas: Number(n),
    });
  }

  if (tareas.length === 0) {
    console.log('No hay URLs de WordPress que migrar (ya está todo apuntando a las imágenes propias).');
    return;
  }
  for (const t of tareas) console.log(`  ${t.etiqueta.padEnd(40)} ${t.filas} fila(s)`);
  console.log(`\nTotal: ${tareas.reduce((a, t) => a + t.filas, 0)} fila(s) en ${tareas.length} columna(s).`);

  if (!aplicar) {
    console.log('\nSimulación: no se cambió nada. Para aplicar: npx tsx prisma/seeds/migrar-imagenes-wp.ts --aplicar');
    return;
  }
  await prisma.$transaction(tareas.map((t) => prisma.$executeRawUnsafe(t.sql, PATRON, REEMPLAZO)));
  console.log('\nListo: URLs actualizadas.');
}

main().finally(() => prisma.$disconnect());
